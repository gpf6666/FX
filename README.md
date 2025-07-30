# 微信风格聊天应用

一个完全模仿微信界面风格的实时聊天应用，具有完整的聊天记录同步功能。

## 功能特性

### 🎨 微信风格界面
- **完全微信化的UI设计**：深色侧边栏、绿色主题色、圆角气泡消息
- **响应式布局**：支持桌面端和移动端
- **消息气泡**：区分发送者和接收者，支持消息状态显示
- **时间分割线**：自动显示消息时间分组
- **消息分组**：同一发送者的连续消息自动分组显示

### 💬 聊天功能
- **私聊和群聊**：支持一对一和群组聊天
- **实时消息同步**：基于Socket.io的实时消息推送
- **消息状态**：发送中、已发送、已读状态显示
- **离线消息**：支持离线消息存储和同步
- **消息历史**：分页加载历史消息
- **表情支持**：内置表情选择器

### 🔄 聊天记录同步
- **实时同步**：消息实时推送到所有在线用户
- **离线存储**：消息持久化到MongoDB数据库
- **状态管理**：消息发送状态实时更新
- **重连机制**：网络断开自动重连
- **消息确认**：发送确认和已读回执

### 👥 用户管理
- **用户注册/登录**：完整的用户认证系统
- **好友系统**：添加好友、好友列表管理
- **在线状态**：实时显示用户在线/离线状态
- **群组管理**：创建群组、群组成员管理

### 🛠️ 技术特性
- **前端**：Vue 3 + Vite + Element Plus
- **后端**：Node.js + Express + Socket.io
- **数据库**：MongoDB + Mongoose
- **实时通信**：Socket.io WebSocket
- **状态管理**：Pinia
- **路由**：Vue Router

## 快速开始

### 环境要求
- Node.js 16+
- MongoDB 4.4+

### 安装依赖

```bash
# 安装服务端依赖
cd server
npm install

# 安装客户端依赖
cd ../client
npm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cd server
cp env.example .env
```

2. 配置MongoDB连接：
```bash
# server/.env
MONGODB_URI=mongodb://localhost:27017/wechat-clone
JWT_SECRET=your-jwt-secret
PORT=3000
```

### 启动应用

```bash
# 启动服务端
cd server
npm start

# 启动客户端
cd ../client
npm run dev
```

访问 http://localhost:5173 开始使用

## 项目结构

```
demo/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── stores/        # 状态管理
│   │   ├── router/        # 路由配置
│   │   └── assets/        # 静态资源
│   └── index.html         # HTML模板
├── server/                # 后端应用
│   ├── routes/           # API路由
│   ├── models/           # 数据模型
│   └── index.js          # 服务器入口
└── README.md
```

## 主要功能说明

### 微信风格界面
- **侧边栏**：深色主题，显示聊天列表
- **消息区域**：浅色背景，消息气泡布局
- **输入区域**：工具栏、表情选择器、语音录制
- **响应式设计**：移动端友好的布局

### 聊天记录同步
1. **消息发送流程**：
   - 用户输入消息
   - 立即显示在本地（状态：发送中）
   - 通过Socket发送到服务器
   - 服务器广播给接收者
   - 更新消息状态（已发送/已读）

2. **离线消息处理**：
   - 消息存储到数据库
   - 用户上线时自动同步
   - 支持分页加载历史消息

3. **状态管理**：
   - 发送中：⏳ 图标
   - 已发送：✓ 图标
   - 已读：✓✓ 图标

### Socket连接管理
- **自动重连**：网络断开自动重连
- **心跳检测**：保持连接活跃
- **连接状态**：实时显示连接状态
- **错误处理**：完善的错误处理机制

## 开发说明

### 添加新功能
1. 在 `client/src/views/` 创建新页面
2. 在 `client/src/router/` 添加路由
3. 在 `server/routes/` 添加API接口
4. 在 `server/models/` 添加数据模型

### 样式定制
- 主要样式在 `client/src/views/Chat.vue` 中
- 图标样式在 `client/src/assets/icons.css` 中
- 支持响应式设计

### 数据库操作
- 用户模型：`server/models/User.js`
- 消息模型：`server/models/Message.js`
- 群组模型：`server/models/Group.js`

## 部署说明

### 生产环境部署
1. 构建前端：
```bash
cd client
npm run build
```

2. 配置环境变量
3. 启动服务器：
```bash
cd server
npm start
```

### Docker部署
```bash
# 构建镜像
docker build -t wechat-clone .

# 运行容器
docker run -p 3000:3000 wechat-clone
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发者。 