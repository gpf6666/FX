# 安全配置指南

## ⚠️ 重要安全提醒

**永远不要将真实的数据库密码、API密钥或其他敏感信息提交到Git仓库！**

## 环境变量管理

### 1. 本地开发环境

创建 `.env` 文件（不要提交到Git）：
```bash
# server/.env (本地开发)
MONGODB_URI=mongodb://localhost:27017/wechat-clone
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
```

### 2. 生产环境

在 Vercel 控制台中设置环境变量：
- `MONGODB_URI`: 你的真实 MongoDB 连接字符串
- `JWT_SECRET`: 你的真实 JWT 密钥
- `PORT`: 端口号（Vercel 自动设置）

## 敏感信息检查清单

### ✅ 已安全配置
- `.gitignore` 文件已配置忽略 `.env` 文件
- 示例文件使用占位符，不包含真实密码
- 部署文档使用示例格式

### 🔒 安全最佳实践

1. **环境变量**
   - 使用 `.env` 文件存储本地配置
   - 生产环境使用云平台的环境变量功能
   - 定期轮换密钥和密码

2. **数据库安全**
   - 使用强密码
   - 启用网络访问控制
   - 定期备份数据
   - 监控异常访问

3. **JWT 安全**
   - 使用足够长的随机密钥
   - 设置合理的过期时间
   - 定期轮换密钥

4. **API 安全**
   - 启用 CORS 保护
   - 验证所有输入
   - 使用 HTTPS
   - 实施速率限制

## 如果密码已泄露

### 立即行动
1. **更改数据库密码**
2. **轮换 JWT 密钥**
3. **检查 Git 历史**
4. **通知相关方**

### 检查 Git 历史
```bash
# 查看是否提交了敏感信息
git log --all --full-history -- .env
git log --all --full-history -- "*.env*"

# 如果发现敏感信息，需要清理历史
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## 安全工具推荐

### 1. 密码生成器
```bash
# 生成强密码
openssl rand -base64 32

# 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. 环境变量验证
在应用启动时验证所有必需的环境变量：
```javascript
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET']
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

## 监控和日志

### 1. 安全日志
记录所有敏感操作：
- 用户登录/注册
- 密码更改
- 权限变更
- 异常访问

### 2. 监控指标
- 失败的登录尝试
- 异常的 API 调用
- 数据库连接错误
- 内存和 CPU 使用率

## 定期安全检查

### 每周检查
- [ ] 检查依赖包安全更新
- [ ] 审查访问日志
- [ ] 验证备份完整性

### 每月检查
- [ ] 轮换密钥和密码
- [ ] 更新安全策略
- [ ] 进行安全培训

### 每季度检查
- [ ] 安全审计
- [ ] 渗透测试
- [ ] 更新安全文档 