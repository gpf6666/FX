# Render部署故障排除指南

## 常见问题及解决方案

### 1. npm退出处理程序错误

**错误信息：**
```
npm 错误 退出 处理程序 从未 调用！
```

**解决方案：**
- 使用提供的`.npmrc`配置文件
- 设置`legacy-peer-deps=true`
- 使用Node.js 18.x版本

### 2. 构建失败

**检查步骤：**
1. 确保所有环境变量已设置
2. 检查MongoDB连接字符串
3. 验证JWT_SECRET长度（至少32字符）

### 3. 环境变量配置

在Render控制台中设置以下环境变量：

**必需变量：**
- `MONGODB_URI`: MongoDB连接字符串
- `JWT_SECRET`: JWT密钥（至少32字符）

**可选变量：**
- `PORT`: 端口号（Render自动设置）
- `NODE_ENV`: 环境（production）
- `CLIENT_URL`: 前端URL
- `RENDER`: 设置为true

### 4. 部署步骤

1. 推送代码到GitHub
2. 在Render中连接GitHub仓库
3. 选择Node.js环境
4. 设置环境变量
5. 部署

### 5. 日志查看

如果部署失败，查看Render日志：
- 构建日志：显示npm安装过程
- 运行时日志：显示应用启动过程

### 6. 手动部署命令

```bash
# 清理缓存
npm cache clean --force

# 安装依赖
cd server && npm install --production

# 启动服务
npm start
```

### 7. 联系支持

如果问题持续存在：
1. 检查Render状态页面
2. 查看完整错误日志
3. 联系Render支持团队 