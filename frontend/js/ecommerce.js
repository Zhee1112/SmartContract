/* ============ E-COMMERCE TERMINAL JS ============ */
var ecCart = [];
var ecCurrentTier = { id:4, label:'Tier 4 — Batching Bridge' };
var ecCurrentNetwork = 'MATIC';
var ecWalletConnected = false;
var ecWalletAddress = '';
var ecWalletBalance = 0;

var ecPrices = { ETH:2500, MATIC:0.22 };
var ecGasGwei = { ETH:0.55, MATIC:30 };

var ecTiers = {
    1:{ name:'Tier 1 — Instant Bridge (LP)',   gas:31412,  sec:0,  time:'~10 detik',  contract:'A', color:'#f87171' },
    2:{ name:'Tier 2 — Optimistic Bridge',      gas:31427,  sec:2,  time:'~2 menit',   contract:'B', color:'#ffb871' },
    3:{ name:'Tier 3 — Canonical Bridge (PoS)', gas:122769, sec:8,  time:'~7 menit',   contract:'C', color:'var(--primary)' },
    4:{ name:'Tier 4 — Batching Bridge',        gas:34156,  sec:8,  time:'~10 menit',  contract:'D', color:'#10b981' }
};

var ecProducts = [
    { id:1, name:'Quantum Phone X', desc:'Enterprise-grade encryption with integrated hardware wallet for secure on-chain commerce.', price:699, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCKyLJ2xgSgSxqB1J5tIrIFIxHduFTfV3p6pLYzH2drWTV28mtZiqoX8MQhW4YWY9OUDNGRZMFHRLvguQAbqfQycqKKKJp7LKQ_jGUNqk7VI8XzeFKibBVgJNGXlsLYvTQW6NLeFENFpA-lbeYLpYXsERwecjVJdGec46JMLZCWtDL_-a-EOoRasrOTQFMzCGLcGgX_xmlFOIAWXbjcuTTL8RPOyiKrzCvW9Hki5GEmmpAtW7PCQtte3WJzSKBYBeEIaqFQReF3Gk8', stock:'In Stock', stockClass:'' },
    { id:2, name:'Node Master Pro', desc:'The ultimate developer workstation optimized for running full nodes and heavy smart contract testing.', price:1299, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDAW01yrzGfx-RILfKOTrc0GyB6gO_D4nPA_0tAQV_2WAaz94i9olm_sZKa9mC1ZSjmg43HjTm5_9IkJJpjnaaQcYK6Ck06ltHB3kjTlP0Zt27HRnbJq_ud4O4XvmXxWHZ9fLF6iM_ZgI80gSiPWiorN0S38oNcScUyaw2zFesNXNCtN_QQzwEE9pQ47fi-_WQCRz0utVuJXIjwhUpdHmVV7OjeRvHp-oolbOtUrX5Of5VJ36bh4xYVP1dw1EzFazRAzs3JNml3hNY', stock:'Limited', stockClass:'limited' },
    { id:3, name:'ANC Noise-Zero', desc:'Immersive focus for traders. Adaptive cancellation blocks out market noise and volatile distractions.', price:49, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuAWBZgreBmZiDljUeHpniWaXDLynsKQLeNzbABr2ELKLXWtm_zT0qZRcwrI26U6xeWgHgnR_kxNyuO9VEL94r5yU8wyHJ0JdVp5dqd5t0aAZVp_tlmpfLE_NEHYhma2n8Nb4p9f4mu-e7Og5u6FuOzHRYef1j68JcMi4lJmWoSAjAiu15bYwxJIAIc4w9anQrPm0n1vF9xtiU9wk-E8w_vZ2s9Z-3MtVyKkRqhlEtkGdevBwKHfoprd8alzn8--AEXKXriUrWJ8OB4', stock:'In Stock', stockClass:'' },
    { id:4, name:'Cipher Mech V2', desc:'Programmable macros for one-tap swaps and bridge executions. Tactile response for precision entry.', price:129, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuB6vzVNQrq8O27SiY9L_BMRIsqzVwI2Rrz6m9N_vPCapmux0U0V7eMjzBSFupEJZ0jt-x5idr3ZVP7mO1WDuqqi78HtoRrv5LfYGWN8zwfeMjcDS-c1jDPODbjAegk62FjKwdSFgG1Nw7qGavFfiJQzduetX1e8DPvbOWkTewM6UGAV-QwIX6q1juqMn-uSo-Wa0x2VMYfUEznzY_8vHDkUKd79xOnndVR2N9tisLWCtnybiObV6qs-WHRxSrEWNhEpvmcNMSG5VMM', stock:'In Stock', stockClass:'' }
];
var ecNextProductId = 5;

function ecGetSymbol() { return ecCurrentNetwork === 'ETH' ? 'ETH' : 'MATIC'; }
function ecGetPrice() { return ecPrices[ecGetSymbol()]; }
function ecGetGasGwei() { return ecGasGwei[ecGetSymbol()]; }
function ecUsdToCrypto(usd) { return usd / ecGetPrice(); }
function ecGasToCrypto(gasUnits) { return gasUnits * ecGetGasGwei() * 1e-9; }
function ecFormat(v) { return v < 0.000001 ? v.toFixed(10) : v < 0.01 ? v.toFixed(8) : v < 1 ? v.toFixed(6) : v.toFixed(4); }

function ecConnectWallet() {
    if (ecWalletConnected) { ecDisconnectWallet(); return; }
    var btn = document.getElementById('ec-wallet-btn');
    if (btn) { btn.textContent = 'Connecting...'; btn.disabled = true; }
    setTimeout(function(){
        ecWalletConnected = true;
        ecWalletAddress = '0x' + Array.from({length:40},function(){return '0123456789abcdef'[Math.floor(Math.random()*16)];}).join('');
        ecWalletBalance = (Math.random()*5+0.5).toFixed(4);
        ecRenderWallet();
        ecRenderCart();
    }, 1200);
}

function ecDisconnectWallet() {
    ecWalletConnected = false;
    ecWalletAddress = '';
    ecWalletBalance = 0;
    ecRenderWallet();
    ecRenderCart();
}

function ecRenderWallet() {
    var btn = document.getElementById('ec-wallet-btn');
    var profile = document.getElementById('ec-profile');
    var connectSection = document.getElementById('ec-connect-section');
    if (!btn) return;
    if (ecWalletConnected) {
        btn.textContent = 'Disconnect';
        btn.disabled = false;
        btn.style.background = '#dc2626';
        if (profile) profile.style.display = 'flex';
        if (connectSection) connectSection.style.display = 'none';
        var addr = document.getElementById('ec-profile-addr');
        var bal = document.getElementById('ec-profile-bal');
        var net = document.getElementById('ec-profile-net');
        if (addr) addr.textContent = ecWalletAddress.slice(0,6) + '...' + ecWalletAddress.slice(-4);
        if (bal) bal.textContent = ecWalletBalance + ' ' + ecGetSymbol();
        if (net) net.textContent = ecCurrentNetwork === 'ETH' ? 'Ethereum' : 'Polygon';
    } else {
        btn.textContent = 'Connect Wallet';
        btn.disabled = false;
        btn.style.background = '#8247e5';
        if (profile) profile.style.display = 'none';
        if (connectSection) connectSection.style.display = 'block';
    }
}

function ecSetTier(id) {
    ecCurrentTier = { id:id, label:ecTiers[id].name };
    document.querySelectorAll('.ec-tier-btn').forEach(function(b){ b.classList.remove('active'); });
    var el = document.getElementById('ec-tier-' + id);
    if (el) el.classList.add('active');
    ecRenderCart();
}

function ecSetNetwork(net) {
    ecCurrentNetwork = net;
    var ethBtn = document.getElementById('ec-net-eth');
    var polyBtn = document.getElementById('ec-net-poly');
    if (net === 'ETH') {
        if (ethBtn) ethBtn.className = 'ec-net-btn active';
        if (polyBtn) polyBtn.className = 'ec-net-btn';
    } else {
        if (ethBtn) ethBtn.className = 'ec-net-btn';
        if (polyBtn) polyBtn.className = 'ec-net-btn active';
    }
    ecRenderCart();
    ecRenderWallet();
    ecRenderProducts();
}

function ecRenderProducts() {
    var grid = document.getElementById('ec-product-grid');
    if (!grid) return;
    var sym = ecGetSymbol();
    var html = '';
    ecProducts.forEach(function(p) {
        var cryptoPrice = ecUsdToCrypto(p.price);
        html += '<div class="ec-glass" data-ecid="' + p.id + '">' +
            '<div style="height:200px;overflow:hidden;position:relative">' +
            '<img class="ec-prod-img" src="' + p.img + '" alt="' + p.name + '" onerror="this.style.display=\'none\'"/>' +
            '<div class="ec-stock ' + p.stockClass + '">' + p.stock + '</div>' +
            '</div>' +
            '<div style="padding:16px">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">' +
            '<h3 style="font-size:18px;font-weight:600;color:var(--text)">' + p.name + '</h3>' +
            '<div style="text-align:right"><span style="font-family:JetBrains Mono,monospace;font-weight:700;color:var(--primary);font-size:14px">' + ecFormat(cryptoPrice) + ' ' + sym + '</span><br><span style="font-size:13px;color:var(--text-muted)">$' + p.price.toLocaleString() + '</span></div>' +
            '</div>' +
            '<p style="font-size:14px;color:var(--text-muted);margin-bottom:16px;height:40px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + p.desc + '</p>' +
            '<div style="display:flex;gap:8px">' +
            '<button onclick="ecAddToCart(\'' + p.name.replace(/'/g,"\\'") + '\',' + p.price + ')" style="flex:1;padding:8px;border:1px solid rgba(255,255,255,0.1);border-radius:8px;background:rgba(30,41,59,0.7);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;transition:all 0.2s" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.background=\'rgba(130,71,229,0.1)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,0.1)\';this.style.background=\'rgba(30,41,59,0.7)\'">' +
            '<span class="material-symbols-outlined" style="font-size:16px">add_shopping_cart</span> Add' +
            '</button>' +
            '<button onclick="ecDeleteProduct(' + p.id + ')" style="padding:8px;border:1px solid rgba(255,180,171,0.2);border-radius:8px;background:rgba(255,180,171,0.05);color:#ffb4ab;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor=\'#ffb4ab\';this.style.background=\'rgba(255,180,171,0.15)\'" onmouseout="this.style.borderColor=\'rgba(255,180,171,0.2)\';this.style.background=\'rgba(255,180,171,0.05)\'">' +
            '<span class="material-symbols-outlined" style="font-size:16px">delete</span>' +
            '</button>' +
            '</div>' +
            '</div></div>';
    });
    grid.innerHTML = html;
}

function ecDeleteProduct(id) {
    ecProducts = ecProducts.filter(function(p){ return p.id !== id; });
    ecRenderProducts();
}

function ecOpenAddModal() {
    var m = document.getElementById('ec-add-modal');
    if (m) m.style.display = 'flex';
}
function ecCloseAddModal() {
    var m = document.getElementById('ec-add-modal');
    if (m) m.style.display = 'none';
}
function ecSubmitProduct() {
    var name = document.getElementById('ec-new-name');
    var price = document.getElementById('ec-new-price');
    var desc = document.getElementById('ec-new-desc');
    var img = document.getElementById('ec-new-img');
    if (!name || !price) return;
    var n = name.value.trim();
    var p = parseFloat(price.value);
    if (!n || isNaN(p) || p <= 0) return;
    ecProducts.push({
        id: ecNextProductId++,
        name: n,
        desc: desc ? desc.value.trim() || 'Custom product added by user.' : 'Custom product added by user.',
        price: p,
        img: (img && img.value.trim()) ? img.value.trim() : 'https://placehold.co/600x400/1a1d24/8247e5?text=' + encodeURIComponent(n),
        stock: 'In Stock',
        stockClass: ''
    });
    ecRenderProducts();
    ecCloseAddModal();
    if (name) name.value = '';
    if (price) price.value = '';
    if (desc) desc.value = '';
    if (img) img.value = '';
}

function ecAddToCart(name, price) {
    ecCart.push({ name:name, price:price });
    ecRenderCart();
}

function ecRemoveFromCart(index) {
    ecCart.splice(index, 1);
    ecRenderCart();
}

function ecRenderCart() {
    var container = document.getElementById('ec-cart-items');
    if (!container) return;
    var sym = ecGetSymbol();

    if (ecCart.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px 0;opacity:0.5;font-style:italic;color:var(--text-muted)">Cart is empty</div>';
        ['ec-summary-subtotal','ec-summary-gas','ec-summary-total'].forEach(function(id){
            var e = document.getElementById(id); if(e) e.innerText = '0 ' + sym;
        });
        var pay = document.getElementById('ec-pay-btn');
        if (pay) pay.disabled = true;
        return;
    }

    var pay = document.getElementById('ec-pay-btn');
    if (pay) pay.disabled = !ecWalletConnected;

    var html = '';
    ecCart.forEach(function(item, i) {
        var crypto = ecUsdToCrypto(item.price);
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
            '<div><div style="font-weight:600;font-size:14px">' + item.name + '</div>' +
            '<div style="font-size:12px;opacity:0.7;font-family:JetBrains Mono,monospace">$' + item.price.toFixed(2) + '</div></div>' +
            '<div style="display:flex;align-items:center;gap:8px">' +
            '<span style="font-family:JetBrains Mono,monospace;font-size:13px;font-weight:600;color:var(--primary)">' + ecFormat(crypto) + ' ' + sym + '</span>' +
            '<button onclick="ecRemoveFromCart(' + i + ')" style="background:none;border:none;color:#ffb4ab;cursor:pointer;font-size:16px;opacity:0.6;transition:opacity 0.2s" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'0.6\'">✕</button>' +
            '</div></div>';
    });
    container.innerHTML = html;

    var subtotalUsd = 0;
    ecCart.forEach(function(item){ subtotalUsd += item.price; });

    var gasUnits = ecTiers[ecCurrentTier.id].gas;
    var gasCrypto = ecGasToCrypto(gasUnits);
    var subtotalCrypto = ecUsdToCrypto(subtotalUsd);
    var totalCrypto = subtotalCrypto + gasCrypto;

    var sEl = document.getElementById('ec-summary-subtotal');
    var gEl = document.getElementById('ec-summary-gas');
    var tEl = document.getElementById('ec-summary-total');

    if (sEl) sEl.innerText = ecFormat(subtotalCrypto) + ' ' + sym;
    if (gEl) gEl.innerText = ecFormat(gasCrypto) + ' ' + sym + ' (' + gasUnits.toLocaleString() + ' gas)';
    if (tEl) tEl.innerText = ecFormat(totalCrypto) + ' ' + sym;
}

function ecProcessPayment() {
    if (ecCart.length === 0 || !ecWalletConnected) return;
    var overlay = document.getElementById('ec-processing');
    var tierNum = document.getElementById('ec-active-tier-num');
    if (tierNum) tierNum.innerText = ecCurrentTier.id;
    if (overlay) overlay.classList.add('active');

    setTimeout(function(){
        if (overlay) overlay.classList.remove('active');
        ecShowReceipt();
        ecCart = [];
        ecRenderCart();
    }, 3000);
}

function ecShowReceipt() {
    var receipt = document.getElementById('ec-receipt');
    if (!receipt) return;
    var tier = ecTiers[ecCurrentTier.id];
    var sym = ecGetSymbol();
    var gasCrypto = ecGasToCrypto(tier.gas);
    var gasUsd = gasCrypto * ecGetPrice();

    var el = function(id){ return document.getElementById(id); };
    if (el('ec-rc-hash'))    el('ec-rc-hash').innerText = '0x' + Array.from({length:8},function(){return '0123456789abcdef'[Math.floor(Math.random()*16)];}).join('') + '...' + Array.from({length:4},function(){return '0123456789abcdef'[Math.floor(Math.random()*16)];}).join('');
    if (el('ec-rc-tier'))    el('ec-rc-tier').innerText = ecCurrentTier.label;
    if (el('ec-rc-route'))   el('ec-rc-route').innerText = 'Route: Contract ' + tier.contract;
    if (el('ec-rc-gas'))     el('ec-rc-gas').innerText = tier.gas.toLocaleString() + ' units';
    if (el('ec-rc-gas-eth')) el('ec-rc-gas-eth').innerText = ecFormat(gasCrypto) + ' ' + sym + ' ($' + gasUsd.toFixed(2) + ')';
    if (el('ec-rc-sec'))     el('ec-rc-sec').innerText = tier.sec + '/8 Verified';
    if (el('ec-rc-sec-sub')) el('ec-rc-sec-sub').innerText = tier.sec >= 8 ? 'MEV Protected' : 'No MEV Protection';
    if (el('ec-rc-time'))    el('ec-rc-time').innerText = ecCurrentTier.id <= 2 ? 'Immediate' : tier.time;
    if (el('ec-rc-net'))     el('ec-rc-net').innerText = ecCurrentNetwork === 'ETH' ? 'Ethereum Network' : 'Polygon Network';

    receipt.classList.add('active');
    receipt.scrollIntoView({ behavior:'smooth' });
}

function ecResetDemo() {
    ecCart = [];
    ecRenderCart();
    var receipt = document.getElementById('ec-receipt');
    if (receipt) receipt.classList.remove('active');
    ecProducts = [
        { id:1, name:'Quantum Phone X', desc:'Enterprise-grade encryption with integrated hardware wallet for secure on-chain commerce.', price:699, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCKyLJ2xgSgSxqB1J5tIrIFIxHduFTfV3p6pLYzH2drWTV28mtZiqoX8MQhW4YWY9OUDNGRZMFHRLvguQAbqfQycqKKKJp7LKQ_jGUNqk7VI8XzeFKibBVgJNGXlsLYvTQW6NLeFENFpA-lbeYLpYXsERwecjVJdGec46JMLZCWtDL_-a-EOoRasrOTQFMzCGLcGgX_xmlFOIAWXbjcuTTL8RPOyiKrzCvW9Hki5GEmmpAtW7PCQtte3WJzSKBYBeEIaqFQReF3Gk8', stock:'In Stock', stockClass:'' },
        { id:2, name:'Node Master Pro', desc:'The ultimate developer workstation optimized for running full nodes and heavy smart contract testing.', price:1299, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDAW01yrzGfx-RILfKOTrc0GyB6gO_D4nPA_0tAQV_2WAaz94i9olm_sZKa9mC1ZSjmg43HjTm5_9IkJJpjnaaQcYK6Ck06ltHB3kjTlP0Zt27HRnbJq_ud4O4XvmXxWHZ9fLF6iM_ZgI80gSiPWiorN0S38oNcScUyaw2zFesNXNCtN_QQzwEE9pQ47fi-_WQCRz0utVuJXIjwhUpdHmVV7OjeRvHp-oolbOtUrX5Of5VJ36bh4xYVP1dw1EzFazRAzs3JNml3hNY', stock:'Limited', stockClass:'limited' },
        { id:3, name:'ANC Noise-Zero', desc:'Immersive focus for traders. Adaptive cancellation blocks out market noise and volatile distractions.', price:49, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuAWBZgreBmZiDljUeHpniWaXDLynsKQLeNzbABr2ELKLXWtm_zT0qZRcwrI26U6xeWgHgnR_kxNyuO9VEL94r5yU8wyHJ0JdVp5dqd5t0aAZVp_tlmpfLE_NEHYhma2n8Nb4p9f4mu-e7Og5u6FuOzHRYef1j68JcMi4lJmWoSAjAiu15bYwxJIAIc4w9anQrPm0n1vF9xtiU9wk-E8w_vZ2s9Z-3MtVyKkRqhlEtkGdevBwKHfoprd8alzn8--AEXKXriUrWJ8OB4', stock:'In Stock', stockClass:'' },
        { id:4, name:'Cipher Mech V2', desc:'Programmable macros for one-tap swaps and bridge executions. Tactile response for precision entry.', price:129, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuB6vzVNQrq8O27SiY9L_BMRIsqzVwI2Rrz6m9N_vPCapmux0U0V7eMjzBSFupEJZ0jt-x5idr3ZVP7mO1WDuqqi78HtoRrv5LfYGWN8zwfeMjcDS-c1jDPODbjAegk62FjKwdSFgG1Nw7qGavFfiJQzduetX1e8DPvbOWkTewM6UGAV-QwIX6q1juqMn-uSo-Wa0x2VMYfUEznzY_8vHDkUKd79xOnndVR2N9tisLWCtnybiObV6qs-WHRxSrEWNhEpvmcNMSG5VMM', stock:'In Stock', stockClass:'' }
    ];
    ecNextProductId = 5;
    ecRenderProducts();
    ecSetTier(4);
    ecSetNetwork('MATIC');
    window.scrollTo({ top:0, behavior:'smooth' });
}

function ecInit() {
    ecRenderProducts();
    ecRenderCart();
    ecRenderWallet();
}

document.addEventListener('DOMContentLoaded', function(){ ecInit(); });
