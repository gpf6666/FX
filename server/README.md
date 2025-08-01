# WeChat Clone Server

仿微信聊天应用后端服务，支持 Glitch 部署。

## 功能特性

- ✅ 用户认证（注册/登录）
- ✅ 实时聊天（Socket.IO）
- ✅ 群聊功能
- ✅ 朋友圈功能
- ✅ 文件上传
- ✅ 好友管理
- ✅ 消息历史记录

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **Socket.IO** - 实时通信
- **MongoDB** - 数据库
- **Mongoose** - ODM
- **JWT** - 身份认证
- **Multer** - 文件上传

## 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **设置环境变量**
   ```bash
   cp env.example .env
   # 编辑 .env 文件，设置数据库连接等
   ```

3. **启动服务器**
   ```bash
   npm run dev
   ```

### Glitch 部署

1. 访问 [glitch.com](https://glitch.com)
2. 创建新项目，导入此目录
3. 在 `.env` 文件中设置环境变量
4. 等待自动部署

## 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `MONGODB_URI` | MongoDB 连接字符串 | `mongodb+srv://...` |
| `JWT_SECRET` | JWT 密钥 | `your-secret-key` |
| `CLIENT_URL` | 前端 URL | `https://gpf6666.github.io` |
| `PORT` | 服务器端口 | `3000` |

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `GET /api/users/search` - 搜索用户

### 聊天
- `GET /api/chats` - 获取聊天列表
- `POST /api/chats` - 创建聊天
- `GET /api/chats/:id/messages` - 获取消息历史

### 朋友圈
- `GET /api/moments` - 获取朋友圈
- `POST /api/moments` - 发布动态

## Socket.IO 事件

### 客户端 → 服务器
- `user_login` - 用户登录
- `private_message` - 发送私聊消息
- `group_message` - 发送群聊消息
- `join_group` - 加入群组
- `leave_group` - 离开群组

### 服务器 → 客户端
- `connection_confirmed` - 连接确认
- `new_message` - 新消息
- `new_group_message` - 新群聊消息
- `user_status` - 用户状态更新

## 项目结构

```
server/
├── index.js              # 主服务器文件
├── package.json          # 依赖配置
├── routes/               # 路由文件
│   ├── auth.js          # 认证路由
│   ├── users.js         # 用户路由
│   ├── chats.js         # 聊天路由
│   ├── moments.js       # 朋友圈路由
│   └── upload.js        # 文件上传路由
├── models/               # 数据模型
│   ├── User.js          # 用户模型
│   ├── Message.js       # 消息模型
│   ├── Group.js         # 群组模型
│   └── Moment.js        # 朋友圈模型
├── utils/                # 工具函数
│   └── envValidator.js  # 环境变量验证
└── uploads/              # 上传文件目录
```

## 部署

### Glitch 部署（推荐）

1. 访问 [glitch.com](https://glitch.com)
2. 点击 "New Project" → "Import from GitHub"
3. 输入 GitHub 仓库地址
4. 选择 `server` 目录
5. 设置环境变量
6. 等待自动部署

### 其他平台

- **Heroku**: 支持完整功能
- **Railway**: 支持完整功能
- **Render**: 支持完整功能

## 开发

### 添加新路由

1. 在 `routes/` 目录创建新文件
2. 在 `index.js` 中导入并注册路由
3. 更新 API 文档

### 添加新模型

1. 在 `models/` 目录创建新文件
2. 定义 Mongoose Schema
3. 导出模型

### 添加 Socket.IO 事件

1. 在 `index.js` 的 Socket.IO 部分添加事件处理
2. 更新事件文档

## 许可证

MIT License 