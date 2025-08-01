// API测试脚本
const https = require('https');

const API_URL = 'https://surviving-chandal-starkhome-2f8d1e2b.koyeb.app';

// 测试根路径
function testRoot() {
  return new Promise((resolve, reject) => {
    const req = https.get(`${API_URL}/`, {
      rejectUnauthorized: false
    }, (res) => {
      console.log('✅ 根路径响应状态:', res.statusCode);
      console.log('✅ 响应头:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ 响应内容:', data.substring(0, 200) + '...');
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ 根路径请求失败:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 测试登录API
function testLoginAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'test',
      password: 'test'
    });
    
    const options = {
      hostname: 'surviving-chandal-starkhome-2f8d1e2b.koyeb.app',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      console.log('✅ 登录API响应状态:', res.statusCode);
      console.log('✅ 响应头:', res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✅ 响应内容:', data.substring(0, 200) + '...');
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ 登录API请求失败:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.write(postData);
    req.end();
  });
}

// 运行测试
async function runTests() {
  console.log('🚀 开始测试API连接...\n');
  
  try {
    console.log('1. 测试根路径...');
    await testRoot();
    
    console.log('\n2. 测试登录API...');
    await testLoginAPI();
    
    console.log('\n🎉 所有测试完成！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
  }
}

runTests(); 