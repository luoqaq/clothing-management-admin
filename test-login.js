#!/usr/bin/env node

const http = require('http');

// 测试服务器连接
console.log('Testing server connection...');

const options = {
  hostname: 'localhost',
  port: 5174,
  path: '/',
  method: 'GET',
};

http.request(options, (res) => {
  console.log(`✅ Server is running. Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`\n🔗 Website: http://localhost:5174`);
  console.log('\n📝 Test Login Functionality:');
  console.log('1. Open http://localhost:5174 in your browser');
  console.log('2. You should see the login page');
  console.log('3. Try logging in with:');
  console.log('   Username: admin');
  console.log('   Password: password');
  console.log('4. If successful, you should be redirected to the dashboard');
  console.log('\n⚠️  Since we are using MSW for mocking APIs, data will be simulated');
  console.log('⚠️  No actual backend server is connected');
  console.log('\n🎯 To stop the dev server, press Ctrl+C');
}).on('error', (error) => {
  console.error(`❌ Server error: ${error.message}`);
  console.log('\n📝 Make sure the development server is running:');
  console.log('   npm run dev');
}).end();
