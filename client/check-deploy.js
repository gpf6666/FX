const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 检查部署状态...');

// 检查本地构建文件
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ dist 目录不存在，请先运行 npm run build');
  process.exit(1);
}

const indexPath = path.join(distPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('❌ index.html 不存在，构建可能失败');
  process.exit(1);
}

console.log('✅ 本地构建文件检查通过');

// 检查 GitHub Pages 状态
const checkGitHubPages = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'gpf6666.github.io',
      port: 443,
      path: '/FX/',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      console.log(`📡 GitHub Pages 响应状态: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ GitHub Pages 部署成功！');
        console.log('🌐 访问地址: https://gpf6666.github.io/FX/');
        resolve(true);
      } else if (res.statusCode === 404) {
        console.log('⚠️  GitHub Pages 返回 404，可能正在部署中...');
        console.log('⏳ 请等待 1-5 分钟后重试');
        resolve(false);
      } else {
        console.log(`❌ GitHub Pages 响应异常: ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log('❌ 无法连接到 GitHub Pages');
      console.log('💡 可能的原因:');
      console.log('   1. 部署还在进行中');
      console.log('   2. GitHub Pages 配置错误');
      console.log('   3. 网络连接问题');
      reject(error);
    });

    req.on('timeout', () => {
      console.log('⏰ 连接超时，GitHub Pages 可能还在部署中');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
};

// 执行检查
checkGitHubPages()
  .then((success) => {
    if (success) {
      console.log('\n🎉 部署检查完成！');
    } else {
      console.log('\n📋 下一步操作:');
      console.log('   1. 检查 GitHub 仓库设置 → Pages');
      console.log('   2. 确认 Source 设置为 "Deploy from a branch"');
      console.log('   3. 确认 Branch 设置为 "gh-pages"');
      console.log('   4. 等待部署完成（通常 1-5 分钟）');
    }
  })
  .catch((error) => {
    console.log('\n❌ 检查失败:', error.message);
  }); 