#!/bin/bash

# Render构建脚本 - 解决卡住问题
set -e

echo "🚀 开始Render构建..."

# 设置环境变量
export NODE_ENV=production
export NPM_CONFIG_LOGLEVEL=error
export NPM_CONFIG_FUND=false
export NPM_CONFIG_AUDIT=false

# 显示Node.js和npm版本
echo "📋 环境信息:"
node --version
npm --version

# 清理并安装依赖
echo "📦 安装依赖..."
cd server

# 清理缓存
npm cache clean --force

# 使用npm ci进行快速安装
npm ci --only=production --no-audit --no-fund --prefer-offline

echo "✅ 依赖安装完成"

# 验证安装
echo "🔍 验证安装..."
ls -la node_modules | head -10

echo "🎉 构建成功完成" 