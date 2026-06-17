const { body, validationResult } = require('express-validator');

const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, underscore'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number')
];

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const simulateRules = [
  body('scenario')
    .isIn(['normal_swap', 'sandwich_attack', 'reentrancy_attack', 'flash_loan_attack', 'emergency_pause'])
    .withMessage('Invalid scenario'),
  body('amount')
    .isFloat({ min: 0.001, max: 10000 }).withMessage('Amount must be 0.001 - 10000 ETH'),
  body('attackerAmount')
    .optional()
    .isFloat({ min: 0, max: 10000 }).withMessage('Attacker amount must be 0 - 10000 ETH')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => e.msg) });
  }
  next();
}

module.exports = { registerRules, loginRules, simulateRules, validate };
