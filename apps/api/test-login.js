const axios = require('axios');

async function quickLoginTest() {
  try {
    console.log('\n🔐 Testing login...');
    console.log('Email: admin@paramadventures.com');
    console.log('Password: Admin@123\n');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@paramadventures.com',
      password: 'Admin@123',
    });
    
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('Token:', response.data.data.token.substring(0, 20) + '...');
    console.log('\n✅ The refactored controllers should work fine!');
    console.log('Your admin credentials are correct.\n');
    
  } catch (error) {
    console.log('❌ LOGIN FAILED');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Check if database is seeded');
    console.log('2. Try password: Demo@2026 (alternate from seeds)');
    console.log('3. Reset admin password in database\n');
  }
}

quickLoginTest();
