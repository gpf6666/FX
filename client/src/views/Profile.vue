<template>
  <div class="wechat-page">
    <!-- 头部 -->
    <div class="wechat-header">
      <el-button @click="$router.push('/chat')" type="text" size="small">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="wechat-header-title">我</div>
      <div></div>
    </div>

    <!-- 主内容区域 -->
    <div class="wechat-content">
      <!-- 个人资料卡片 -->
      <div class="profile-section">
        <div class="profile-card">
          <div class="profile-header">
            <el-avatar :src="profileForm.avatar" size="large" class="profile-avatar" />
            <div class="profile-info">
              <div class="profile-name">{{ profileForm.nickname || profileForm.username }}</div>
              <div class="profile-username">微信号：{{ profileForm.username }}</div>
            </div>
            <el-button type="text" size="small">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 功能列表 -->
      <div class="function-list">
        <!-- 个人资料编辑 -->
        <div class="function-section">
          <div class="wechat-list-item" @click="showEditProfile = true">
            <el-icon><User /></el-icon>
            <span class="function-text">个人资料</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 好友管理 -->
        <div class="function-section">
          <div class="section-header">
            <span>好友管理</span>
            <span class="section-count">({{ friends.length }})</span>
          </div>
          <div class="friends-list">
            <div 
              v-for="friend in friends" 
              :key="friend._id"
              class="wechat-list-item"
            >
              <el-avatar :src="friend.avatar" size="small" class="wechat-avatar" />
              <div class="friend-info">
                <div class="friend-name">{{ friend.nickname || friend.username }}</div>
                <div class="friend-status">
                  <span class="user-status" :class="friend.status"></span>
                  {{ friend.status === 'online' ? '在线' : '离线' }}
                </div>
              </div>
              <el-button 
                type="text" 
                size="small"
                @click="removeFriend(friend._id)"
                class="delete-btn"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 群组管理 -->
        <div class="function-section">
          <div class="section-header">
            <span>群组管理</span>
            <span class="section-count">({{ groups.length }})</span>
          </div>
          <div class="groups-list">
            <div 
              v-for="group in groups" 
              :key="group._id"
              class="wechat-list-item"
            >
              <el-avatar :src="group.avatar" size="small" class="wechat-avatar" />
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-members">{{ group.members.length }}人</div>
              </div>
              <div class="group-role">
                <el-tag 
                  :type="group.members.find(m => m.user._id === authStore.user?.id)?.role === 'admin' ? 'danger' : 'info'"
                  size="small"
                >
                  {{ group.members.find(m => m.user._id === authStore.user?.id)?.role === 'admin' ? '管理员' : '成员' }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 退出登录 -->
        <div class="function-section">
          <div class="wechat-list-item logout-item" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span class="function-text">退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑个人资料对话框 -->
    <el-dialog v-model="showEditProfile" title="编辑个人资料" width="500px">
      <el-form 
        ref="profileFormRef" 
        :model="profileForm" 
        :rules="rules" 
        label-width="80px"
      >
        <el-form-item label="头像">
          <AvatarUpload 
            :current-avatar="profileForm.avatar" 
            size="xlarge"
            @upload-success="handleAvatarUpload"
            @upload-error="handleAvatarError"
          />
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" disabled />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditProfile = false">取消</el-button>
        <el-button type="primary" @click="updateProfile" :loading="updating">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import AvatarUpload from '../components/AvatarUpload.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const profileFormRef = ref()

// 响应式数据
const friends = ref([])
const groups = ref([])
const updating = ref(false)
const showEditProfile = ref(false)

const profileForm = reactive({
  username: authStore.user?.username || '',
  email: authStore.user?.email || '',
  nickname: authStore.user?.nickname || '',
  avatar: authStore.user?.avatar || ''
})

const rules = {
  nickname: [
    { max: 20, message: '昵称长度不能超过20个字符', trigger: 'blur' }
  ]
}

// 更新个人资料
const updateProfile = async () => {
  try {
    await profileFormRef.value.validate()
    
    updating.value = true
    const response = await axios.put('/api/users/profile', {
      nickname: profileForm.nickname,
      avatar: profileForm.avatar
    })
    
    if (response.data.success) {
      ElMessage.success('更新成功')
      // 更新本地用户信息
      authStore.user = response.data.user
      showEditProfile.value = false
    }
  } catch (error) {
    console.error('更新个人资料失败:', error)
    ElMessage.error('更新失败')
  } finally {
    updating.value = false
  }
}

// 获取好友列表
const getFriends = async () => {
  try {
    const response = await axios.get('/api/users/friends/list')
    if (response.data.success) {
      friends.value = response.data.friends
    }
  } catch (error) {
    console.error('获取好友列表失败:', error)
  }
}

// 获取群组列表
const getGroups = async () => {
  try {
    const response = await axios.get('/api/chats/groups')
    if (response.data.success) {
      groups.value = response.data.groups
    }
  } catch (error) {
    console.error('获取群组列表失败:', error)
  }
}

// 删除好友
const removeFriend = async (friendId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个好友吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response = await axios.delete(`/api/users/friends/${friendId}`)
    if (response.data.success) {
      ElMessage.success('删除成功')
      await getFriends()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除好友失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理头像上传成功
const handleAvatarUpload = (data) => {
  profileForm.avatar = data.url
  ElMessage.success('头像上传成功')
}

// 处理头像上传错误
const handleAvatarError = (error) => {
  ElMessage.error(error || '头像上传失败')
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    authStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消
  }
}

onMounted(async () => {
  await getFriends()
  await getGroups()
})
</script>

<style scoped>
.profile-section {
  padding: 16px;
}

.profile-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  border: 2px solid var(--wechat-border);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 500;
  color: var(--wechat-text);
  margin-bottom: 4px;
}

.profile-username {
  font-size: 14px;
  color: var(--wechat-text-light);
}

.function-list {
  padding: 0 16px;
}

.function-section {
  margin-bottom: 16px;
}

.section-header {
  padding: 12px 0;
  font-size: 14px;
  color: var(--wechat-text-secondary);
  font-weight: 500;
  border-bottom: 1px solid var(--wechat-border);
  margin-bottom: 8px;
}

.section-count {
  color: var(--wechat-text-light);
  font-weight: normal;
}

.function-text {
  flex: 1;
  margin-left: 12px;
  color: var(--wechat-text);
}

.friends-list,
.groups-list {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.friend-info,
.group-info {
  flex: 1;
  margin-left: 12px;
}

.friend-name,
.group-name {
  font-size: 16px;
  color: var(--wechat-text);
  margin-bottom: 2px;
}

.friend-status,
.group-members {
  font-size: 12px;
  color: var(--wechat-text-light);
}

.user-status {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.user-status.online {
  background-color: var(--wechat-green);
}

.user-status.offline {
  background-color: var(--wechat-text-light);
}

.group-role {
  margin-left: 8px;
}

.delete-btn {
  color: var(--wechat-red);
}

.delete-btn:hover {
  color: #d32f2f;
}

.logout-item {
  color: var(--wechat-red);
}

.logout-item .function-text {
  color: var(--wechat-red);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-section,
  .function-list {
    padding: 0 12px;
  }
  
  .profile-header {
    gap: 12px;
  }
  
  .profile-name {
    font-size: 16px;
  }
}
</style> 