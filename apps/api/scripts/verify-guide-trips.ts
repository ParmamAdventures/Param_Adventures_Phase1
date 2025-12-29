

async function main() {
  const API_URL = 'http://localhost:3001';
  
  // 1. Login as Guide
  console.log('Logging in as guide...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'guide@local.test',
      password: 'password123'
    })
  });

  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    process.exit(1);
  }

  const { accessToken } = await loginRes.json() as any;
  console.log('Login successful.');

  // 2. Fetch Guide Trips
  console.log('Fetching guide trips...');
  const res = await fetch(`${API_URL}/users/guide/trips`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    console.error('Fetch failed:', await res.text());
    process.exit(1);
  }

  const trips = await res.json() as any[];
  console.log(`Found ${trips.length} assigned trips.`);

  if (trips.length > 0 && trips[0].slug === 'annapurna-circuit') {
    console.log('SUCCESS: Retrieved correct trip assignment.');
  } else {
    console.error('FAILURE: Unexpected trip data', JSON.stringify(trips, null, 2));
    process.exit(1);
  }
}

main().catch(console.error);
