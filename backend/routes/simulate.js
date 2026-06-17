const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { simulateRules, validate } = require('../utils/validator');
const { addSimulationLog, getSimulationLogs } = require('../models/user');

const router = express.Router();

const GAS_DATA = {
  deposit:   { A: 31412, B: 31427, C: 122769, D: 34156 },
  withdraw:  { A: 9735,  B: 9727,  C: 104806, D: 12119 },
  swap:      { A: 10593, B: 10494, C: 103825, D: 13443 }
};
const SECURITY_SCORES = { A: 0, B: 2, C: 8, D: 8 };
const LAMBDA = 15000, P_DETECT = 9600;
function calcPenalty(a, s) { return s === 0 ? 0 : Math.min((a * LAMBDA * P_DETECT) / 100000000, a); }

function simulateNormalSwap(amount) {
  const tokensOut = (amount * 997 * 100000) / ((100 * 1000) + (amount * 997));
  const results = {};
  for (const t of ['A','B','C','D']) {
    results[t] = { gas: GAS_DATA.swap[t], security: `${SECURITY_SCORES[t]}/8`, tokensReceived: tokensOut.toFixed(2), penalty: 0, status: 'success' };
  }
  return { scenario: 'Normal Swap', results };
}

function simulateSandwichAttack(amount, attackerAmount) {
  const ethR = 100, tokR = 100000;
  const aTok = (attackerAmount * 997 * tokR) / ((ethR * 1000) + (attackerAmount * 997));
  const nER = ethR + attackerAmount, nTR = tokR - aTok;
  const vTok = (amount * 997 * nTR) / ((nER * 1000) + (amount * 997));
  const normalTok = (amount * 997 * tokR) / ((ethR * 1000) + (amount * 997));
  const vLoss = normalTok - vTok;
  const penalty = calcPenalty(attackerAmount, P_DETECT);
  const results = {};
  for (const t of ['A','B','C','D']) {
    const s = SECURITY_SCORES[t];
    let aPnL, vPnL, st;
    if (t === 'A') { aPnL = `+${aTok.toFixed(2)} tokens`; vPnL = `-${vLoss.toFixed(2)} tokens`; st = 'EXPLOITED'; }
    else if (t === 'B') { aPnL = '0 (CEI)'; vPnL = `-${vLoss.toFixed(2)} tokens (no MEV detect)`; st = 'PARTIAL'; }
    else { aPnL = `-${penalty.toFixed(2)} ETH (penalty)`; vPnL = '0 (MEV detected)'; st = 'PROTECTED'; }
    results[t] = { gas: GAS_DATA.swap[t], security: `${s}/8`, attackerPnL: aPnL, victimPnL: vPnL, status: st, penalty: (t==='C'||t==='D')?penalty.toFixed(4):0 };
  }
  return { scenario: 'Sandwich Attack', results };
}

function simulateReentrancyAttack(amount) {
  const results = {};
  for (const t of ['A','B','C','D']) {
    const ok = t === 'A';
    results[t] = { gas: GAS_DATA.withdraw[t], security: `${SECURITY_SCORES[t]}/8`, attackSuccess: ok, fundLost: ok ? `${amount*3} ETH` : '0 ETH', status: ok ? 'EXPLOITED' : 'BLOCKED' };
  }
  return { scenario: 'Reentrancy Attack', results };
}

function simulateFlashLoanAttack(amount) {
  const penalty = calcPenalty(amount, P_DETECT);
  const results = {};
  for (const t of ['A','B','C','D']) {
    const manipulated = t === 'A' || t === 'B';
    results[t] = { gas: GAS_DATA.deposit[t], security: `${SECURITY_SCORES[t]}/8`, manipulationSuccess: manipulated, penalty: (t==='C'||t==='D')?`${penalty.toFixed(4)} ETH`:'0', status: manipulated ? 'MANIPULATED' : 'PROTECTED' };
  }
  return { scenario: 'Flash Loan Attack', results };
}

function simulateEmergencyPause() {
  const results = {};
  for (const t of ['A','B','C','D']) {
    const hasPause = t !== 'A' && t !== 'B';
    results[t] = { security: `${SECURITY_SCORES[t]}/8`, hasPause, responseTime: t==='A'?'N/A':t==='B'?'N/A':t==='C'?'~50ms (External)':'~10ms (Inline)', status: t==='A'?'NO PROTECTION':t==='B'?'NO PAUSE':'INSTANT PAUSE' };
  }
  return { scenario: 'Emergency Pause', results };
}

const SIMS = {
  normal_swap: (a) => simulateNormalSwap(a),
  sandwich_attack: (a, b) => simulateSandwichAttack(a, b || a * 0.5),
  reentrancy_attack: (a) => simulateReentrancyAttack(a),
  flash_loan_attack: (a) => simulateFlashLoanAttack(a),
  emergency_pause: () => simulateEmergencyPause()
};

router.post('/', authMiddleware, simulateRules, validate, (req, res) => {
  try {
    const { scenario, amount, attackerAmount } = req.body;
    const fn = SIMS[scenario];
    if (!fn) return res.status(400).json({ error: 'Unknown scenario' });
    const result = fn(amount, attackerAmount);
    addSimulationLog(req.user.id, scenario, JSON.stringify({ amount, attackerAmount }), JSON.stringify(result));
    res.json(result);
  } catch (err) { res.status(500).json({ error: 'Simulation failed' }); }
});

router.get('/history', authMiddleware, (req, res) => {
  try { res.json({ logs: getSimulationLogs(req.user.id) }); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch history' }); }
});

module.exports = router;
