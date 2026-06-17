const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let db = { users: [], sessions: [], simulation_logs: [] };

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) { db = { users: [], sessions: [], simulation_logs: [] }; }
  }
  if (!db.users) db.users = [];
  if (!db.sessions) db.sessions = [];
  if (!db.simulation_logs) db.simulation_logs = [];

  const adminExists = db.users.find(u => u.username === 'admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 12);
    db.users.push({ id: 1, username: 'admin', password: hash, role: 'admin', created_at: new Date().toISOString(), last_login: null });
    saveDb();
    console.log('[DB] Default admin user created (admin/admin123)');
  }
}

function saveDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getDb() { return db; }
function nextId(collection) { return db[collection].length > 0 ? Math.max(...db[collection].map(r => r.id)) + 1 : 1; }

loadDb();

module.exports = { getDb, saveDb, nextId };
