<template>
  <div class="add-friend-page">
    <div class="add-friend-header">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <i class="iconfont icon-back"></i>
      </button>
      <h2>添加好友</h2>
    </div>

    <div class="add-friend-content">
      <!-- 搜索用户 -->
      <div class="search-section">
        <div class="search-box">
          <i class="iconfont icon-search"></i>
          <input 
            v-model="searchKeyword" 
            type="text" 
            placeholder="搜索用户名或昵称" 
            @input="handleSearch"
            @keyup.enter="searchUsers"
            :disabled="searching"
          />
          <button class="search-btn" @click="searchUsers" :disabled="searching">
            <i v-if="searching" class="iconfont icon-loading"></i>
            <span v-else>搜索</span>
          </button>
        </div>
        <div v-if="searching" class="search-status">
          <i class="iconfont icon-loading"></i>
          <span>搜索中...</span>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <h3>搜索结果</h3>
        <div class="user-list">
          <div 
            v-for="user in searchResults" 
            :key="user._id"
            class="user-item"
          >
            <div class="user-avatar">
              <Avatar :src="user.avatar" size="medium" />
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.nickname || user.username }}</div>
              <div class="user-username">@{{ user.username }}</div>
            </div>
            <div class="user-actions">
              <button 
                v-if="!user.isFriend && !user.requestSent"
                class="add-btn"
                @click="sendFriendRequest(user._id)"
                :disabled="user.requesting"
              >
                {{ user.requesting ? '发送中...' : '添加' }}
              </button>
              <span v-else-if="user.isFriend" class="friend-status">已是好友</span>
              <span v-else-if="user.requestSent" class="request-status">请求已发送</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐好友 -->
      <div v-if="!searchKeyword && recommendedUsers.length > 0" class="recommended-section">
        <h3>推荐好友</h3>
        <div class="user-list">
          <div 
            v-for="user in recommendedUsers" 
            :key="user._id"
            class="user-item"
          >
            <div class="user-avatar">
              <Avatar :src="user.avatar" size="medium" />
            </div>
            <div class="user-info">
              <div class="user-name">{{ user.nickname || user.username }}</div>
              <div class="user-username">@{{ user.username }}</div>
            </div>
            <div class="user-actions">
              <button 
                v-if="!user.isFriend && !user.requestSent"
                class="add-btn"
                @click="sendFriendRequest(user._id)"
                :disabled="user.requesting"
              >
                {{ user.requesting ? '发送中...' : '添加' }}
              </button>
              <span v-else-if="user.isFriend" class="friend-status">已是好友</span>
              <span v-else-if="user.requestSent" class="request-status">请求已发送</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 好友请求 -->
      <div v-if="friendRequests.length > 0" class="requests-section">
        <h3>好友请求 ({{ friendRequests.length }})</h3>
        <div class="user-list">
          <div 
            v-for="request in friendRequests" 
            :key="request._id"
            class="user-item"
          >
            <div class="user-avatar">
              <Avatar :src="request.sender.avatar" size="medium" />
            </div>
            <div class="user-info">
              <div class="user-name">{{ request.sender.nickname || request.sender.username }}</div>
              <div class="user-username">@{{ request.sender.username }}</div>
              <div class="request-message">{{ request.message || '请求添加您为好友' }}</div>
            </div>
            <div class="user-actions">
              <button 
                class="accept-btn"
                @click="acceptFriendRequest(request._id)"
                :disabled="request.processing"
              >
                {{ request.processing ? '处理中...' : '接受' }}
              </button>
              <button 
                class="reject-btn"
                @click="rejectFriendRequest(request._id)"
                :disabled="request.processing"
              >
                {{ request.processing ? '处理中...' : '拒绝' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索结果为空 -->
      <div v-if="searchKeyword && !searching && searchResults.length === 0" class="empty-search">
        <div class="empty-icon">
          <i class="iconfont icon-search"></i>
        </div>
        <p>未找到匹配的用户</p>
        <p class="search-tip">尝试搜索用户名或昵称</p>
      </div>

      <!-- 空状态 -->
      <div v-if="!searchKeyword && searchResults.length === 0 && recommendedUsers.length === 0 && friendRequests.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="iconfont icon-user"></i>
        </div>
        <p>搜索用户添加好友</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import Avatar from '../components/Avatar.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const searchKeyword = ref('')
const searchResults = ref([])
const recommendedUsers = ref([])
const friendRequests = ref([])
const searchTimeout = ref(null)
const searching = ref(false)

// 返回上一页
const goBack = () => {
  router.back()
}

// 搜索用户
const searchUsers = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  searching.value = true
  
  try {
    const response = await axios.get(`/api/users/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
    
    if (response.data.success) {
      searchResults.value = response.data.users.map(user => ({
        ...user,
        requesting: false
      }))
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
    ElMessage.error('搜索失败')
  } finally {
    searching.value = false
  }
}

// 处理搜索输入
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
  } else {
    // 添加防抖，避免频繁请求
    clearTimeout(searchTimeout.value)
    searchTimeout.value = setTimeout(() => {
      searchUsers()
    }, 500)
  }
}

// 发送好友请求
const sendFriendRequest = async (userId) => {
  try {
    const user = searchResults.value.find(u => u._id === userId) || 
                 recommendedUsers.value.find(u => u._id === userId)
    
    if (user) {
      user.requesting = true
    }

    const response = await axios.post('/api/users/friends/request', {
      receiver: userId,
      message: '请求添加您为好友'
    })

    if (response.data.success) {
      ElMessage.success('好友请求已发送')
      
      // 更新用户状态
      if (user) {
        user.requestSent = true
        user.requesting = false
      }
    }
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('发送好友请求失败')
    }
    
    // 重置状态
    const user = searchResults.value.find(u => u._id === userId) || 
                 recommendedUsers.value.find(u => u._id === userId)
    if (user) {
      user.requesting = false
    }
  }
}

// 接受好友请求
const acceptFriendRequest = async (requestId) => {
  try {
    const request = friendRequests.value.find(r => r._id === requestId)
    if (request) {
      request.processing = true
    }

    const response = await axios.post(`/api/users/friends/accept/${requestId}`)

    if (response.data.success) {
      ElMessage.success('已接受好友请求')
      
      // 从请求列表中移除
      const index = friendRequests.value.findIndex(r => r._id === requestId)
      if (index !== -1) {
        friendRequests.value.splice(index, 1)
      }
    }
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('接受好友请求失败')
    }
    
    // 重置状态
    const request = friendRequests.value.find(r => r._id === requestId)
    if (request) {
      request.processing = false
    }
  }
}

// 拒绝好友请求
const rejectFriendRequest = async (requestId) => {
  try {
    const request = friendRequests.value.find(r => r._id === requestId)
    if (request) {
      request.processing = true
    }

    const response = await axios.post(`/api/users/friends/reject/${requestId}`)

    if (response.data.success) {
      ElMessage.success('已拒绝好友请求')
      
      // 从请求列表中移除
      const index = friendRequests.value.findIndex(r => r._id === requestId)
      if (index !== -1) {
        friendRequests.value.splice(index, 1)
      }
    }
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('接受好友请求失败')
    }
    
    // 重置状态
    const request = friendRequests.value.find(r => r._id === requestId)
    if (request) {
      request.processing = false
    }
  }
}



// 获取推荐好友
const getRecommendedUsers = async () => {
  try {
    const response = await axios.get('/api/users/recommended')
    
    if (response.data.success) {
      recommendedUsers.value = response.data.users.map(user => ({
        ...user,
        isFriend: user.isFriend || false,
        requestSent: user.requestSent || false,
        requesting: false
      }))
    }
  } catch (error) {
    console.error('获取推荐好友失败:', error)
  }
}

// 获取好友请求
const getFriendRequests = async () => {
  try {
    const response = await axios.get('/api/users/friends/requests')
    
    if (response.data.success) {
      friendRequests.value = response.data.requests.map(request => ({
        ...request,
        processing: false
      }))
    }
  } catch (error) {
    console.error('获取好友请求失败:', error)
  }
}

onMounted(() => {
  getRecommendedUsers()
  getFriendRequests()
})
</script>

<style scoped>
.add-friend-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.add-friend-header {
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

.add-friend-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.add-friend-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 25px;
  padding: 10px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box i {
  color: #999;
  margin-right: 10px;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: none;
}

.search-btn {
  background-color: #1aad19;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
}

.search-btn:hover {
  background-color: #129611;
}

.search-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.search-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  color: #666;
  font-size: 14px;
}

.search-status i {
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-results,
.recommended-section,
.requests-section {
  background-color: white;
  border-radius: 10px;
  margin-bottom: 20px;
  overflow: hidden;
}

.search-results h3,
.recommended-section h3,
.requests-section h3 {
  margin: 0;
  padding: 15px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}

.user-list {
  padding: 0;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.user-item:last-child {
  border-bottom: none;
}

.user-avatar {
  margin-right: 15px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.user-username {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.request-message {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.add-btn {
  background-color: #1aad19;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover:not(:disabled) {
  background-color: #129611;
}

.add-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.accept-btn {
  background-color: #1aad19;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
}

.accept-btn:hover:not(:disabled) {
  background-color: #129611;
}

.reject-btn {
  background-color: #ff4757;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 12px;
}

.reject-btn:hover:not(:disabled) {
  background-color: #e63946;
}

.accept-btn:disabled,
.reject-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.friend-status,
.request-status {
  font-size: 12px;
  color: #999;
  padding: 6px 12px;
  border-radius: 12px;
  background-color: #f0f0f0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  color: #ccc;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.empty-search {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-search .empty-icon {
  font-size: 40px;
  margin-bottom: 15px;
  color: #ccc;
}

.empty-search p {
  font-size: 14px;
  margin: 5px 0;
}

.search-tip {
  font-size: 12px !important;
  color: #bbb !important;
}

@media (max-width: 768px) {
  .add-friend-content {
    padding: 10px;
  }
  
  .user-item {
    padding: 12px 15px;
  }
  
  .user-actions {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 