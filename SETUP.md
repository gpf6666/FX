# 微信风格聊天应用 - 设置指南

## 环境准备

### 1. 安装Node.js
- 下载并安装 [Node.js](https://nodejs.org/) (推荐版本 16+)
- 验证安装：`node --version` 和 `npm --version`

### 2. 安装MongoDB
#### 选项1：本地MongoDB
- 下载并安装 [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- 启动MongoDB服务：
  ```bash
  # Windows
  net start MongoDB
  
  # macOS/Linux
  sudo systemctl start mongod
  ```

#### 选项2：MongoDB Atlas (云数据库)
- 注册 [MongoDB Atlas](https://www.mongodb.com/atlas)
- 创建免费集群
- 获取连接字符串

### 3. 项目设置

#### 克隆项目
```bash
git clone <repository-url>
cd demo
```

#### 安装依赖
```bash
# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

#### 配置环境变量
1. 复制环境变量模板：
```bash
cd server
cp env.example .env
```

2. 编辑 `.env` 文件：
```bash
# MongoDB连接
MONGODB_URI=mongodb://localhost:27017/wechat-clone
# 或者使用MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wechat-clone

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key

# 服务器端口
PORT=3000

# 客户端URL (用于CORS)
CLIENT_URL=http://localhost:5173
```

## 启动应用

### 方法1：使用启动脚本 (Windows)
```bash
# 双击运行
start.bat
```

### 方法2：手动启动
```bash
# 终端1：启动服务端
cd server
npm start

# 终端2：启动客户端
cd client
npm run dev
```

### 方法3：使用npm脚本
```bash
# 根目录
npm run dev:server  # 启动服务端
npm run dev:client  # 启动客户端
```

## 访问应用

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000
- **API文档**: http://localhost:3000/api

## 功能测试

### 1. 用户注册/登录
1. 访问 http://localhost:5173
2. 点击"注册"创建新账户
3. 使用账户登录

### 2. 聊天功能
1. 登录后进入聊天界面
2. 添加好友或创建群组
3. 开始发送消息

### 3. 实时功能
1. 打开多个浏览器窗口
2. 使用不同账户登录
3. 测试实时消息推送

## 常见问题

### Q: MongoDB连接失败
**A**: 检查以下项目：
- MongoDB服务是否启动
- 连接字符串是否正确
- 网络连接是否正常

### Q: Socket连接失败
**A**: 检查以下项目：
- 服务端是否正常启动
- 端口3000是否被占用
- 防火墙设置

### Q: 前端无法访问
**A**: 检查以下项目：
- 客户端是否正常启动
- 端口5173是否被占用
- 浏览器控制台错误信息

### Q: 消息发送失败
**A**: 检查以下项目：
- 用户是否已登录
- Socket连接是否正常
- 数据库连接是否正常

## 开发模式

### 热重载
- 前端：修改代码后自动刷新
- 后端：使用 `nodemon` 自动重启

### 调试
- 前端：浏览器开发者工具
- 后端：VS Code调试器或 `console.log`

### 数据库管理
- 使用 MongoDB Compass 可视化工具
- 或使用命令行工具 `mongo`

## 生产部署

### 1. 构建前端
```bash
cd client
npm run build
```

### 2. 配置生产环境
```bash
# 设置环境变量
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### 3. 启动生产服务器
```bash
cd server
npm start
```

## 技术支持

如遇到问题，请：
1. 查看控制台错误信息
2. 检查网络连接
3. 验证环境配置
4. 提交Issue获取帮助

## 更新日志

### v2.0.0 - 微信风格优化
- ✅ 完全微信化的UI设计
- ✅ 聊天记录同步功能
- ✅ 消息状态管理
- ✅ 离线消息支持
- ✅ 自动重连机制
- ✅ 响应式设计

### v1.0.0 - 基础功能
- ✅ 用户认证系统
- ✅ 私聊和群聊
- ✅ 实时消息推送
- ✅ 朋友圈功能 