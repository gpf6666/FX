# Glitch 部署指南

## 什么是 Glitch？

Glitch 是一个免费的在线开发平台，特别适合 Node.js 应用部署。它支持：
- ✅ WebSocket (Socket.IO)
- ✅ 文件上传
- ✅ 环境变量
- ✅ 自动 HTTPS
- ✅ 免费托管

## 部署步骤

### 1. 准备项目

确保您的项目结构如下：
```
server/
├── index.js           # 主服务器文件（支持 Glitch 部署）
├── package.json       # 依赖配置
├── routes/            # 路由文件
├── models/            # 数据模型
├── utils/             # 工具函数
└── uploads/           # 上传文件目录
```

### 2. 创建 Glitch 项目

1. 访问 [glitch.com](https://glitch.com)
2. 点击 "New Project" → "Import from GitHub"
3. 输入您的 GitHub 仓库地址
4. 选择 `server` 目录作为根目录

### 3. 设置环境变量

在 Glitch 项目中：
1. 点击 `.env` 文件
2. 添加以下环境变量：

```env
# 数据库连接字符串
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/wechat-clone?retryWrites=true&w=majority

# JWT 密钥 (至少32个字符)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# 客户端URL
CLIENT_URL=https://gpf6666.github.io

# 环境
NODE_ENV=production
```

### 4. 等待部署

Glitch 会自动：
- 安装依赖 (`npm install`)
- 启动服务器 (`npm start`)
- 提供 HTTPS URL

### 5. 获取部署 URL

部署完成后，您会得到类似这样的 URL：
```
https://your-project-name.glitch.me
```

## 功能特性

### ✅ 完全支持的功能
- HTTP API 接口
- WebSocket 实时通信
- 文件上传和存储
- 数据库连接
- 用户认证

### ⚠️ 注意事项
- 免费版有使用限制
- 项目休眠后需要重新唤醒
- 文件存储有大小限制

## 更新部署

1. 在本地修改代码
2. 推送到 GitHub
3. Glitch 会自动重新部署

## 监控和日志

- 在 Glitch 控制台查看实时日志
- 监控应用状态和错误
- 查看访问统计

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MongoDB URI 格式
   - 确保网络连接正常

2. **WebSocket 连接失败**
   - 检查 CORS 配置
   - 确保客户端 URL 正确

3. **文件上传失败**
   - 检查文件大小限制
   - 确保 uploads 目录存在

### 获取帮助

- 查看 Glitch 控制台日志
- 检查环境变量配置
- 参考 Glitch 官方文档

## 优势对比

| 平台 | WebSocket | 文件上传 | 免费额度 | 部署难度 |
|------|-----------|----------|----------|----------|
| **Glitch** | ✅ 完全支持 | ✅ 支持 | 高 | 简单 |
| **Vercel** | ❌ 不支持 | ⚠️ 有限制 | 高 | 简单 |
| **Heroku** | ✅ 支持 | ✅ 支持 | 低 | 中等 |

Glitch 是您的聊天应用的最佳选择！ 