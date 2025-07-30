<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useSocketStore } from './stores/socket'

const authStore = useAuthStore()
const socketStore = useSocketStore()

onMounted(() => {
  // 检查本地存储的token
  const token = localStorage.getItem('token')
  if (token) {
    authStore.setToken(token)
    authStore.getUserInfo()
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  background-color: #f7f7f7;
  color: #333;
}

/* 微信风格的颜色系统 */
:root {
  --wechat-green: #07c160;
  --wechat-blue: #576b95;
  --wechat-gray: #f7f7f7;
  --wechat-light-gray: #f0f0f0;
  --wechat-border: #e5e5e5;
  --wechat-text: #333;
  --wechat-text-secondary: #666;
  --wechat-text-light: #999;
  --wechat-bg: #f7f7f7;
  --wechat-white: #fff;
  --wechat-red: #fa5151;
  --wechat-orange: #ff9500;
}

body {
  background-color: var(--wechat-bg);
  font-size: 16px;
  line-height: 1.4;
}

.wechat-btn {
  background-color: var(--wechat-green);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.wechat-btn:hover {
  background-color: #06ad56;
}

.wechat-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 微信风格的输入框 */
.wechat-input {
  border: 1px solid var(--wechat-border);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 16px;
  background-color: white;
}

.wechat-input:focus {
  outline: none;
  border-color: var(--wechat-green);
}

/* 微信风格的卡片 */
.wechat-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

/* 微信风格的分割线 */
.wechat-divider {
  height: 1px;
  background-color: var(--wechat-border);
  margin: 8px 0;
}

/* 微信风格的头像 */
.wechat-avatar {
  border-radius: 4px;
  object-fit: cover;
}

/* 微信风格的列表项 */
.wechat-list-item {
  background-color: white;
  padding: 12px 16px;
  border-bottom: 1px solid var(--wechat-border);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.wechat-list-item:hover {
  background-color: var(--wechat-light-gray);
}

.wechat-list-item:last-child {
  border-bottom: none;
}

/* 微信风格的头部 */
.wechat-header {
  background-color: white;
  border-bottom: 1px solid var(--wechat-border);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.wechat-header-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--wechat-text);
}

/* 微信风格的底部导航 */
.wechat-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid var(--wechat-border);
  display: flex;
  z-index: 1000;
}

.wechat-tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  transition: color 0.2s;
  color: var(--wechat-text-light);
}

.wechat-tab-item.active {
  color: var(--wechat-green);
}

.wechat-tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.wechat-tab-text {
  font-size: 12px;
}

/* 微信风格的消息气泡 */
.wechat-message {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 18px;
  word-wrap: break-word;
  margin-bottom: 8px;
}

.wechat-message.own {
  background-color: var(--wechat-green);
  color: white;
  margin-left: auto;
}

.wechat-message.other {
  background-color: white;
  color: var(--wechat-text);
  margin-right: auto;
}

/* 微信风格的页面容器 */
.wechat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--wechat-bg);
}

.wechat-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px; /* 为底部导航留出空间 */
}

/* 微信风格的加载状态 */
.wechat-loading {
  text-align: center;
  padding: 20px;
  color: var(--wechat-text-light);
}

/* 微信风格的空状态 */
.wechat-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--wechat-text-light);
}

.wechat-empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .wechat-message {
    max-width: 85%;
  }
}

/* Element Plus 组件样式覆盖 */
.el-button--primary {
  background-color: var(--wechat-green);
  border-color: var(--wechat-green);
}

.el-button--primary:hover {
  background-color: #06ad56;
  border-color: #06ad56;
}

.el-input__inner {
  border-color: var(--wechat-border);
}

.el-input__inner:focus {
  border-color: var(--wechat-green);
}

.el-card {
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.el-dialog {
  border-radius: 8px;
}

.el-dialog__header {
  border-bottom: 1px solid var(--wechat-border);
}

.el-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 朋友圈头部按钮样式覆盖 */
.moments-header-custom .el-button {
  color: white !important;
  border: none !important;
  background: transparent !important;
}

.moments-header-custom .el-button .el-icon {
  color: white !important;
  font-size: 18px !important;
}

.moments-header-custom .el-button:hover {
  color: #f0f0f0 !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.moments-header-custom .el-button:hover .el-icon {
  color: #f0f0f0 !important;
}

.moments-header-custom .wechat-header-title {
  color: white !important;
}
</style> 