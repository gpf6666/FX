# 项目部署指南

## 前端部署 (GitHub Pages)

### 1. 构建前端项目
```bash
cd client
npm run build
```

### 2. 配置 GitHub Pages
1. 在 GitHub 仓库设置中启用 GitHub Pages
2. 选择 `gh-pages` 分支或 `main` 分支的 `/docs` 目录
3. 配置自定义域名（可选）

### 3. 自动部署配置
在 `client/package.json` 中添加部署脚本：
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

## 后端部署 (Vercel)

### 1. 准备部署
确保 `server/vercel.json` 文件已创建（已包含在项目中）

### 2. 环境变量配置
在 Vercel 控制台中设置以下环境变量：
- `MONGODB_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 密钥
- `PORT`: 端口号（Vercel 会自动设置）

### 3. 部署步骤

#### 方法一：使用 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
cd server
vercel

# 生产环境部署
vercel --prod
```

#### 方法二：GitHub 集成
1. 在 [Vercel](https://vercel.com) 注册账号
2. 导入 GitHub 仓库
3. 设置根目录为 `server`
4. 配置环境变量
5. 自动部署

### 4. 获取部署 URL
部署完成后，Vercel 会提供类似 `https://your-app.vercel.app` 的 URL

## 数据库部署

### MongoDB Atlas (推荐)
1. 注册 [MongoDB Atlas](https://www.mongodb.com/atlas)
2. 创建免费集群
3. 获取连接字符串
4. 在 Vercel 环境变量中设置 `MONGODB_URI`

### 连接字符串格式
```
mongodb+srv://your-username:your-password@your-cluster.mongodb.net/database?retryWrites=true&w=majority
```

## 前端配置更新

部署后端后，需要更新前端的 API 基础 URL：

### 1. 更新 API 配置
在 `client/src/config/` 目录下创建配置文件：

```javascript
// client/src/config/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.vercel.app' 
  : 'http://localhost:3000'

export default API_BASE_URL
```

### 2. 更新 axios 配置
在 `client/src/main.js` 或相关文件中：
```javascript
import axios from 'axios'
import API_BASE_URL from './config/api'

axios.defaults.baseURL = API_BASE_URL
```

## 域名配置

### 1. 自定义域名
- **前端**: 在 GitHub Pages 设置中配置
- **后端**: 在 Vercel 控制台中配置

### 2. CORS 配置
确保后端允许前端域名访问：
```javascript
// server/index.js
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5173'],
  credentials: true
}))
```

## 监控和维护

### 1. 日志监控
- Vercel 提供内置日志查看
- 可以集成第三方监控服务

### 2. 性能监控
- Vercel Analytics
- 自定义性能监控

### 3. 备份策略
- 定期备份 MongoDB 数据
- 代码版本控制

## 常见问题

### 1. 环境变量问题
确保所有环境变量都在 Vercel 控制台中正确设置

### 2. CORS 错误
检查前端域名是否在后端 CORS 配置中

### 3. 数据库连接问题
确保 MongoDB Atlas 网络访问设置正确

### 4. 文件上传问题
Vercel 是无服务器环境，文件上传需要使用外部存储服务（如 AWS S3、Cloudinary）

## 成本估算

### 免费额度
- **Vercel**: 每月 100GB 带宽，1000 次函数调用
- **MongoDB Atlas**: 512MB 存储，共享集群
- **GitHub Pages**: 无限流量

### 付费升级
- **Vercel Pro**: $20/月
- **MongoDB Atlas**: 按使用量计费
- **自定义域名**: 域名注册费用

## 安全建议

1. 使用强密码和 JWT 密钥
2. 定期更新依赖包
3. 启用 HTTPS
4. 设置适当的 CORS 策略
5. 监控异常访问 