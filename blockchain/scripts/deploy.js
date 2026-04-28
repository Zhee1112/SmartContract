const { ethers } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  const [deployer, taxWallet, arbitrator, pm2, worker1] = await ethers.getSigners();
  console.log("=".repeat(60));
  console.log("  IDR Payroll System v2 — Deploy");
  console.log("=".repeat(60));
  console.log("Deployer  :", deployer.address);
  console.log("TaxWallet :", taxWallet.address);
  console.log("Arbitrator:", arbitrator.address);

  // ── 1. RupiahToken ──────────────────────────────────────────
  console.log("\n[1/3] Deploying RupiahToken...");
  const RupiahToken = await ethers.getContractFactory("RupiahToken");
  const idrt        = await RupiahToken.deploy(1_000_000_000);
  await idrt.waitForDeployment();
  const idrtAddr    = await idrt.getAddress();
  console.log("✅ RupiahToken :", idrtAddr);

  // ── 2. ProjectRegistry ──────────────────────────────────────
  console.log("\n[2/3] Deploying ProjectRegistry...");
  const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
  const registry        = await ProjectRegistry.deploy(idrtAddr);
  await registry.waitForDeployment();
  const registryAddr    = await registry.getAddress();
  console.log("✅ ProjectRegistry:", registryAddr);

  // ── 3. PayrollManager v2 ────────────────────────────────────
  console.log("\n[3/3] Deploying PayrollManager v2...");
  const PayrollManager = await ethers.getContractFactory("PayrollManager");
  const payroll        = await PayrollManager.deploy(
    idrtAddr, taxWallet.address, arbitrator.address
  );
  await payroll.waitForDeployment();
  const payrollAddr    = await payroll.getAddress();
  console.log("✅ PayrollManager:", payrollAddr);

  // ── Seed: kirim IDRT ke beberapa akun ────────────────────────
  console.log("\n[Setup] Distributing IDRT to demo accounts...");
  const accounts = [deployer, pm2, worker1];
  for (const acc of accounts) {
    await idrt.transfer(acc.address, 50_000_000n); // 50 Juta per akun
    console.log(`  → ${acc.address.slice(0,8)}... terima 50.000.000 IDRT`);
  }

  // ── Save & copy ABIs ─────────────────────────────────────────
  const deployData = {
    network:   (await ethers.provider.getNetwork()).name,
    chainId:   Number((await ethers.provider.getNetwork()).chainId),
    timestamp: new Date().toISOString(),
    contracts: {
      RupiahToken:     { address: idrtAddr },
      ProjectRegistry: { address: registryAddr },
      PayrollManager:  { address: payrollAddr, taxWallet: taxWallet.address, arbitrator: arbitrator.address },
    },
    accounts: {
      deployer:   deployer.address,
      taxWallet:  taxWallet.address,
      arbitrator: arbitrator.address,
    }
  };

  const deployDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });
  fs.writeFileSync(path.join(deployDir, "latest.json"), JSON.stringify(deployData, null, 2));

  copyABIs({ idrtAddr, registryAddr, payrollAddr });

  console.log("\n" + "=".repeat(60));
  console.log("  SEMUA KONTRAK BERHASIL DI-DEPLOY!");
  console.log("=".repeat(60));
  Object.entries(deployData.contracts).forEach(([name, c]) => {
    console.log(`  ${name.padEnd(18)}: ${c.address}`);
  });
}

function copyABIs({ idrtAddr, registryAddr, payrollAddr }) {
  const art  = path.join(__dirname, "..", "artifacts", "contracts");
  const dest = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const contracts = [
    { file: "RupiahToken.sol/RupiahToken.json",         addr: idrtAddr,      out: "RupiahToken.json" },
    { file: "ProjectRegistry.sol/ProjectRegistry.json", addr: registryAddr,  out: "ProjectRegistry.json" },
    { file: "PayrollManager.sol/PayrollManager.json",   addr: payrollAddr,   out: "PayrollManager.json" },
  ];

  contracts.forEach(({ file, addr, out }) => {
    try {
      const artifact = JSON.parse(fs.readFileSync(path.join(art, file)));
      fs.writeFileSync(path.join(dest, out), JSON.stringify({ address: addr, abi: artifact.abi }, null, 2));
      console.log(`✅ ABI copied: ${out}`);
    } catch { console.log(`⚠️  Compile dulu: ${file}`); }
  });
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
