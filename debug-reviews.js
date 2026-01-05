const https = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    });
  });
}

async function check() {
  try {
    console.log('Fetching Trip...');
    const tripRes = await get('http://localhost:3001/trips/public/iceland-northern-lights');
    if (!tripRes.success || !tripRes.data) {
      console.error('Failed to get trip', tripRes);
      return;
    }
    const tripId = tripRes.data.id;
    console.log('Trip ID:', tripId);

    console.log('Fetching Reviews...');
    const reviews = await get(`http://localhost:3001/reviews/${tripId}`);
    console.log('Reviews:', JSON.stringify(reviews, null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();
