import http from "http";


const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

const endpoints = [
  { path: '/health', name: 'Shallow Health' },
  { path: '/ready', name: 'Deep Readiness' }
];

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  cyan: "\x1b[36m"
};

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    console.log(`${colors.cyan}Checking ${endpoint.name} (${endpoint.path})...${colors.reset}`);
    const req = http.get({
      hostname: HOST,
      port: PORT,
      path: endpoint.path,
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200) {
        console.log(`  [PASS] ${endpoint.name} returned 200`);
        resolve(true);
      } else {
        console.log(`  [FAIL] ${endpoint.name} returned ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log(`  [FAIL] ${endpoint.name} error: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`  [FAIL] ${endpoint.name} timed out`);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`\n${colors.cyan}--- Starting Smoke Test ---${colors.reset}\n`);
  
  const results = await Promise.all(endpoints.map(checkEndpoint));
  const allPassed = results.every(res => res === true);

  console.log('\n---------------------------');
  if (allPassed) {
    console.log(`${colors.green}SYSTEM GO${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}SYSTEM FAILURE${colors.reset}`);
    process.exit(1);
  }
}

run();
