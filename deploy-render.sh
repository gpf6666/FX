#!/bin/bash

# Render部署脚本
set -e

echo "🚀 开始部署到Render..."

# 设置npm配置
export NPM_CONFIG_LOGLEVEL=error
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false

# 清理缓存
echo "🧹 清理npm缓存..."
npm cache clean --force

# 安装依赖
echo "📦 安装服务器依赖..."
cd server
npm install --production --no-optional --no-audit --no-fund

# 验证安装
echo "✅ 验证安装..."
node -v
npm -v

# 启动服务
echo "🚀 启动服务器..."
npm start 