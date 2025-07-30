<template>
  <div class="settings-page">
    <div class="settings-header">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <i class="iconfont icon-back"></i>
      </button>
      <h2>设置</h2>
    </div>

    <div class="settings-content">
      <!-- 账户设置 -->
      <div class="settings-section">
        <h3>账户设置</h3>
        <div class="settings-item" @click="goToProfile">
          <div class="item-left">
            <i class="iconfont icon-user"></i>
            <span>个人资料</span>
          </div>
          <i class="iconfont icon-arrow-right"></i>
        </div>
        <div class="settings-item" @click="showChangePassword = true">
          <div class="item-left">
            <i class="iconfont icon-lock"></i>
            <span>修改密码</span>
          </div>
          <i class="iconfont icon-arrow-right"></i>
        </div>
      </div>

      <!-- 聊天设置 -->
      <div class="settings-section">
        <h3>聊天设置</h3>
        <div class="settings-item">
          <div class="item-left">
            <i class="iconfont icon-notification"></i>
            <span>消息通知</span>
          </div>
          <el-switch v-model="settings.notifications" />
        </div>
        <div class="settings-item">
          <div class="item-left">
            <i class="iconfont icon-sound"></i>
            <span>声音提醒</span>
          </div>
          <el-switch v-model="settings.sound" />
        </div>
        <div class="settings-item">
          <div class="item-left">
            <i class="iconfont icon-vibration"></i>
            <span>震动提醒</span>
          </div>
          <el-switch v-model="settings.vibration" />
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="settings-section">
        <h3>隐私设置</h3>
        <div class="settings-item">
          <div class="item-left">
            <i class="iconfont icon-eye"></i>
            <span>在线状态可见</span>
          </div>
          <el-switch v-model="settings.onlineStatus" />
        </div>
        <div class="settings-item">
          <div class="item-left">
            <i class="iconfont icon-last-seen"></i>
            <span>最后在线时间</span>
          </div>
          <el-switch v-model="settings.lastSeen" />
        </div>
      </div>

      <!-- 关于 -->
      <div class="settings-section">
        <h3>关于</h3>
        <div class="settings-item">
          <div class="item-left">
            <i class="iconfont icon-info"></i>
            <span>版本信息</span>
          </div>
          <span class="version-text">v1.0.0</span>
        </div>
        <div class="settings-item" @click="showAbout = true">
          <div class="item-left">
            <i class="iconfont icon-help"></i>
            <span>帮助与反馈</span>
          </div>
          <i class="iconfont icon-arrow-right"></i>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="settings-section">
        <div class="settings-item logout-item" @click="logout">
          <div class="item-left">
            <i class="iconfont icon-logout"></i>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showChangePassword" title="修改密码" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input v-model="passwordForm.currentPassword" type="password" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePassword = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认</el-button>
      </template>
    </el-dialog>

    <!-- 关于弹窗 -->
    <el-dialog v-model="showAbout" title="关于" width="500px">
      <div class="about-content">
        <h3>微信风格聊天应用</h3>
        <p>这是一个基于Vue 3和Node.js开发的实时聊天应用，模仿微信的界面和功能。</p>
        <h4>主要功能：</h4>
        <ul>
          <li>实时私聊和群聊</li>
          <li>朋友圈动态</li>
          <li>头像上传</li>
          <li>消息状态显示</li>
          <li>在线状态</li>
        </ul>
        <h4>技术栈：</h4>
        <ul>
          <li>前端：Vue 3 + Element Plus + Socket.io</li>
          <li>后端：Node.js + Express + MongoDB</li>
          <li>实时通信：Socket.io</li>
        </ul>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const showChangePassword = ref(false)
const showAbout = ref(false)
const passwordFormRef = ref()

// 设置数据
const settings = reactive({
  notifications: true,
  sound: true,
  vibration: true,
  onlineStatus: true,
  lastSeen: true
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到个人资料
const goToProfile = () => {
  router.push('/profile')
}

// 修改密码
const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    
    const response = await axios.post('/api/auth/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (response.data.success) {
      ElMessage.success('密码修改成功')
      showChangePassword.value = false
      // 清空表单
      Object.assign(passwordForm, {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('密码修改失败')
    }
  }
}

// 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await authStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出登录失败')
    }
  }
}
</script>

<style scoped>
.settings-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #2f3237;
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  margin-right: 15px;
  cursor: pointer;
  padding: 5px;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.settings-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.settings-section {
  background-color: white;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
}

.settings-section h3 {
  margin: 0;
  padding: 15px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background-color: #f8f8f8;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-left i {
  font-size: 18px;
  color: #666;
  width: 20px;
  text-align: center;
}

.item-left span {
  font-size: 16px;
  color: #333;
}

.version-text {
  color: #999;
  font-size: 14px;
}

.logout-item {
  color: #ff4757;
}

.logout-item .item-left i,
.logout-item .item-left span {
  color: #ff4757;
}

.about-content {
  line-height: 1.6;
}

.about-content h3 {
  color: #1aad19;
  margin-bottom: 15px;
}

.about-content h4 {
  color: #333;
  margin: 20px 0 10px 0;
}

.about-content ul {
  margin: 0;
  padding-left: 20px;
}

.about-content li {
  margin-bottom: 5px;
  color: #666;
}

@media (max-width: 768px) {
  .settings-content {
    padding: 10px;
  }
  
  .settings-section {
    margin-bottom: 15px;
  }
  
  .settings-item {
    padding: 12px 15px;
  }
}
</style> 