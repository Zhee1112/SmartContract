const { getDb, saveDb, nextId } = require('../config/database');
const bcrypt = require('bcryptjs');

function createUser(username, password, role = 'user') {
  const db = getDb();
  const hash = bcrypt.hashSync(password, 12);
  const user = { id: nextId('users'), username, password: hash, role, created_at: new Date().toISOString(), last_login: null };
  db.users.push(user);
  saveDb();
  return { id: user.id, username: user.username, role: user.role };
}

function findByUsername(username) {
  return getDb().users.find(u => u.username === username) || null;
}

function findById(id) {
  const u = getDb().users.find(u => u.id === id);
  if (!u) return null;
  return { id: u.id, username: u.username, role: u.role, created_at: u.created_at, last_login: u.last_login };
}

function updateLastLogin(id) {
  const u = getDb().users.find(u => u.id === id);
  if (u) { u.last_login = new Date().toISOString(); saveDb(); }
}

function verifyPassword(plain, hashed) {
  return bcrypt.compareSync(plain, hashed);
}

function createSession(userId, token, expiresAt) {
  const db = getDb();
  const { v4: uuidv4 } = require('uuid');
  const session = { id: uuidv4(), user_id: userId, token, expires_at: expiresAt, created_at: new Date().toISOString() };
  db.sessions.push(session);
  saveDb();
  return session.id;
}

function findSession(token) {
  const s = getDb().sessions.find(s => s.token === token && new Date(s.expires_at) > new Date());
  return s || null;
}

function deleteSession(token) {
  const db = getDb();
  db.sessions = db.sessions.filter(s => s.token !== token);
  saveDb();
}

function addSimulationLog(userId, scenario, inputParams, results) {
  const db = getDb();
  db.simulation_logs.push({ id: nextId('simulation_logs'), user_id: userId, scenario, input_params: inputParams, results, created_at: new Date().toISOString() });
  saveDb();
}

function getSimulationLogs(userId) {
  return getDb().simulation_logs.filter(l => l.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
}

module.exports = { createUser, findByUsername, findById, updateLastLogin, verifyPassword, createSession, findSession, deleteSession, addSimulationLog, getSimulationLogs };
