# IDR Payroll System v2 — Dokumentasi Teknis

## Apa yang Ditambahkan di v2

### Smart Contracts (3 Kontrak)

| Kontrak | Fitur Baru |
|---------|-----------|
| `RupiahToken.sol` | Tidak berubah (ERC-20 stabil) |
| `ProjectRegistry.sol` | **BARU** — Proyek, budget tracker, multi-PM, whitelist worker |
| `PayrollManager.sol` | **UPGRADE** — Milestone, Dispute, Progressive PPh 21, Auto-approve, Rating |

### Fitur Baru PayrollManager v2

- **Milestone Payment** — Task dibagi jadi beberapa tahap, bayar per milestone
- **Dispute Mechanism** — Worker bisa ajukan sengketa jika PM tidak adil
- **Progressive PPh 21** — Bracket 5%, 15%, 25%, 30% sesuai nominal gaji
- **Auto-Approve** — PM yang lalai: task otomatis approve setelah X hari
- **Worker Rating** — PM beri nilai 1-5 setelah task selesai
- **Worker Stats** — Total penghasilan, completed tasks, rata-rata rating on-chain
- **Arbitrator Role** — Alamat khusus untuk menyelesaikan dispute secara netral
- **Category System** — Setiap task punya kategori (IT, Finance, HR, dll.)
- **Project Association** — Task dapat dikaitkan ke Project ID

### Frontend (5 Halaman)

| Halaman | Fungsi |
|---------|--------|
| 👔 Project Manager | Deposit, buat task biasa/milestone, approve, cancel |
| 🧑‍💻 Worker | Klaim, submit bukti, submit milestone, ajukan dispute, filter task |
| 🏗️ Proyek | Buat proyek, pantau budget utilization & progress timeline |
| 📊 Analytics | SVG charts, tax bracket distribution, top workers leaderboard |
| ⚙️ Admin Panel | Mint token, ganti tax wallet/arbitrator, resolusi dispute |

---

## Cara Jalankan

```bash
# Terminal 1 — Blockchain node
cd blockchain && npx hardhat node

# Terminal 2 — Deploy
cd blockchain && npm run deploy:local

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Buka: **http://localhost:3001**

---

## Akun Demo (Hardhat)

| Peran | Address | Private Key |
|-------|---------|-------------|
| **Deployer / Owner** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Tax Wallet** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Arbitrator** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| **PM2** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| **Worker1** | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

> Semua akun sudah mendapat **50 Juta IDRT** dari script deploy.

---

## Skenario Demo Sempro (Lengkap)

### Skenario A — Alur Normal
1. Login sebagai **Deployer** (PM)
2. Deposit **Rp 5.000.000** ke kontrak
3. Buat task untuk Worker1, gaji **Rp 1.000.000**
4. Pindah ke MetaMask Worker1 → Klaim task
5. Worker submit bukti kerja (URL)
6. PM approve → **Worker +Rp 950.000, Pajak +Rp 50.000**

### Skenario B — Milestone Payment
1. PM buat task dengan **3 milestone** (Rp 300rb + Rp 400rb + Rp 300rb)
2. Worker submit milestone 1 → PM approve → Worker dapat Rp 285rb
3. Proses berlanjut per milestone
4. Progress bar update real-time di UI

### Skenario C — Dispute & Arbitrase
1. Worker submit bukti → PM tidak approve
2. Worker klik **"Ajukan Dispute"** dengan alasan
3. Login sebagai Arbitrator → Admin Panel → Resolusi Dispute
4. Pilih "Worker Menang" → gaji otomatis dibayar on-chain

### Kalkulasi PPh 21 Progresif
| Gaji | Bracket | PPh | Gaji Bersih |
|------|---------|-----|-------------|
| Rp 1.000.000 | 5% | Rp 50.000 | Rp 950.000 |
| Rp 10.000.000 | 15% | Rp 1.500.000 | Rp 8.500.000 |
| Rp 100.000.000 | 25% | Rp 25.000.000 | Rp 75.000.000 |
| Rp 600.000.000 | 30% | Rp 180.000.000 | Rp 420.000.000 |

---

## MetaMask Setup

**Tambah Jaringan Hardhat:**
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency: `ETH`

**Import akun** dengan Private Key dari tabel di atas.
