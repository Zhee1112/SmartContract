const API_BASE = '';

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
  });
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    errorEl.textContent = 'Username dan password harus diisi';
    return;
  }

  try {
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Logging in...';

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Login gagal';
      btn.disabled = false;
      btn.textContent = 'Login';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('csrfToken', data.csrfToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    window.location.href = '/';
  } catch (err) {
    errorEl.textContent = 'Koneksi gagal. Coba lagi.';
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');
  errorEl.textContent = '';
  successEl.textContent = '';

  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;

  if (!username || !password || !passwordConfirm) {
    errorEl.textContent = 'Semua field harus diisi';
    return;
  }

  if (password !== passwordConfirm) {
    errorEl.textContent = 'Password tidak cocok';
    return;
  }

  try {
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Registering...';

    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.errors ? data.errors.join(', ') : (data.error || 'Register gagal');
      btn.disabled = false;
      btn.textContent = 'Register';
      return;
    }

    successEl.textContent = 'Register berhasil! Silakan login.';
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regPasswordConfirm').value = '';

    setTimeout(() => {
      document.querySelector('.tab[data-tab="login"]').click();
    }, 1500);

    btn.disabled = false;
    btn.textContent = 'Register';
  } catch (err) {
    errorEl.textContent = 'Koneksi gagal. Coba lagi.';
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = false;
    btn.textContent = 'Register';
  }
});

(function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (res.ok) window.location.href = '/';
    }).catch(() => {});
  }
})();
