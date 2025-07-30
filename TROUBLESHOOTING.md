# GitHub Pages 部署故障排除指南

## 🚨 部署不生效的常见原因

### 1. GitHub Pages 配置问题

**检查步骤：**
1. 进入 https://github.com/gpf6666/FX/settings/pages
2. 确认以下设置：
   - **Source**: `Deploy from a branch`
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`

**如果配置错误：**
- 点击 "Save" 保存正确配置
- 等待几分钟让 GitHub 重新部署

### 2. 仓库可见性问题

**免费账户限制：**
- ✅ **公开仓库**: 可以启用 GitHub Pages
- ❌ **私有仓库**: 需要 GitHub Pro 账户

**检查方法：**
- 在仓库页面查看是否有 "Public" 标签
- 如果没有，需要将仓库设为公开

### 3. 分支问题

**检查 gh-pages 分支：**
```bash
git branch -a
```
应该看到 `remotes/origin/gh-pages`

**如果分支不存在：**
```bash
cd client
npm run deploy
```

### 4. 文件结构问题

**正确的 gh-pages 分支应该包含：**
```
gh-pages/
├── index.html          # 主页面
├── assets/             # 静态资源
├── *.svg              # 图片资源
└── .nojekyll          # 禁用 Jekyll
```

## 🔧 解决方案

### 方案一：重新配置 GitHub Pages

1. **进入设置页面**：
   - 访问：https://github.com/gpf6666/FX/settings/pages

2. **重新配置**：
   - Source: `Deploy from a branch`
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - 点击 "Save"

3. **等待部署**：
   - 通常需要 1-5 分钟
   - 查看 "Your site is published at" 信息

### 方案二：强制重新部署

1. **删除 gh-pages 分支**：
   ```bash
   git push origin --delete gh-pages
   ```

2. **重新部署**：
   ```bash
   cd client
   npm run deploy
   ```

3. **重新配置 Pages**：
   - 在 GitHub 设置中重新选择 gh-pages 分支

### 方案三：检查仓库设置

1. **仓库可见性**：
   - 确保仓库是公开的
   - 或者升级到 GitHub Pro

2. **分支保护**：
   - 确保 gh-pages 分支没有被保护
   - 允许直接推送

## 📋 验证步骤

### 1. 检查部署状态

在 GitHub Pages 设置页面查看：
- ✅ "Your site is published at https://gpf6666.github.io/FX/"
- ✅ 绿色勾号表示部署成功
- ❌ 红色叉号表示部署失败

### 2. 检查文件访问

直接访问以下链接测试：
- https://gpf6666.github.io/FX/
- https://gpf6666.github.io/FX/assets/index-DXrV_0nq.js

### 3. 检查控制台错误

1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签页
3. 查看 Network 标签页的网络请求

## 🕐 时间问题

**GitHub Pages 部署时间：**
- 首次部署：5-10 分钟
- 更新部署：1-5 分钟
- 配置更改：2-3 分钟

**如果超过 10 分钟仍未生效：**
- 检查 GitHub 状态页面
- 联系 GitHub 支持

## 📞 获取帮助

如果以上步骤都无法解决问题：

1. **检查 GitHub 状态**：https://www.githubstatus.com/
2. **查看 GitHub Pages 文档**：https://docs.github.com/en/pages
3. **提交 Issue**：在仓库中创建 Issue 描述问题

## 🎯 成功标志

部署成功后，您应该看到：
- GitHub Pages 设置页面显示绿色勾号
- 网站可以正常访问
- 所有资源文件都能正确加载
- 路由功能正常工作 