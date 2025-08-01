const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

// 导入环境变量验证工具
const { validateEnvironment, logEnvInfo } = require('./utils/envValidator');

// 导入路由
const { router: authRoutes } = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const momentRoutes = require('./routes/moments');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://gpf6666.github.io",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 验证环境变量
try {
  validateEnvironment();
  logEnvInfo();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

// 数据库连接
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// 在 Glitch 环境中添加 SSL 选项
if (process.env.PROJECT_DOMAIN) {
  mongooseOptions.ssl = true;
  mongooseOptions.sslValidate = false;
}

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 根路径欢迎页面
app.get('/', (req, res) => {
  res.json({
    message: 'WeChat Clone API Server',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: 'Glitch',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      chats: '/api/chats',
      moments: '/api/moments',
      upload: '/api/upload'
    }
  });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/moments', momentRoutes);
app.use('/api/upload', uploadRoutes);

// Socket.io 连接处理
const connectedUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId
const userRooms = new Map(); // userId -> [roomIds]

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 用户登录
  socket.on('user_login', (userId) => {
    // 如果用户已经在其他地方登录，断开旧连接
    const oldSocketId = connectedUsers.get(userId);
    if (oldSocketId && oldSocketId !== socket.id) {
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.disconnect(true);
        console.log(`Disconnected old connection for user ${userId}`);
      }
    }

    // 记录新连接
    connectedUsers.set(userId, socket.id);
    userSockets.set(socket.id, userId);
    socket.userId = userId;
    
    // 加入用户专属房间
    socket.join(`user_${userId}`);
    
    console.log(`User ${userId} logged in with socket ${socket.id}`);
    
    // 广播用户上线状态
    socket.broadcast.emit('user_status', { userId, status: 'online' });
    
    // 发送连接确认
    socket.emit('connection_confirmed', { userId, socketId: socket.id });
  });

  // 私聊消息
  socket.on('private_message', async (data) => {
    console.log('Private message received:', data);
    
    try {
      // 验证发送者身份
      if (socket.userId !== data.sender._id) {
        console.error('Unauthorized message attempt');
        return;
      }

      const targetSocketId = connectedUsers.get(data.receiver);
      if (targetSocketId) {
        // 发送给接收者
        io.to(targetSocketId).emit('new_message', {
          ...data,
          timestamp: new Date(),
          status: 'received'
        });
        
        // 发送确认给发送者
        socket.emit('message_sent', {
          messageId: data._id || Date.now().toString(),
          receiver: data.receiver,
          timestamp: new Date()
        });
        
        console.log(`Message sent to ${data.receiver} via socket ${targetSocketId}`);
      } else {
        // 接收者离线，消息会被存储到数据库
        console.log(`User ${data.receiver} is not online, message will be stored`);
        
        // 发送确认给发送者
        socket.emit('message_sent', {
          messageId: data._id || Date.now().toString(),
          receiver: data.receiver,
          timestamp: new Date(),
          offline: true
        });
      }
    } catch (error) {
      console.error('Error handling private message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // 群聊消息
  socket.on('group_message', async (data) => {
    console.log('Group message received:', data);
    
    try {
      // 验证发送者身份
      if (socket.userId !== data.sender._id) {
        console.error('Unauthorized group message attempt');
        return;
      }

      // 这里需要从数据库获取群组成员
      // 暂时使用传入的成员列表
      if (data.groupMembers && Array.isArray(data.groupMembers)) {
        const sentTo = [];
        
        data.groupMembers.forEach(memberId => {
          if (memberId !== data.sender._id) {
            const memberSocketId = connectedUsers.get(memberId);
            if (memberSocketId) {
              io.to(memberSocketId).emit('new_group_message', {
                ...data,
                timestamp: new Date(),
                status: 'received'
              });
              sentTo.push(memberId);
              console.log(`Group message sent to ${memberId} via socket ${memberSocketId}`);
            }
          }
        });
        
        // 发送确认给发送者
        socket.emit('message_sent', {
          messageId: data._id || Date.now().toString(),
          groupId: data.groupId,
          sentTo,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling group message:', error);
      socket.emit('message_error', { error: 'Failed to send group message' });
    }
  });

  // 标记消息为已读
  socket.on('mark_message_read', (data) => {
    console.log('Mark message as read:', data);
    
    try {
      // 这里可以更新数据库中的消息状态
      // 并通知发送者消息已被阅读
      
      // 通知发送者
      const senderSocketId = connectedUsers.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message_read', {
          messageId: data.messageId,
          readerId: socket.userId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // 加入群组房间
  socket.on('join_group', (groupId) => {
    socket.join(`group_${groupId}`);
    
    if (!userRooms.has(socket.userId)) {
      userRooms.set(socket.userId, []);
    }
    userRooms.get(socket.userId).push(`group_${groupId}`);
    
    console.log(`User ${socket.userId} joined group ${groupId}`);
  });

  // 离开群组房间
  socket.on('leave_group', (groupId) => {
    socket.leave(`group_${groupId}`);
    
    const userRoomList = userRooms.get(socket.userId);
    if (userRoomList) {
      const index = userRoomList.indexOf(`group_${groupId}`);
      if (index > -1) {
        userRoomList.splice(index, 1);
      }
    }
    
    console.log(`User ${socket.userId} left group ${groupId}`);
  });

  // 朋友圈更新
  socket.on('moment_update', (data) => {
    console.log('Moment update received:', data);
    
    try {
      // 验证发送者身份
      if (socket.userId !== data.userId) {
        console.error('Unauthorized moment update attempt');
        return;
      }
      
      io.emit('new_moment', {
        ...data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error handling moment update:', error);
    }
  });

  // 心跳检测
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date() });
  });

  // 断开连接
  socket.on('disconnect', (reason) => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      userSockets.delete(socket.id);
      userRooms.delete(socket.userId);
      
      console.log(`User ${socket.userId} disconnected: ${reason}`);
      
      // 广播用户下线状态
      socket.broadcast.emit('user_status', { 
        userId: socket.userId, 
        status: 'offline',
        timestamp: new Date()
      });
    }
    console.log('User disconnected:', socket.id);
  });

  // 错误处理
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// 定期清理断开的连接
setInterval(() => {
  const now = Date.now();
  for (const [socketId, userId] of userSockets.entries()) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket || !socket.connected) {
      connectedUsers.delete(userId);
      userSockets.delete(socketId);
      userRooms.delete(userId);
      console.log(`Cleaned up disconnected socket: ${socketId} for user: ${userId}`);
    }
  }
}, 30000); // 每30秒清理一次

// 导出io实例供路由使用
app.set('io', io);

// Glitch 使用 process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO available at http://localhost:${PORT}`);
  console.log(`🌐 Platform: ${process.env.PROJECT_DOMAIN ? 'Glitch' : 'Local'}`);
}); 