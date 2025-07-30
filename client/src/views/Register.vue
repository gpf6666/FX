<template>
  <div class="wechat-page register-page">
    <div class="register-container">
      <!-- 头部Logo区域 -->
      <div class="register-header">
        <div class="wechat-logo">
          <el-icon size="80" color="var(--wechat-green)"><ChatDotRound /></el-icon>
        </div>
        <h1 class="app-title">微信</h1>
        <p class="app-subtitle">创建你的微信账号</p>
      </div>

      <!-- 注册表单 -->
      <div class="register-form">
        <el-form 
          ref="registerFormRef" 
          :model="registerForm" 
          :rules="rules" 
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="registerForm.username" 
              placeholder="用户名"
              size="large"
              prefix-icon="User"
              class="wechat-input"
            />
          </el-form-item>
          
          <el-form-item prop="email">
            <el-input 
              v-model="registerForm.email" 
              placeholder="邮箱"
              size="large"
              prefix-icon="Message"
              class="wechat-input"
            />
          </el-form-item>
          
          <el-form-item prop="nickname">
            <el-input 
              v-model="registerForm.nickname" 
              placeholder="昵称（可选）"
              size="large"
              prefix-icon="UserFilled"
              class="wechat-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              class="wechat-input"
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="确认密码"
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
              @click="handleRegister"
              class="register-btn"
              size="large"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 登录链接 -->
        <div class="login-link">
          <el-button 
            type="text" 
            @click="$router.push('/login')"
            class="login-btn-text"
          >
            已有账号？立即登录
          </el-button>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="register-footer">
        <p class="footer-text">注册即表示同意</p>
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
const registerFormRef = ref()

const registerForm = reactive({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  nickname: [
    { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    
    const { confirmPassword, ...userData } = registerForm
    
    const result = await authStore.register(userData)
    
    if (result.success) {
      ElMessage.success('注册成功')
      router.push('/chat')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败，请重试')
  }
}
</script>

<style scoped>
.register-page {
  background: linear-gradient(135deg, var(--wechat-green) 0%, #06ad56 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.register-header {
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

.register-form {
  padding: 32px 24px;
}

.register-form .el-form-item {
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

.register-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background-color: var(--wechat-green);
  border-color: var(--wechat-green);
}

.register-btn:hover {
  background-color: #06ad56;
  border-color: #06ad56;
}

.login-link {
  text-align: center;
  margin-top: 16px;
}

.login-btn-text {
  color: var(--wechat-green);
  font-size: 14px;
}

.login-btn-text:hover {
  color: #06ad56;
}

.register-footer {
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
  .register-page {
    padding: 16px;
  }
  
  .register-container {
    border-radius: 12px;
  }
  
  .register-header {
    padding: 32px 16px 16px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .register-form {
    padding: 24px 16px;
  }
  
  .register-footer {
    padding: 16px 16px 24px;
  }
}
</style> 