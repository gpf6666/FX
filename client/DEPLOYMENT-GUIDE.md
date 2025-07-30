# 前端部署指南 (GitHub Pages - docs 目录方式)

## 部署方式
使用 GitHub Pages 的 docs 目录部署方式

## 部署步骤

### 1. 构建项目
```bash
npm run build
```

### 2. 重命名构建目录
```bash
mv dist docs
```

### 3. 添加 .nojekyll 文件
```bash
touch docs/.nojekyll
```

### 4. 提交到 Git
```bash
git add docs/
git commit -m "Add docs for GitHub Pages deployment"
git push origin main
```

### 5. 配置 GitHub Pages
1. 进入 GitHub 仓库设置
2. 找到 "Pages" 选项
3. 选择 "Source: Deploy from a branch"
4. 选择 "Branch: main"
5. 选择 "Folder: /docs"
6. 点击 "Save"

### 6. 等待部署
GitHub Pages 会自动部署，通常需要几分钟时间。

## 自动化部署

### 使用 npm 脚本
```bash
npm run deploy
```

这个脚本会自动执行：
1. `npm run build` - 构建项目
2. `mv dist docs` - 重命名目录
3. `gh-pages -d docs` - 部署到 GitHub Pages

## 注意事项

1. **docs 目录结构**
   ```
   docs/
   ├── index.html          # 主页面
   ├── assets/             # 静态资源
   ├── *.svg              # 图片资源
   └── .nojekyll          # 禁用 Jekyll
   ```

2. **.nojekyll 文件**
   - 这个文件告诉 GitHub Pages 不要使用 Jekyll 处理
   - 对于 Vue.js SPA 应用是必需的

3. **路由配置**
   - 确保 Vue Router 使用 `createWebHistory()` 模式
   - 可能需要配置 404 重定向

4. **API 配置**
   - 更新 `src/config/api.js` 中的生产环境 API URL
   - 确保后端已部署并配置 CORS

## 常见问题

### 1. 页面显示 404
- 检查 docs 目录是否包含 index.html
- 确认 GitHub Pages 配置正确

### 2. 资源加载失败
- 检查 assets 目录是否完整
- 确认文件路径正确

### 3. API 请求失败
- 检查 CORS 配置
- 确认后端 API URL 正确

## 更新部署

每次更新代码后：
```bash
npm run deploy
```

或者手动执行：
```bash
npm run build
mv dist docs
git add docs/
git commit -m "Update deployment"
git push
``` 