import axios from "axios";

async function main() {
  const url = "http://localhost:3000/auth/login";
  const payload = { email: "test@test.com", password: "wrong" };

  console.log("Testing Auth Rate Limit (Max 5)...");

  for (let i = 1; i <= 7; i++) {
    try {
      await axios.post(url, payload);
      console.log(`Request ${i}: Success (Expected 401 or 200)`);
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 429) {
          console.log(`Request ${i}: BLOCKED (429) - SUCCESS!`);
        } else {
          console.log(`Request ${i}: Status ${err.response.status}`);
        }
      } else {
        console.log(`Request ${i}: Error ${err.message}`);
      }
    }
  }
}

main();
