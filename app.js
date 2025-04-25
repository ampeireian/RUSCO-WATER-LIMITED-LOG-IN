// Login/Register
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });
  const data = await res.json();
  if (data.success) {
    sessionStorage.setItem('worker', JSON.stringify(data));
    window.location.href = 'dashboard.html';
  }
});

// Submit Log
document.getElementById('logForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('worker_email', JSON.parse(sessionStorage.getItem('worker')).email);
  formData.append('job_type', document.getElementById('jobType').value);
  formData.append('photo', document.getElementById('photo').files[0]);
  await fetch('/submit-log', { method: 'POST', body: formData });
  alert('Log submitted!');
});