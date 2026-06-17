const crypto = require('crypto');

const csrfTokens = new Map();

function generateCsrfToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(sessionId, { token, expires: Date.now() + 3600000 });
  return token;
}

function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  if (req.headers.authorization?.startsWith('Bearer ')) {
    return next();
  }

  const sessionId = req.cookies?.sessionId;
  const csrfToken = req.headers['x-csrf-token'];

  if (!sessionId || !csrfToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  const stored = csrfTokens.get(sessionId);
  if (!stored || stored.token !== csrfToken || Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return res.status(403).json({ error: 'CSRF token invalid or expired' });
  }

  next();
}

module.exports = { generateCsrfToken, csrfProtection };
