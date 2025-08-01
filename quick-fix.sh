#!/bin/bash

# 快速修复Render部署问题
echo "🔧 快速修复Render部署问题..."

# 1. 更新Node.js版本
echo "📦 更新Node.js版本到20.x..."
sed -i 's/"node": "18.x"/"node": "20.x"/g' server/package.json

# 2. 优化npm配置
echo "⚙️ 优化npm配置..."
cat > server/.npmrc << EOF
# 解决npm退出处理程序错误
legacy-peer-deps=true
fund=false
audit=false
loglevel=error

# Render平台优化
cache=.npm-cache
prefer-offline=true

# 网络优化
registry=https://registry.npmjs.org/
fetch-retries=3
fetch-retry-mintimeout=5000
fetch-retry-maxtimeout=60000

# 性能优化
maxsockets=50
EOF

# 3. 更新构建命令
echo "🚀 更新构建命令..."
cat > render.yaml << EOF
services:
  - type: web
    name: wechat-clone-server
    env: node
    plan: free
    buildCommand: chmod +x render-build.sh && ./render-build.sh
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLIENT_URL
        value: https://gpf6666.github.io
      - key: RENDER
        value: true
EOF

echo "✅ 快速修复完成！"
echo "�� 请提交更改并重新部署到Render" 