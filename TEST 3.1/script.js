const $ = s => document.querySelector(s);
const html = document.documentElement;

/* ---------- 5 Authorized TPO Emails ---------- */
const AUTHORIZED_TPO_EMAILS = [
  'tpo1@college.edu',
  'tpo2@college.edu',
  'tpo3@college.edu',
  'tpo4@college.edu',
  'tpo5@college.edu'
];

/* ---------- theme ---------- */
const savedTheme = localStorage.getItem('cc_theme') || 'light';
html.setAttribute('data-theme', savedTheme);
$('#themeToggle').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
$('#themeToggle').addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('cc_theme', next);
  $('#themeToggle').textContent = next === 'dark' ? '☀️' : '🌙';
});

/* ---------- role switch ---------- */
document.querySelectorAll('#roleSwitch .seg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#roleSwitch .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const role = btn.dataset.role;
    $('#studentSection').classList.toggle('active', role === 'student');
    $('#adminSection').classList.toggle('active', role === 'admin');
  });
});

function swap(hideId, showId) {
  $('#' + hideId).classList.remove('active');
  $('#' + showId).classList.add('active');
}
$('#toStudentRegister').onclick = () => swap('studentLoginForm', 'studentRegisterForm');
$('#toStudentLogin').onclick = () => swap('studentRegisterForm', 'studentLoginForm');
$('#toAdminReset').onclick = () => swap('adminLoginForm', 'adminResetForm');
$('#toAdminLogin').onclick = () => swap('adminResetForm', 'adminLoginForm');

/* ---------- storage helpers ---------- */
const getStudents = () => JSON.parse(localStorage.getItem('cc_students') || '[]');
const saveStudents = arr => localStorage.setItem('cc_students', JSON.stringify(arr));
const getAdmins = () => JSON.parse(localStorage.getItem('cc_admins') || '[]');
const saveAdmins = arr => localStorage.setItem('cc_admins', JSON.stringify(arr));

function showError(id, msgs) {
  const box = $('#' + id);
  box.innerHTML = msgs.join('<br>');
  box.style.display = 'block';
}
function hideError(id) { $('#' + id).style.display = 'none'; }
function showSuccess(id, msg) { const b = $('#' + id); b.textContent = msg; b.style.display = 'block'; }
const isValidEmail = email => email.includes('@') && email.includes('.');

/* ---------- student register ---------- */
$('#studentRegisterForm').addEventListener('submit', e => {
  e.preventDefault();
  hideError('studentRegError');
  const name = $('#srName').value.trim();
  const enrollment = $('#srEnrollment').value.trim();
  const email = $('#srEmail').value.trim().toLowerCase();
  const phone = $('#srPhone').value.trim();
  const branch = $('#srBranch').value;
  const year = $('#srYear').value;
  const cgpaRaw = $('#srCgpa').value;
  const cgpa = parseFloat(cgpaRaw);
  const password = $('#srPassword').value;
  const confirm = $('#srConfirm').value;

  const errors = [];
  if (!name) errors.push('Full name is required.');
  if (enrollment.length !== 16) errors.push('Enrollment number must be exactly 16 characters.');
  if (!isValidEmail(email)) errors.push('Please enter a valid email address.');
  if (!/^\d{10}$/.test(phone)) errors.push('Phone number must be exactly 10 digits.');
  if (cgpaRaw === '' || isNaN(cgpa) || cgpa < 0 || cgpa > 10) errors.push('CGPA must be a number between 0 and 10.');
  if (!password || password !== confirm) errors.push('Passwords do not match.');
  if (getStudents().some(s => s.email === email || s.enrollment === enrollment)) errors.push('An account with this email or enrollment number already exists.');

  if (errors.length) { showError('studentRegError', errors); return; }

  const students = getStudents();
  students.push({ id: Date.now(), name, enrollment, email, phone, branch, year, cgpa, eligible: true, password });
  saveStudents(students);

  showSuccess('studentRegSuccess', 'Account created. You can now log in.');
  e.target.reset();
  setTimeout(() => { $('#studentRegSuccess').style.display = 'none'; swap('studentRegisterForm', 'studentLoginForm'); }, 900);
});

/* ---------- student login ---------- */
$('#studentLoginForm').addEventListener('submit', e => {
  e.preventDefault();
  hideError('studentLoginError');
  const email = $('#slEmail').value.trim().toLowerCase();
  const pw = $('#slPassword').value;
  const match = getStudents().find(s => s.email === email && s.password === pw);
  if (!match) { showError('studentLoginError', ['No matching account, or incorrect password.']); return; }
  sessionStorage.setItem('cc_session', JSON.stringify({ role: 'student', id: match.id }));
  renderDashboard();
});

/* ---------- tpo set password ---------- */
$('#adminResetForm').addEventListener('submit', e => {
  e.preventDefault();
  hideError('adminResetError');
  const email = $('#arEmail').value.trim().toLowerCase();
  const pw = $('#arPassword').value;
  const confirm = $('#arConfirm').value;

  if (!AUTHORIZED_TPO_EMAILS.includes(email)) {
    return showError('adminResetError', ['Unauthorized: This is not a verified TPO email.']);
  }
  if (!pw || pw !== confirm) {
    return showError('adminResetError', ['Passwords do not match.']);
  }

  const admins = getAdmins();
  const existingIndex = admins.findIndex(a => a.email === email);
  
  if (existingIndex >= 0) {
    admins[existingIndex].password = pw;
  } else {
    admins.push({ id: Date.now(), email, password: pw });
  }
  
  saveAdmins(admins);
  showSuccess('adminResetSuccess', 'Password saved. You can now log in.');
  e.target.reset();
  setTimeout(() => { $('#adminResetSuccess').style.display = 'none'; swap('adminResetForm', 'adminLoginForm'); }, 1200);
});

/* ---------- tpo login ---------- */
$('#adminLoginForm').addEventListener('submit', e => {
  e.preventDefault();
  hideError('adminLoginError');
  const email = $('#alEmail').value.trim().toLowerCase();
  const pw = $('#alPassword').value;
  const match = getAdmins().find(a => a.email === email && a.password === pw);
  if (!match) { showError('adminLoginError', ['Incorrect email or password, or password not set.']); return; }
  sessionStorage.setItem('cc_session', JSON.stringify({ role: 'admin', id: match.id }));
  renderDashboard();
});

/* ---------- Google Login Callback ---------- */
function handleGoogleLogin(response) {
  const responsePayload = JSON.parse(atob(response.credential.split('.')[1]));
  const googleEmail = responsePayload.email.toLowerCase();

  const students = getStudents();
  const match = students.find(s => s.email === googleEmail);

  if (!match) {
    showError('studentLoginError', ['This Google account is not registered. Please create a Skilvex account first.']);
    return;
  }

  sessionStorage.setItem('cc_session', JSON.stringify({ role: 'student', id: match.id }));
  renderDashboard();
}

/* ---------- dashboard ---------- */
function renderDashboard() {
  const session = JSON.parse(sessionStorage.getItem('cc_session') || 'null');
  if (!session) return;
  $('#authCard').querySelectorAll('.role-section, .segmented').forEach(el => el.style.display = 'none');
  $('#dashboard').classList.add('show');

  if (session.role === 'student') {
    const s = getStudents().find(x => x.id === session.id);
    if (!s) return logout();
    $('#dashTitle').textContent = 'Welcome, ' + s.name;
    $('#dashSub').textContent = s.enrollment + ' · ' + s.branch.toUpperCase() + ' · ' + s.year;
    $('#dashBody').innerHTML = `
      <div class="dash-row"><span>Email</span><span>${s.email}</span></div>
      <div class="dash-row"><span>Phone</span><span>${s.phone}</span></div>
      <div class="dash-row"><span>CGPA</span><span>${s.cgpa.toFixed(2)}</span></div>
      <div class="dash-row"><span>Placement Status</span><span class="dash-badge badge-good">Eligible</span></div>`;
  } else {
    const a = getAdmins().find(x => x.id === session.id);
    if (!a) return logout();
    const total = getStudents().length;
    $('#dashTitle').textContent = 'Welcome, TPO';
    $('#dashSub').textContent = 'Placement Administration';
    $('#dashBody').innerHTML = `
      <div class="dash-row"><span>Registered students</span><span>${total}</span></div>
      <div class="dash-row"><span>TPO Email</span><span>${a.email}</span></div>`;
  }
}
function logout() {
  sessionStorage.removeItem('cc_session');
  $('#dashboard').classList.remove('show');
  $('#authCard').querySelectorAll('.role-section, .segmented').forEach(el => el.style.display = '');
  $('#studentSection').classList.add('active');
  document.querySelector('#roleSwitch .seg-btn[data-role="student"]').classList.add('active');
  document.querySelector('#roleSwitch .seg-btn[data-role="admin"]').classList.remove('active');
}
$('#logoutBtn').addEventListener('click', logout);

/* ---------- restore session ---------- */
if (sessionStorage.getItem('cc_session')) renderDashboard();