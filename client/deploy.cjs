const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署...');

try {
  // 1. 构建项目
  console.log('📦 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. 检查 dist 目录是否存在
  const distPath = path.join(__dirname, 'dist');
  const docsPath = path.join(__dirname, 'docs');
  
  if (!fs.existsSync(distPath)) {
    throw new Error('构建失败：dist 目录不存在');
  }

  // 3. 删除旧的 docs 目录（如果存在）
  if (fs.existsSync(docsPath)) {
    console.log('🗑️  删除旧的 docs 目录...');
    fs.rmSync(docsPath, { recursive: true, force: true });
  }

  // 4. 重命名 dist 为 docs
  console.log('📁 重命名 dist 为 docs...');
  fs.renameSync(distPath, docsPath);

  // 5. 创建 .nojekyll 文件
  const nojekyllPath = path.join(docsPath, '.nojekyll');
  if (!fs.existsSync(nojekyllPath)) {
    console.log('📝 创建 .nojekyll 文件...');
    fs.writeFileSync(nojekyllPath, '');
  }

  // 6. 部署到 GitHub Pages
  console.log('🌐 部署到 GitHub Pages...');
  execSync('gh-pages -d docs', { stdio: 'inherit' });

  console.log('✅ 部署完成！');
  console.log('📋 请检查 GitHub Pages 设置：');
  console.log('   1. 进入仓库设置 → Pages');
  console.log('   2. 选择 Source: Deploy from a branch');
  console.log('   3. 选择 Branch: gh-pages');
  console.log('   4. 点击 Save');

} catch (error) {
  console.error('❌ 部署失败:', error.message);
  process.exit(1);
} 