const { expect }        = require("chai");
const { ethers }        = require("hardhat");
const { loadFixture }   = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// ================================================================
// FIXTURE: Deploy semua kontrak sekali, dipakai ulang di tiap test
// ================================================================
async function deployFixture() {
  const [owner, pm, worker, taxWallet, other] = await ethers.getSigners();

  // Deploy RupiahToken
  const RupiahToken = await ethers.getContractFactory("RupiahToken");
  const idrToken    = await RupiahToken.deploy(1_000_000_000);
  await idrToken.waitForDeployment();

  // Deploy PayrollManager
  const PayrollManager  = await ethers.getContractFactory("PayrollManager");
  const payrollManager  = await PayrollManager.deploy(
    await idrToken.getAddress(),
    taxWallet.address
  );
  await payrollManager.waitForDeployment();

  // Kirim 10 Juta IDRT ke PM untuk testing
  const pmFund = 10_000_000n;
  await idrToken.transfer(pm.address, pmFund);

  return { idrToken, payrollManager, owner, pm, worker, taxWallet, other, pmFund };
}

// ================================================================
// TEST SUITE 1: RupiahToken
// ================================================================
describe("RupiahToken (IDRT)", function () {
  it("Harus punya nama 'Rupiah Digital' dan simbol 'IDRT'", async () => {
    const { idrToken } = await loadFixture(deployFixture);
    expect(await idrToken.name()).to.equal("Rupiah Digital");
    expect(await idrToken.symbol()).to.equal("IDRT");
  });

  it("Decimals harus 0 (1 Token = 1 Rupiah)", async () => {
    const { idrToken } = await loadFixture(deployFixture);
    expect(await idrToken.decimals()).to.equal(0);
  });

  it("Owner bisa mint token baru", async () => {
    const { idrToken, owner, other } = await loadFixture(deployFixture);
    await idrToken.connect(owner).mint(other.address, 500_000n);
    expect(await idrToken.balanceOf(other.address)).to.equal(500_000n);
  });

  it("Non-owner TIDAK bisa mint token", async () => {
    const { idrToken, pm, other } = await loadFixture(deployFixture);
    await expect(
      idrToken.connect(pm).mint(other.address, 100n)
    ).to.be.revertedWithCustomError(idrToken, "OwnableUnauthorizedAccount");
  });

  it("User bisa burn token miliknya sendiri", async () => {
    const { idrToken, pm } = await loadFixture(deployFixture);
    const before = await idrToken.balanceOf(pm.address);
    await idrToken.connect(pm).burn(1_000n);
    expect(await idrToken.balanceOf(pm.address)).to.equal(before - 1_000n);
  });
});

// ================================================================
// TEST SUITE 2: PayrollManager - Budget
// ================================================================
describe("PayrollManager: Deposit & Withdraw Budget", function () {
  it("PM bisa deposit budget ke kontrak", async () => {
    const { idrToken, payrollManager, pm } = await loadFixture(deployFixture);
    const payrollAddr = await payrollManager.getAddress();

    // PM approve dulu
    await idrToken.connect(pm).approve(payrollAddr, 1_000_000n);
    await payrollManager.connect(pm).depositBudget(1_000_000n);

    expect(await payrollManager.getPMBudget(pm.address)).to.equal(1_000_000n);
  });

  it("PM bisa tarik kembali budget yang idle", async () => {
    const { idrToken, payrollManager, pm } = await loadFixture(deployFixture);
    const payrollAddr = await payrollManager.getAddress();

    await idrToken.connect(pm).approve(payrollAddr, 2_000_000n);
    await payrollManager.connect(pm).depositBudget(2_000_000n);
    await payrollManager.connect(pm).withdrawBudget(500_000n);

    expect(await payrollManager.getPMBudget(pm.address)).to.equal(1_500_000n);
  });
});

// ================================================================
// TEST SUITE 3: PayrollManager - Full Payroll Flow
// ================================================================
describe("PayrollManager: Alur Penggajian Lengkap", function () {

  // Helper: deposit budget PM dan buat task
  async function setupWithTask({ idrToken, payrollManager, pm, worker }) {
    const payrollAddr = await payrollManager.getAddress();
    await idrToken.connect(pm).approve(payrollAddr, 5_000_000n);
    await payrollManager.connect(pm).depositBudget(5_000_000n);

    const tx = await payrollManager.connect(pm).createTask(
      "Membuat laporan keuangan Q1 2024",
      worker.address,
      1_000_000n // Rp 1.000.000
    );
    const receipt = await tx.wait();
    const event   = receipt.logs.find(
      (l) => l.fragment?.name === "TaskCreated"
    );
    const taskId  = event.args[0];
    return taskId;
  }

  it("PM bisa membuat task dan dana terkunci (escrowed)", async () => {
    const fixture    = await loadFixture(deployFixture);
    const { payrollManager, pm } = fixture;
    const taskId     = await setupWithTask(fixture);
    const task       = await payrollManager.getTask(taskId);

    expect(task.status).to.equal(0); // OPEN
    expect(task.salary).to.equal(1_000_000n);
    expect(await payrollManager.getPMBudget(pm.address)).to.equal(4_000_000n); // 5jt - 1jt
  });

  it("Worker bisa mengklaim task", async () => {
    const fixture    = await loadFixture(deployFixture);
    const { payrollManager, worker } = fixture;
    const taskId     = await setupWithTask(fixture);

    await payrollManager.connect(worker).claimTask(taskId);
    const task = await payrollManager.getTask(taskId);
    expect(task.status).to.equal(1); // CLAIMED
  });

  it("Worker bisa submit bukti kerja", async () => {
    const fixture    = await loadFixture(deployFixture);
    const { payrollManager, worker } = fixture;
    const taskId     = await setupWithTask(fixture);

    await payrollManager.connect(worker).claimTask(taskId);
    await payrollManager.connect(worker).submitWork(taskId, "https://drive.google.com/laporan-q1");
    const task = await payrollManager.getTask(taskId);
    expect(task.status).to.equal(2); // SUBMITTED
    expect(task.submissionProof).to.equal("https://drive.google.com/laporan-q1");
  });

  it("🎯 DEMO SEMPRO: Approve menghasilkan transfer gaji & pajak yang tepat", async () => {
    const fixture = await loadFixture(deployFixture);
    const { idrToken, payrollManager, pm, worker, taxWallet } = fixture;

    // Setup
    const taskId = await setupWithTask(fixture);
    await payrollManager.connect(worker).claimTask(taskId);
    await payrollManager.connect(worker).submitWork(taskId, "https://docs.example.com/hasil");

    // Catat saldo sebelum
    const workerBefore = await idrToken.balanceOf(worker.address);
    const taxBefore    = await idrToken.balanceOf(taxWallet.address);

    // PM approve task
    await payrollManager.connect(pm).approveTask(taskId);

    // Verifikasi saldo sesudah
    const workerAfter  = await idrToken.balanceOf(worker.address);
    const taxAfter     = await idrToken.balanceOf(taxWallet.address);

    // Gaji Rp 1.000.000 → Worker dapat Rp 950.000, Pajak Rp 50.000
    expect(workerAfter - workerBefore).to.equal(950_000n); // ✅ Gaji bersih
    expect(taxAfter   - taxBefore).to.equal(50_000n);      // ✅ PPh 21 (5%)

    // Status task harus COMPLETED
    const task = await payrollManager.getTask(taskId);
    expect(task.status).to.equal(3); // COMPLETED
    expect(task.netSalary).to.equal(950_000n);
    expect(task.taxAmount).to.equal(50_000n);

    console.log("\n  === DEMO SEMPRO ===");
    console.log(`  Input Gaji    : Rp 1.000.000`);
    console.log(`  Gaji Bersih   : Rp 950.000 → Wallet Worker`);
    console.log(`  PPh 21 (5%)   : Rp  50.000 → Wallet Pajak`);
    console.log(`  Status        : COMPLETED ✅`);
  });

  it("PM bisa batalkan task OPEN dan dana dikembalikan", async () => {
    const fixture = await loadFixture(deployFixture);
    const { payrollManager, pm } = fixture;
    const taskId  = await setupWithTask(fixture);

    const budgetBefore = await payrollManager.getPMBudget(pm.address);
    await payrollManager.connect(pm).cancelTask(taskId);
    const budgetAfter  = await payrollManager.getPMBudget(pm.address);

    expect(budgetAfter - budgetBefore).to.equal(1_000_000n); // Dana kembali
    const task = await payrollManager.getTask(taskId);
    expect(task.status).to.equal(4); // CANCELLED
  });

  it("Worker lain TIDAK bisa klaim task orang lain", async () => {
    const fixture = await loadFixture(deployFixture);
    const { payrollManager, other } = fixture;
    const taskId  = await setupWithTask(fixture);

    await expect(
      payrollManager.connect(other).claimTask(taskId)
    ).to.be.revertedWith("PayrollManager: Bukan worker task ini");
  });

  it("calculateTax() harus return nilai yang akurat", async () => {
    const { payrollManager } = await loadFixture(deployFixture);
    const [gross, tax, net]  = await payrollManager.calculateTax(1_000_000n);
    expect(gross).to.equal(1_000_000n);
    expect(tax).to.equal(50_000n);
    expect(net).to.equal(950_000n);
  });
});
