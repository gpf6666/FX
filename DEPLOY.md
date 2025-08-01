# Render 平台部署指南

## 简化部署结构

本项目已优化为完全依赖Render平台自动部署，无需复杂配置。

### 项目结构
```
FX/
├── server/              # 服务器代码
│   ├── index.js         # 主入口文件
│   ├── package.json     # 依赖配置
│   ├── models/          # 数据模型
│   ├── routes/          # 路由
│   └── utils/           # 工具函数
├── client/              # 前端代码（独立部署）
└── render.yaml          # Render配置
```

### 部署步骤

1. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "优化为Render平台部署"
   git push
   ```

2. **在Render中创建服务**
   - 连接GitHub仓库
   - 选择Node.js环境
   - 设置根目录为 `server`
   - 自动检测配置

3. **设置环境变量**
   - `MONGODB_URI`: MongoDB连接字符串
   - `JWT_SECRET`: JWT密钥（至少32字符）
   - `CLIENT_URL`: 前端URL（可选）

### 平台优势

✅ **自动检测** - Render自动识别Node.js项目
✅ **零配置** - 无需复杂构建脚本
✅ **快速部署** - 依赖安装优化
✅ **自动重启** - 代码更新自动部署

### 故障排除

如果遇到问题：
1. 检查环境变量是否正确设置
2. 查看Render构建日志
3. 确保MongoDB连接正常

### 前端部署

前端代码独立部署到GitHub Pages：
```bash
cd client
npm run deploy
``` 