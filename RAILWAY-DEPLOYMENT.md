# Railway 部署指南

## 什么是 Railway？

Railway 是一个现代化的云平台，特别适合 Node.js 应用部署。它提供：
- ✅ WebSocket (Socket.IO) 完全支持
- ✅ 文件上传和存储
- ✅ 环境变量管理
- ✅ 自动 HTTPS
- ✅ 免费额度（每月 $5）
- ✅ 简单部署流程

## 部署步骤

### 1. 准备项目

确保您的项目结构如下：
```
server/
├── index.js              # 主服务器文件
├── package.json          # 依赖配置
├── railway.json          # Railway 配置
├── routes/               # 路由文件
├── models/               # 数据模型
├── utils/                # 工具函数
└── uploads/              # 上传文件目录
```

### 2. 创建 Railway 项目

1. 访问 [railway.app](https://railway.app)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择您的 GitHub 仓库
6. 选择 `server` 目录作为根目录

### 3. 设置环境变量

在 Railway 控制台中：
1. 点击项目 → "Variables" 标签
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

# Railway 环境标识
RAILWAY_ENVIRONMENT=production
```

### 4. 等待部署

Railway 会自动：
- 检测项目类型
- 安装依赖 (`npm install`)
- 构建项目
- 启动服务器 (`npm start`)
- 提供 HTTPS URL

### 5. 获取部署 URL

部署完成后，您会得到类似这样的 URL：
```
https://your-project-name.railway.app
```

## 功能特性

### ✅ 完全支持的功能
- HTTP API 接口
- WebSocket 实时通信
- 文件上传和存储
- 数据库连接
- 用户认证
- 自动重启
- 健康检查

### ⚠️ 注意事项
- 免费版每月有 $5 额度限制
- 项目休眠后需要重新唤醒
- 文件存储有大小限制

## 更新部署

1. 在本地修改代码
2. 推送到 GitHub
3. Railway 会自动重新部署

## 监控和日志

- 在 Railway 控制台查看实时日志
- 监控应用状态和错误
- 查看资源使用情况
- 设置告警通知

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MongoDB URI 格式
   - 确保网络连接正常
   - 检查 IP 白名单设置

2. **WebSocket 连接失败**
   - 检查 CORS 配置
   - 确保客户端 URL 正确
   - 验证环境变量设置

3. **文件上传失败**
   - 检查文件大小限制
   - 确保 uploads 目录存在
   - 验证文件权限

4. **部署失败**
   - 检查 `package.json` 配置
   - 查看构建日志
   - 验证环境变量

### 获取帮助

- 查看 Railway 控制台日志
- 检查环境变量配置
- 参考 [Railway 官方文档](https://docs.railway.app)

## 优势对比

| 平台 | WebSocket | 文件上传 | 免费额度 | 部署难度 | 稳定性 |
|------|-----------|----------|----------|----------|--------|
| **Railway** | ✅ 完全支持 | ✅ 支持 | $5/月 | 简单 | 高 |
| **Glitch** | ✅ 完全支持 | ✅ 支持 | 高 | 简单 | ❌ 已停止 |
| **Vercel** | ❌ 不支持 | ⚠️ 有限制 | 高 | 简单 | 高 |
| **Heroku** | ✅ 支持 | ✅ 支持 | 低 | 中等 | 高 |

## 价格说明

### 免费版
- 每月 $5 免费额度
- 适合个人项目和小型应用
- 包含所有功能

### 付费版
- 按实际使用量计费
- 无限制使用
- 优先支持

## 最佳实践

1. **环境变量管理**
   - 使用 Railway 的环境变量功能
   - 不要将敏感信息提交到代码库

2. **日志监控**
   - 定期查看应用日志
   - 设置错误告警

3. **资源优化**
   - 监控资源使用情况
   - 优化代码以减少资源消耗

4. **备份策略**
   - 定期备份数据库
   - 保存重要配置文件

Railway 是替代 Glitch 的最佳选择！ 