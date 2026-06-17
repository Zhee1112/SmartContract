const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, findByUsername, findById, updateLastLogin, verifyPassword, createSession, deleteSession } = require('../models/user');
const { registerRules, loginRules, validate } = require('../utils/validator');
const { authLimiter } = require('../middleware/rateLimit');
const { generateCsrfToken } = require('../middleware/csrf');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, (req, res) => {
  try {
    const { username, password } = req.body;
    if (findByUsername(username)) return res.status(409).json({ error: 'Username already exists' });
    const user = createUser(username, password);
    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) { res.status(500).json({ error: 'Registration failed' }); }
});

router.post('/login', authLimiter, loginRules, validate, (req, res) => {
  try {
    const { username, password } = req.body;
    const user = findByUsername(username);
    if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    updateLastLogin(user.id);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    createSession(user.id, token, expiresAt);
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 86400000 });
    const sessionId = require('uuid').v4();
    res.cookie('sessionId', sessionId, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 86400000 });
    const csrfToken = generateCsrfToken(sessionId);
    res.json({ message: 'Login successful', token, csrfToken, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) { res.status(500).json({ error: 'Login failed' }); }
});

router.post('/logout', authMiddleware, (req, res) => {
  try {
    deleteSession(req.token);
    res.clearCookie('token');
    res.clearCookie('sessionId');
    res.json({ message: 'Logout successful' });
  } catch (err) { res.status(500).json({ error: 'Logout failed' }); }
});

router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { res.status(500).json({ error: 'Failed to get user info' }); }
});

module.exports = router;
