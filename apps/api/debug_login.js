const fetch = require('node-fetch');

async function debugLogin() {
  const url = "http://localhost:3001/auth/login";
  const body = JSON.stringify({
    email: "admin@paramadventures.com",
    password: "password123"
  });

  console.log(`Sending Login Request to: ${url}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });

    const status = res.status;
    const data = await res.json();

    console.log(`Status: ${status}`);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (res.headers.get('set-cookie')) {
      console.log("Cookie Received:", res.headers.get('set-cookie'));
    }

  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

debugLogin();
