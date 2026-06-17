var HELP_DATA = {
    '01': {
        title: 'Bagian 01: Apa yang Diteliti?',
        content: '<p>Penelitian ini membandingkan <strong>4 cara membuat smart contract bridge</strong> — penghubung aset antar blockchain. Setiap "tier" (tingkatan) memiliki tingkat keamanan dan biaya gas yang berbeda.</p><div class="help-highlight"><strong>Analogi sederhana:</strong> Seperti memilih jenis pintu keamanan untuk rumah. Tier A = tanpa kunci (siapa saja bisa masuk), Tier B = gembok biasa, Tier C = brankas mahal, Tier D = kunci pintar yang murah tapi aman.</div><ul><li><strong>Tier A (Baseline)</strong>: Bridge tanpa perlindungan. Gas paling murah, tapi reentrancy attack bisa menguras semua dana.</li><li><strong>Tier B (Static)</strong>: Ditambah CEI pattern & packing. Hanya 15 gas lebih mahal dari A. Tapi hanya melindungi dari 1 jenis serangan.</li><li><strong>Tier C (Full Dynamic)</strong>: EIP-1153 + EWS + MEV protection. Paling aman (100%), tapi gas 4x lebih mahal karena 5-6 panggilan external ke MonitorMock.</li><li><strong>Tier D (Lightweight)</strong>: Sama amannya dengan C (100%), tapi semua fitur di-inline tanpa external calls. Gas hanya 8.7% lebih mahal dari B. <strong>Ini kontribusi penelitian.</strong></li></ul><p>Kenapa penting? Kerugian akibat serangan bridge mencapai <strong>$2 miliar dalam 3 tahun terakhir</strong> (Ronin $620M, Wormhole $320M).</p>'
    },
    '02': {
        title: 'Bagian 02: Validasi Keamanan',
        content: '<p>Setiap tier diuji keamanannya terhadap <strong>8 fitur keamanan</strong>. Skor dihitung dari berapa banyak fitur yang aktif.</p><ul><li><strong>Reentrancy Single-function</strong>: Serangan rekursif pada 1 fungsi → Tier B/C/D blokir</li><li><strong>Reentrancy Cross-function</strong>: Serangan rekursif ke fungsi lain → Hanya C/D blokir</li><li><strong>Reentrancy Consecutive</strong>: 3x serangan berturut-turut → Hanya C/D blokir</li><li><strong>MEV Sandwich Detection</strong>: Deteksi front-running → Hanya C/D aktif</li><li><strong>Economic Penalty</strong>: Denda otomatis untuk attacker → Hanya C/D</li><li><strong>Emergency Pause</strong>: Tombol darurat jika ada celah keamanan → Hanya C/D</li><li><strong>Block Tracking</strong>: Pelacakan waktu transaksi → Hanya C/D</li><li><strong>Custom Errors</strong>: Menghemat gas saat error → B/C/D</li></ul><div class="help-highlight"><strong>Hasil</strong>: Tier A = 0%, Tier B = 25%, Tier C = 100%, Tier D = 100%. Tier D sama amannya dengan C, tapi jauh lebih murah.</div>'
    },
    '03': {
        title: 'Bagian 03: Mengapa Harga Gas Beda?',
        content: '<p>Gas adalah biaya komputasi di Ethereum. Makin banyak "pekerjaan", makin mahal. Berikut kenapa tiap tier beda harga:</p><ul><li><strong>Tier A (31,412 gas)</strong>: Hanya SSTORE + SLOAD + Transfer. Paling dasar.</li><li><strong>Tier B (31,427 gas)</strong>: Sama dengan A + CEI pattern (compile-time). Tambah 15 gas saja karena tidak ada runtime cost.</li><li><strong>Tier C (122,769 gas)</strong>: <span style="color:var(--red)">75.6% overhead!</span> 5 panggilan ke MonitorMock (~22,000 gas), dynamic array SSTORE (22,100 gas), ABI encoding (15,000 gas), cold code loading (13,000 gas).</li><li><strong>Tier D (34,156 gas)</strong>: <span style="color:var(--green)">Hanya 8.7% lebih mahal dari B</span>. TSTORE/TLOAD inline (300 gas), single-slot MEV (2,900 gas), penalty pure math (300 gas). 0 external calls.</li></ul><div class="help-highlight"><strong>Inti masalah Tier C</strong>: Setiap kali panggil fungsi di kontrak lain (external call), EVM harus: (1) load kode kontrak itu (~5,000 gas), (2) encode parameter (~3,750 gas), (3) eksekusi, (4) decode hasil (~3,750 gas). Kalau 5 panggilan = 5x biaya ini.</div><p><strong>Solusi Tier D</strong>: Semua logika ditulis langsung di dalam bridge (inline). Tidak perlu panggil kontrak lain. Biaya TSTORE/TLOAD hanya 100 gas per operasi — sangat murah.</p>'
    },
    '04': {
        title: 'Bagian 04: Statis vs Dinamis',
        content: '<p>Fitur bridge dibagi menjadi 2 kategori:</p><ul><li><strong>Fitur Statis (Compile-Time)</strong>: Optimasi yang dilakukan saat kode dikompilasi. Tidak menambah biaya gas saat transaksi berjalan. Contoh: CEI pattern, variable packing, custom errors.</li><li><strong>Fitur Dinamis (Runtime)</strong>: Keamanan aktif yang berjalan saat transaksi. Ini yang menambah biaya gas. Contoh: reentrancy guard, MEV detection, emergency pause.</li></ul><div class="help-highlight"><strong>Temuan penting</strong>:<br>• Tier A = 0 fitur statis + 0 fitur dinamis = <strong>0/11</strong><br>• Tier B = 5 fitur statis + 0 fitur dinamis = <strong>5/11</strong><br>• Tier C = 5 fitur statis + 6 fitur dinamis = <strong>11/11</strong> (tapi mahal)<br>• Tier D = 5 fitur statis + 6 fitur dinamis = <strong>11/11</strong> (tapi murah!)</div><p>Tier D membuktikan bahwa semua fitur dinamis bisa ditambahkan tanpa biaya besar, asalkan diimplementasikan secara inline.</p>'
    },
    '05': {
        title: 'Bagian 05: Cost-Effectiveness (SPG)',
        content: '<p><strong>SPG (Security Points per Gas)</strong> adalah metrik untuk mengukur seberapa efisien sebuah bridge dalam mengubah biaya gas menjadi keamanan.</p><div class="help-highlight"><strong>Rumus:</strong><br><code>SPG = (Skor Keamanan / Gas Deposit) × 1.000.000</code></div><p><strong>Contoh perhitungan Tier D:</strong></p><ul><li>Skor Keamanan = <strong>8</strong> (dari 8 fitur aktif: reentrancy, MEV, penalty, pause, block tracking, EIP-1153, custom errors, dll)</li><li>Gas Deposit = <strong>34,156</strong> (dari pengukuran 100 sampel di Foundry)</li><li>SPG = (8 / 34,156) × 1.000.000 = <strong>220.1</strong></li></ul><p><strong>Perbandingan:</strong></p><ul><li>Tier D: 8 / 34,156 × 1M = <strong>220.1 SPG</strong> (paling efisien)</li><li>Tier C: 8 / 122,769 × 1M = <strong>65.2 SPG</strong> (keamanan sama, tapi gas 3.6x lebih mahal)</li><li>Tier B: 2 / 31,427 × 1M = <strong>63.6 SPG</strong> (gas murah, tapi keamanan rendah)</li><li>Tier A: 0 / 31,412 × 1M = <strong>0.0 SPG</strong> (tidak ada keamanan)</li></ul><div class="help-highlight"><strong>Intinya</strong>: SPG = "Berapa banyak keamanan yang saya dapatkan per gas yang saya bayar?" Tier D memberikan 3.4x lebih banyak keamanan per gas dibanding Tier C.</div>'
    },
    '06': {
        title: 'Bagian 06: Biaya Real-World (USD)',
        content: '<p>Biaya transaksi di Ethereum = <strong>Gas Units × Gas Price × ETH Price</strong>.</p><p>Data gas dari pengukuran Foundry (100 sampel), gas price dari Etherscan real-time (0.55 Gwei saat ini).</p><ul><li><strong>Saat ini (0.55 Gwei)</strong>: Tier A/B/D sekitar $0.04. Tier C $0.17 (4x lebih mahal).</li><li><strong>Normal (10 Gwei)</strong>: Tier A/B/D sekitar $0.79. Tier C $3.07.</li><li><strong>Sibuk (30 Gwei)</strong>: Tier A/B/D sekitar $2.36. Tier C $9.21.</li><li><strong>Sangat sibuk (80 Gwei)</strong>: Tier A/B/D sekitar $6.28. Tier C $24.55.</li></ul><div class="help-highlight"><strong>Mengapa Tier A dan B hampir sama?</strong> Karena optimasi statis (CEI, packing) hanya mengubah kode saat compile-time. Tidak ada tambahan gas runtime.</div><p><strong>Mengapa Tier D murah?</strong> Karena semua fitur keamanan di-inline. Tidak ada external calls yang mahal. TSTORE/TLOAD hanya 100 gas per operasi.</p>'
    },
    '09': {
        title: 'Bagian 09: Kesimpulan & Kontribusi',
        content: '<p>Temuan utama penelitian ini:</p><ul><li><strong>Modifikasi EIP-1153</strong>: Dari 1 fungsi (reentrancy guard, 200 gas) menjadi 5 fungsi keamanan (9,900 gas) — 48.5x lebih murah dari Tier C.</li><li><strong>Tier D = kontribusi penelitian</strong>: Semua fitur keamanan Tier C (100%) dengan biaya gas hanya 8.7% lebih tinggi dari baseline.</li><li><strong>Penghematan vs Tier C</strong>: Deposit -72%, Withdraw -88%, Swap -53%.</li><li><strong>215/215 tests pass</strong> di 13 test suites.</li></ul><div class="help-highlight"><strong>Kesimpulan</strong>: EIP-1153 (2024) bisa dimodifikasi dari sekadar reentrancy guard menjadi pertahanan multiguna (MEV + penalty + pause) dengan biaya gas yang sangat terkendali. Tier D membuktikan bahwa keamanan tinggi tidak harus mahal.</div>'
    }
};

function showHelp(section) {
    var d = HELP_DATA[section];
    if (!d) return;
    document.getElementById('helpTitle').textContent = d.title;
    document.getElementById('helpContent').innerHTML = d.content;
    document.getElementById('helpOverlay').classList.add('show');
}
function closeHelp() {
    document.getElementById('helpOverlay').classList.remove('show');
}
function bindHelpOverlay() {
    var ho = document.getElementById('helpOverlay');
    if (ho) ho.addEventListener('click', function(e) {
        if (e.target === this) closeHelp();
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindHelpOverlay);
} else {
    bindHelpOverlay();
}

var BG = { deposit: { unopt: 31412, stat: 31427, dyn: 122769, light: 34156 }, withdraw: { unopt: 9735, stat: 9727, dyn: 104806, light: 12119 }, swap: { unopt: 10593, stat: 10494, dyn: 103825, light: 13443 } };

var BAR_BG = { A: 'rgba(185,28,28,.82)', B: 'rgba(180,83,9,.82)', C: 'rgba(13,122,63,.82)', D: 'rgba(99,102,241,.82)' };
var BAR_BC = { A: '#b91c1c', B: '#b45309', C: '#0d7a3f', D: '#6366f1' };

function initEthCharts() {
var bc = document.getElementById('bridgeChart');
if (bc) {
    var ctx = bc.getContext('2d');
    charts.push(new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Deposit', 'Withdraw', 'Swap'],
        datasets: [
            { label: '[A] Unoptimized', data: [BG.deposit.unopt, BG.withdraw.unopt, BG.swap.unopt], backgroundColor: BAR_BG.A, borderColor: BAR_BC.A, borderWidth: 2, borderRadius: 4 },
            { label: '[B] Static Only', data: [BG.deposit.stat, BG.withdraw.stat, BG.swap.stat], backgroundColor: BAR_BG.B, borderColor: BAR_BC.B, borderWidth: 2, borderRadius: 4 },
            { label: '[C] Full Dynamic', data: [BG.deposit.dyn, BG.withdraw.dyn, BG.swap.dyn], backgroundColor: BAR_BG.C, borderColor: BAR_BC.C, borderWidth: 2, borderRadius: 4 },
            { label: '[D] Lightweight', data: [BG.deposit.light, BG.withdraw.light, BG.swap.light], backgroundColor: BAR_BG.D, borderColor: BAR_BC.D, borderWidth: 2, borderRadius: 4 }
        ]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        barPercentage: 0.96, categoryPercentage: 0.88,
        plugins: { legend: { labels: { color: '#6b7280', usePointStyle: true, padding: 16, font: { family: "'IBM Plex Sans'", size: 12 } } }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6, callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() + ' gas'; } } } },
        scales: { x: { ticks: { color: '#6b7280' }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'Gas Units', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } }
    }
    }));
}

var sc = document.getElementById('savingsChart');
if (sc) {
    var bins = 15, bw = .02, mean = 98.2057, std = .011923, sb = mean - bins * bw / 2, sL = [], sD = [];
    for (var i = 0; i < bins; i++) { var lo = sb + i * bw; sL.push(lo.toFixed(2) + '%'); var x = (lo + bw / 2 - mean) / std; sD.push(Math.round(Math.exp(-.5 * x * x) / (std * Math.sqrt(2 * Math.PI)) * 100 * bw)); }
    charts.push(new Chart(sc.getContext('2d'), {
    type: 'bar',
    data: { labels: sL, datasets: [{ label: 'Frekuensi', data: sD, backgroundColor: 'rgba(13,122,63,.75)', borderColor: '#0d7a3f', borderWidth: 2, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, barPercentage: 0.96, categoryPercentage: 0.88, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6, callbacks: { label: function(ctx) { return ctx.parsed.y + ' dari 100 percobaan'; } } } }, scales: { x: { ticks: { color: '#9ca3af', maxRotation: 45, font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'Frekuensi', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } } }
    }));
}
}

function initPolyCharts() {
var PG = { deposit: { unopt: 31412, stat: 31427, dyn: 122769, light: 34156 }, withdraw: { unopt: 9735, stat: 9727, dyn: 104806, light: 12119 }, swap: { unopt: 10593, stat: 10494, dyn: 103825, light: 13443 } };

var pg1 = document.getElementById('chart-gas-poly');
if (pg1) {
charts.push(new Chart(pg1.getContext('2d'), {
    type: 'bar',
    data: {
        labels: ['Deposit', 'Withdraw', 'Swap'],
        datasets: [
            { label: '[A] Unoptimized', data: [PG.deposit.unopt, PG.withdraw.unopt, PG.swap.unopt], backgroundColor: BAR_BG.A, borderColor: BAR_BC.A, borderWidth: 2, borderRadius: 4 },
            { label: '[B] Static Only', data: [PG.deposit.stat, PG.withdraw.stat, PG.swap.stat], backgroundColor: BAR_BG.B, borderColor: BAR_BC.B, borderWidth: 2, borderRadius: 4 },
            { label: '[C] Full Dynamic', data: [PG.deposit.dyn, PG.withdraw.dyn, PG.swap.dyn], backgroundColor: BAR_BG.C, borderColor: BAR_BC.C, borderWidth: 2, borderRadius: 4 },
            { label: '[D] Lightweight', data: [PG.deposit.light, PG.withdraw.light, PG.swap.light], backgroundColor: BAR_BG.D, borderColor: BAR_BC.D, borderWidth: 2, borderRadius: 4 }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false, barPercentage: 0.96, categoryPercentage: 0.88, plugins: { legend: { labels: { color: '#6b7280', usePointStyle: true, padding: 16, font: { family: "'IBM Plex Sans'", size: 12 } } }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6, callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() + ' gas'; } } } }, scales: { x: { ticks: { color: '#6b7280' }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'Gas Units', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } } }
}));
}

var pg2 = document.getElementById('chart-savings-poly');
if (pg2) {
var pBins = 15, pBw = .02, pMean = 98.2057, pStd = .011923, pSb = pMean - pBins * pBw / 2, pSL = [], pSD = [];
for (var i = 0; i < pBins; i++) { var lo = pSb + i * pBw; pSL.push(lo.toFixed(2) + '%'); var x = (lo + pBw / 2 - pMean) / pStd; pSD.push(Math.round(Math.exp(-.5 * x * x) / (pStd * Math.sqrt(2 * Math.PI)) * 100 * pBw)); }
charts.push(new Chart(pg2.getContext('2d'), {
    type: 'bar',
    data: { labels: pSL, datasets: [{ label: 'Frekuensi', data: pSD, backgroundColor: 'rgba(99,102,241,.75)', borderColor: '#6366f1', borderWidth: 2, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, barPercentage: 0.96, categoryPercentage: 0.88, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6, callbacks: { label: function(ctx) { return ctx.parsed.y + ' dari 100 percobaan'; } } } }, scales: { x: { ticks: { color: '#9ca3af', maxRotation: 45, font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'Frekuensi', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } } }
}));
}

var polyMatic = 0.22, polyGasGwei = 30;
var pg3 = document.getElementById('chart-cost-breakdown-poly');
if (pg3) {
charts.push(new Chart(pg3.getContext('2d'), {
    type: 'bar',
    data: {
        labels: ['Deposit', 'Withdraw', 'Swap'],
        datasets: [
            { label: '[A] Unoptimized', data: [31412*polyGasGwei*1e-9, 9735*polyGasGwei*1e-9, 10593*polyGasGwei*1e-9], backgroundColor: BAR_BG.A, borderColor: BAR_BC.A, borderWidth: 2, borderRadius: 4 },
            { label: '[B] Static Only', data: [31427*polyGasGwei*1e-9, 9727*polyGasGwei*1e-9, 10494*polyGasGwei*1e-9], backgroundColor: BAR_BG.B, borderColor: BAR_BC.B, borderWidth: 2, borderRadius: 4 },
            { label: '[C] Full Dynamic', data: [122769*polyGasGwei*1e-9, 104806*polyGasGwei*1e-9, 103825*polyGasGwei*1e-9], backgroundColor: BAR_BG.C, borderColor: BAR_BC.C, borderWidth: 2, borderRadius: 4 },
            { label: '[D] Lightweight', data: [34156*polyGasGwei*1e-9, 12119*polyGasGwei*1e-9, 13443*polyGasGwei*1e-9], backgroundColor: BAR_BG.D, borderColor: BAR_BC.D, borderWidth: 2, borderRadius: 4 }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false, barPercentage: 0.96, categoryPercentage: 0.88, plugins: { legend: { labels: { color: '#6b7280', usePointStyle: true } }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6, callbacks: { label: function(ctx) { return ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(8) + ' MATIC'; } } } }, scales: { x: { ticks: { color: '#6b7280' }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'MATIC', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } } }
}));
}

var pg4 = document.getElementById('chart-usd-breakdown-poly');
if (pg4) {
charts.push(new Chart(pg4.getContext('2d'), {
    type: 'bar',
    data: {
        labels: ['Deposit', 'Withdraw', 'Swap'],
        datasets: [
            { label: '[A] Unoptimized', data: [31412*polyGasGwei*1e-9*polyMatic, 9735*polyGasGwei*1e-9*polyMatic, 10593*polyGasGwei*1e-9*polyMatic], backgroundColor: BAR_BG.A, borderColor: BAR_BC.A, borderWidth: 2, borderRadius: 4 },
            { label: '[B] Static Only', data: [31427*polyGasGwei*1e-9*polyMatic, 9727*polyGasGwei*1e-9*polyMatic, 10494*polyGasGwei*1e-9*polyMatic], backgroundColor: BAR_BG.B, borderColor: BAR_BC.B, borderWidth: 2, borderRadius: 4 },
            { label: '[C] Full Dynamic', data: [122769*polyGasGwei*1e-9*polyMatic, 104806*polyGasGwei*1e-9*polyMatic, 103825*polyGasGwei*1e-9*polyMatic], backgroundColor: BAR_BG.C, borderColor: BAR_BC.C, borderWidth: 2, borderRadius: 4 },
            { label: '[D] Lightweight', data: [34156*polyGasGwei*1e-9*polyMatic, 12119*polyGasGwei*1e-9*polyMatic, 13443*polyGasGwei*1e-9*polyMatic], backgroundColor: BAR_BG.D, borderColor: BAR_BC.D, borderWidth: 2, borderRadius: 4 }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false, barPercentage: 0.96, categoryPercentage: 0.88, plugins: { legend: { labels: { color: '#6b7280', usePointStyle: true } }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6, callbacks: { label: function(ctx) { return ctx.dataset.label + ': $' + ctx.parsed.y.toFixed(6); } } } }, scales: { x: { ticks: { color: '#6b7280' }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'USD', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } } }
}));
}

var pg5 = document.getElementById('chart-distribution-poly');
if (pg5) {
var pDBins = 15, pDBw = .02, pDMean = 98.2057, pDStd = .011923, pDSb = pDMean - pDBins * pDBw / 2, pDL = [], pDD = [];
for (var i = 0; i < pDBins; i++) { var lo = pDSb + i * pDBw; pDL.push(lo.toFixed(2) + '%'); var x = (lo + pDBw / 2 - pDMean) / pDStd; pDD.push(Math.round(Math.exp(-.5 * x * x) / (pDStd * Math.sqrt(2 * Math.PI)) * 100 * pDBw)); }
charts.push(new Chart(pg5.getContext('2d'), {
    type: 'bar',
    data: { labels: pDL, datasets: [{ label: 'Frekuensi', data: pDD, backgroundColor: 'rgba(130,71,229,.72)', borderColor: '#8247e5', borderWidth: 2, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, barPercentage: 0.96, categoryPercentage: 0.88, plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6, callbacks: { label: function(ctx) { return ctx.parsed.y + ' dari 100 percobaan'; } } } }, scales: { x: { ticks: { color: '#9ca3af', maxRotation: 45, font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, title: { display: true, text: 'Frekuensi', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } } }
}));
}

var pg6 = document.getElementById('chart-test-poly');
if (pg6) {
charts.push(new Chart(pg6.getContext('2d'), {
    type: 'bar',
    data: {
        labels: ['Core', 'MEV', 'Edge', 'Fuzz', 'Invariant', 'Econ', 'Gas', 'Event', 'EIP-1153', 'EWS', 'Dynamic', 'Tier', 'Pause'],
        datasets: [
            { label: 'Pass', data: [14, 10, 12, 20, 8, 6, 36, 8, 6, 10, 15, 10, 30], backgroundColor: 'rgba(34,197,94,.82)', borderColor: '#22c55e', borderWidth: 2, borderRadius: 4 },
            { label: 'Fail', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: 'rgba(239,68,68,.82)', borderColor: '#ef4444', borderWidth: 2, borderRadius: 4 }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false, barPercentage: 0.96, categoryPercentage: 0.88, plugins: { legend: { labels: { color: '#6b7280', usePointStyle: true } }, tooltip: { mode: 'index', intersect: false, backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#d1d5db', borderColor: '#374151', borderWidth: 1, padding: 14, cornerRadius: 6 } }, scales: { x: { stacked: true, ticks: { color: '#6b7280' }, grid: { display: false } }, y: { stacked: true, ticks: { color: '#9ca3af' }, title: { display: true, text: 'Test Cases', color: '#9ca3af' }, grid: { color: '#f3f4f6', lineWidth: 0.5 } } } }
}));
}
}
