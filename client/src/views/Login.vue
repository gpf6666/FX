<template>
  <div class="wechat-page login-page">
    <div class="login-container">
      <!-- 头部Logo区域 -->
      <div class="login-header">
        <div class="wechat-logo">
          <el-icon size="80" color="var(--wechat-green)"><ChatDotRound /></el-icon>
        </div>
        <h1 class="app-title">FChat</h1>
        <p class="app-subtitle">连接你我，分享生活</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form">
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="rules" 
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="用户名或邮箱"
              size="large"
              prefix-icon="User"
              class="wechat-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              class="wechat-input"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="authStore.loading"
              @click="handleLogin"
              class="login-btn"
              size="large"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册链接 -->
        <div class="register-link">
          <el-button 
            type="text" 
            @click="$router.push('/register')"
            class="register-btn"
          >
            还没有账号？立即注册
          </el-button>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="login-footer">
        <p class="footer-text">登录即表示同意</p>
        <p class="footer-links">
          <a href="#" class="footer-link">用户协议</a>
          <span class="footer-separator">和</span>
          <a href="#" class="footer-link">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    
    const result = await authStore.login(loginForm)
    
    if (result.success) {
      ElMessage.success('登录成功')
      router.push('/chat')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请重试')
  }
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, var(--wechat-green) 0%, #06ad56 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 40px 20px 20px;
  background: linear-gradient(135deg, var(--wechat-green) 0%, #06ad56 100%);
  color: white;
}

.wechat-logo {
  margin-bottom: 16px;
}

.app-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
}

.app-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
  color: white;
}

.login-form {
  padding: 32px 24px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.wechat-input {
  border-radius: 8px;
}

.wechat-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--wechat-border);
}

.wechat-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--wechat-green);
}

.wechat-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--wechat-green);
}

.login-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background-color: var(--wechat-green);
  border-color: var(--wechat-green);
}

.login-btn:hover {
  background-color: #06ad56;
  border-color: #06ad56;
}

.register-link {
  text-align: center;
  margin-top: 16px;
}

.register-btn {
  color: var(--wechat-green);
  font-size: 14px;
}

.register-btn:hover {
  color: #06ad56;
}

.login-footer {
  padding: 20px 24px 32px;
  text-align: center;
  border-top: 1px solid var(--wechat-border);
}

.footer-text {
  font-size: 12px;
  color: var(--wechat-text-light);
  margin: 0 0 4px 0;
}

.footer-links {
  font-size: 12px;
  margin: 0;
}

.footer-link {
  color: var(--wechat-green);
  text-decoration: none;
}

.footer-link:hover {
  color: #06ad56;
}

.footer-separator {
  color: var(--wechat-text-light);
  margin: 0 4px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }
  
  .login-container {
    border-radius: 12px;
  }
  
  .login-header {
    padding: 32px 16px 16px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .login-form {
    padding: 24px 16px;
  }
  
  .login-footer {
    padding: 16px 16px 24px;
  }
}
</style> 