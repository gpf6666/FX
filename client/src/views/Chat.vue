<template>
  <div class="wechat-container">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-btn" @click="toggleSidebar">
      <i class="iconfont icon-menu"></i>
    </div>

    <!-- 移动端遮罩层 -->
    <div class="mobile-overlay" :class="{ show: showSidebar }" @click="toggleSidebar"></div>

    <!-- 左侧边栏 -->
    <div class="sidebar" :class="{ show: showSidebar }">
      <!-- 移动端关闭按钮 -->
      <div class="mobile-close-btn" @click="toggleSidebar">
        <i class="iconfont icon-close"></i>
      </div>

      <!-- 用户信息头部 -->
      <div class="sidebar-header">
        <div class="user-avatar">
          <Avatar :src="authStore.user?.avatar" size="medium" />
        </div>
        <div class="user-actions">
          <button class="action-btn" @click="goToProfile" aria-label="个人资料">
            <i class="iconfont icon-user"></i>
          </button>
          <button class="action-btn" @click="goToSettings" aria-label="设置">
            <i class="iconfont icon-settings"></i>
          </button>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <div class="search-input">
          <i class="iconfont icon-search"></i>
          <input 
            v-model="searchText" 
            type="text" 
            placeholder="搜索" 
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- 功能按钮 -->
      <div class="function-buttons">
        <button class="function-btn" @click="goToAddFriend" aria-label="添加好友">
          <i class="iconfont icon-add"></i>
          <span>添加好友</span>
        </button>
        <button class="function-btn" @click="goToGroupChat" aria-label="群聊">
          <i class="iconfont icon-group"></i>
          <span>群聊</span>
        </button>
        <button class="function-btn" @click="goToMoments" aria-label="朋友圈">
          <i class="iconfont icon-moments"></i>
          <span>朋友圈</span>
        </button>
      </div>

      <!-- 聊天列表 -->
      <div class="chat-list">
        <div 
          v-for="chat in filteredChats" 
          :key="`${chat.type}-${chat.id}`"
          class="chat-item"
          :class="{ active: currentChat?.type === chat.type && currentChat?.id === chat.id }"
          @click="selectChat(chat)"
        >
          <div class="chat-avatar">
            <Avatar :src="chat.avatar" size="medium" />
            <div v-if="chat.unreadCount > 0" class="unread-badge">
              {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
            </div>
          </div>
          <div class="chat-info">
            <div class="chat-name">{{ chat.name }}</div>
            <div class="chat-last-message">{{ chat.lastMessage || '' }}</div>
          </div>
          <div class="chat-time">{{ formatChatTime(chat.lastTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="main-chat">
      <div v-if="currentChat" class="chat-area">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-title">
            <span>{{ currentChat.name }}</span>
            <span v-if="currentChat.type === 'private'" class="online-status">
              <span class="status-dot" :class="getFriendStatus(currentChat.id)"></span>
              {{ getFriendStatus(currentChat.id) === 'online' ? '在线' : '离线' }}
            </span>
          </div>
          <div class="chat-actions">
            <button class="action-btn" @click="showChatInfo = true" aria-label="聊天信息">
              <i class="iconfont icon-info"></i>
            </button>
          </div>
        </div>

        <!-- 消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <div class="messages-wrapper">
            <!-- 加载更多按钮 -->
            <div v-if="hasMoreMessages" class="load-more">
              <button @click="loadMoreMessages" :disabled="loading">
                {{ loading ? '加载中...' : '加载更多消息' }}
              </button>
            </div>

            <!-- 消息列表 -->
            <div 
              v-for="(message, index) in messages" 
              :key="message._id"
              class="message-wrapper"
              :class="{ 'message-group': shouldGroupMessage(message, messages[index - 1]) }"
            >
              <!-- 时间分割线 -->
              <div v-if="shouldShowTimeDivider(message, messages[index - 1])" class="time-divider">
                {{ formatMessageTime(message.createdAt) }}
              </div>

              <div 
                class="message-item"
                :class="{ 
                  'own': isOwnMessage(message),
                  'grouped': shouldGroupMessage(message, messages[index - 1])
                }"
              >
                <div v-if="!shouldGroupMessage(message, messages[index - 1])" class="message-avatar">
                  <Avatar :src="message.sender.avatar" size="small" />
                </div>
                <div v-else class="message-avatar-placeholder"></div>
                
                <div class="message-content">
                  <div class="message-bubble">
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-status">
                      <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                      <span v-if="isOwnMessage(message)" class="message-status-icon">
                        <i v-if="message.status === 'sending'" class="iconfont icon-loading"></i>
                        <i v-else-if="message.status === 'sent'" class="iconfont icon-check"></i>
                        <i v-else-if="message.status === 'read'" class="iconfont icon-check-double"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-toolbar">
            <button class="tool-btn" @click="showEmojiPicker = !showEmojiPicker" aria-label="表情">
              <i class="iconfont icon-emoji"></i>
            </button>
            <button class="tool-btn" @click="showImagePicker = true" aria-label="图片">
              <i class="iconfont icon-image"></i>
            </button>
            <button class="tool-btn" @click="showVoiceRecorder = true" aria-label="语音">
              <i class="iconfont icon-voice"></i>
            </button>
          </div>
          
          <div class="input-container">
            <textarea
              v-model="messageText"
              ref="messageInput"
              class="message-input"
              placeholder="输入消息..."
              @keydown.enter.prevent="sendMessage"
              @input="handleInput"
              rows="1"
            ></textarea>
            <button 
              class="send-btn"
              :class="{ active: messageText.trim() }"
              @click="sendMessage"
              :disabled="!messageText.trim()"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      <!-- 默认欢迎页面 -->
      <div v-else class="welcome-page">
        <div class="welcome-content">
          <div class="welcome-icon">
            <i style="font-size: 50px;" class="iconfont icon-chat"></i>
          </div>
          <h2>飞信</h2>
          <p>选择一个聊天开始对话</p>
        </div>  
      </div>
    </div>

    <!-- 表情选择器 -->
    <div v-if="showEmojiPicker" class="emoji-picker">
      <div class="emoji-list">
        <span 
          v-for="emoji in emojis" 
          :key="emoji"
          class="emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </span>
      </div>
    </div>

    <!-- 图片选择器 -->
    <input 
      v-if="showImagePicker"
      ref="imageInput"
      type="file"
      accept="image/*"
      @change="handleImageUpload"
      style="display: none"
    />

    <!-- 语音录制器 -->
    <div v-if="showVoiceRecorder" class="voice-recorder">
      <div class="voice-modal">
        <div class="voice-content">
          <div class="voice-icon">
            <i class="iconfont icon-microphone"></i>
          </div>
          <p>按住说话</p>
          <button 
            class="voice-btn"
            @mousedown="startRecording"
            @mouseup="stopRecording"
            @mouseleave="stopRecording"
          >
            录音
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { useSocketStore } from '../stores/socket'
import Avatar from '../components/Avatar.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const socketStore = useSocketStore()

// 响应式数据
const currentChat = ref(null)
const messages = ref([])
const messageText = ref('')
const searchText = ref('')
const showEmojiPicker = ref(false)
const showImagePicker = ref(false)
const showVoiceRecorder = ref(false)
const showProfile = ref(false)
const showSettings = ref(false)
const showChatInfo = ref(false)
const messagesContainer = ref()
const messageInput = ref()
const imageInput = ref()
const loading = ref(false)
const hasMoreMessages = ref(true)
const page = ref(1)
const pageSize = 20
const showSidebar = ref(false) // 新增：控制侧边栏显示，移动端默认隐藏

// 聊天列表数据
const chats = ref([])
const friends = ref([])
const groups = ref([])

// 表情列表
const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠']

// 计算属性
const filteredChats = computed(() => {
  if (!searchText.value) return chats.value
  return chats.value.filter(chat => 
    chat.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 计算总未读消息数量
const totalUnreadCount = computed(() => {
  return chats.value.reduce((total, chat) => total + (chat.unreadCount || 0), 0)
})

// 监听未读消息数量变化，更新页面标题
watch(totalUnreadCount, (newCount) => {
  if (newCount > 0) {
    document.title = `(${newCount}) FEI信`
  } else {
    document.title = 'FEI信'
  }
})

// 获取聊天列表
const getChats = async () => {
  try {
    // 获取好友列表
    const friendsResponse = await axios.get('/api/users/friends/list')
    if (friendsResponse.data.success) {
      friends.value = friendsResponse.data.friends
    }

    // 获取群组列表
    const groupsResponse = await axios.get('/api/chats/groups')
    if (groupsResponse.data.success) {
      groups.value = groupsResponse.data.groups
    }

    // 获取未读消息数量
    const unreadResponse = await axios.get('/api/chats/unread-count')
    let unreadCounts = {}
    if (unreadResponse.data.success) {
      unreadCounts = unreadResponse.data.unreadCount
    }

    // 构建聊天列表
    const chatList = []
    
    // 添加好友聊天
    friends.value.forEach(friend => {
      chatList.push({
        type: 'private',
        id: friend._id,
        name: friend.nickname || friend.username,
        avatar: friend.avatar,
        lastMessage: friend.lastMessage || '',
        lastTime: friend.lastMessageTime,
        unreadCount: unreadCounts[friend._id] || 0
      })
    })

    // 添加群组聊天
    groups.value.forEach(group => {
      chatList.push({
        type: 'group',
        id: group._id,
        name: group.name,
        avatar: group.avatar,
        lastMessage: group.lastMessage || '',
        lastTime: group.lastMessageTime,
        unreadCount: unreadCounts[group._id] || 0
      })
    })

    // 按最后消息时间排序
    chatList.sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0))
    chats.value = chatList
  } catch (error) {
    console.error('获取聊天列表失败:', error)
  }
}

// 选择聊天
const selectChat = async (chat) => {
  currentChat.value = chat
  messages.value = []
  page.value = 1
  hasMoreMessages.value = true
  
  console.log('选择聊天:', chat)
  console.log('当前用户:', authStore.user)
  
  // 清除未读计数
  clearUnreadCount(chat.type, chat.id)
  
  try {
    let response
    if (chat.type === 'private') {
      response = await axios.get(`/api/chats/private/${chat.id}?page=${page.value}&limit=${pageSize}`)
    } else {
      response = await axios.get(`/api/chats/groups/${chat.id}?page=${page.value}&limit=${pageSize}`)
    }
    
    if (response.data.success) {
      console.log('获取到的消息:', response.data.messages)
      console.log('消息数量:', response.data.messages.length)
      
      const sortedMessages = response.data.messages.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt)
      })
      
      // 调试每条消息的发送者判断
      sortedMessages.forEach((message, index) => {
        console.log(`消息 ${index + 1}:`, {
          content: message.content.substring(0, 20) + '...',
          senderId: message.sender._id,
          currentUserId: authStore.user?.id || authStore.user?._id,
          isOwn: isOwnMessage(message)
        })
      })
      
      messages.value = sortedMessages
      hasMoreMessages.value = response.data.messages.length === pageSize
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('获取消息失败:', error)
    ElMessage.error('获取消息失败')
  }
}

// 清除未读消息计数
const clearUnreadCount = (chatType, chatId) => {
  const chatIndex = chats.value.findIndex(chat => 
    chat.type === chatType && String(chat.id) === String(chatId)
  )
  
  if (chatIndex !== -1) {
    chats.value[chatIndex].unreadCount = 0
  }
}

// 更新聊天列表的最后消息信息
const updateChatLastMessage = (chatType, chatId, messageContent) => {
  const chatIndex = chats.value.findIndex(chat => 
    chat.type === chatType && String(chat.id) === String(chatId)
  )
  
  if (chatIndex !== -1) {
    chats.value[chatIndex].lastMessage = messageContent
    chats.value[chatIndex].lastTime = new Date()
    
    // 将更新的聊天移到顶部
    const updatedChat = chats.value.splice(chatIndex, 1)[0]
    chats.value.unshift(updatedChat)
  }
}

// 加载更多消息
const loadMoreMessages = async () => {
  if (loading.value || !hasMoreMessages.value) return
  
  loading.value = true
  page.value++
  
  try {
    let response
    if (currentChat.value.type === 'private') {
      response = await axios.get(`/api/chats/private/${currentChat.value.id}?page=${page.value}&limit=${pageSize}`)
    } else {
      response = await axios.get(`/api/chats/groups/${currentChat.value.id}?page=${page.value}&limit=${pageSize}`)
    }
    
    if (response.data.success) {
      const newMessages = response.data.messages.reverse()
      messages.value.unshift(...newMessages)
      hasMoreMessages.value = newMessages.length === pageSize
    }
  } catch (error) {
    console.error('加载更多消息失败:', error)
    page.value--
  } finally {
    loading.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim() || !currentChat.value) return

  const messageData = {
    content: messageText.value,
    timestamp: new Date(),
    status: 'sending'
  }

  // 先添加到本地消息列表
  const tempMessage = {
    _id: Date.now().toString(),
    content: messageText.value,
    sender: {
      _id: authStore.user?.id || authStore.user?._id,
      username: authStore.user?.username,
      nickname: authStore.user?.nickname,
      avatar: authStore.user?.avatar
    },
    createdAt: new Date(),
    status: 'sending'
  }
  
  messages.value.push(tempMessage)
  messageText.value = ''
  
  await nextTick()
  scrollToBottom()

  try {
    let response
    if (currentChat.value.type === 'private') {
      response = await axios.post('/api/chats/private', {
        receiver: currentChat.value.id,
        content: messageData.content
      })
    } else {
      response = await axios.post(`/api/chats/groups/${currentChat.value.id}`, {
        content: messageData.content
      })
    }

    if (response.data.success) {
      // 更新消息状态和ID
      const index = messages.value.findIndex(m => m._id === tempMessage._id)
      if (index !== -1) {
        // 使用服务器返回的消息ID，避免重复
        messages.value[index] = { 
          ...response.data.message, 
          status: 'sent',
          _id: response.data.message._id // 确保使用服务器返回的ID
        }
      }
      
      // 更新聊天列表的最后消息信息
      updateChatLastMessage(currentChat.value.type, currentChat.value.id, tempMessage.content)
      
      // 不再通过Socket发送消息，因为服务器已经处理了
      // Socket只用于接收其他用户的消息
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
    // 更新消息状态为失败
    const index = messages.value.findIndex(m => m._id === tempMessage._id)
    if (index !== -1) {
      messages.value[index].status = 'failed'
    }
  }
}

// 跳转到个人资料页面
const goToProfile = () => {
  router.push('/profile')
}

// 跳转到设置页面
const goToSettings = () => {
  router.push('/settings')
}

// 跳转到添加好友页面
const goToAddFriend = () => {
  router.push('/add-friend')
}

// 跳转到群聊页面
const goToGroupChat = () => {
  router.push('/group-chat')
}

// 跳转到朋友圈页面
const goToMoments = () => {
  router.push('/moments')
}

// 切换侧边栏显示
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 处理输入
const handleInput = () => {
  // 自动调整输入框高度
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

// 插入表情
const insertEmoji = (emoji) => {
  messageText.value += emoji
  showEmojiPicker.value = false
  messageInput.value?.focus()
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 这里可以添加图片上传逻辑
    console.log('图片上传:', file)
  }
  showImagePicker.value = false
}

// 开始录音
const startRecording = () => {
  console.log('开始录音')
  // 这里可以添加录音逻辑
}

// 停止录音
const stopRecording = () => {
  console.log('停止录音')
  showVoiceRecorder.value = false
  // 这里可以添加录音停止逻辑
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

// 获取好友状态
const getFriendStatus = (friendId) => {
  const friend = friends.value.find(f => f._id === friendId)
  return friend?.status || 'offline'
}

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) { // 1天内
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 格式化消息时间
const formatMessageTime = (time) => {
  const date = new Date(time)
  const now = new Date()
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (date.toDateString() === new Date(now - 86400000).toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
}

// 格式化聊天时间
const formatChatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }
}

// 判断是否应该显示时间分割线
const shouldShowTimeDivider = (currentMessage, previousMessage) => {
  if (!previousMessage) return true
  
  const currentTime = new Date(currentMessage.createdAt)
  const previousTime = new Date(previousMessage.createdAt)
  const diff = currentTime - previousTime
  
  return diff > 300000 // 5分钟
}

// 判断是否应该分组消息
const shouldGroupMessage = (currentMessage, previousMessage) => {
  if (!previousMessage) return false
  
  const currentTime = new Date(currentMessage.createdAt)
  const previousTime = new Date(previousMessage.createdAt)
  const diff = currentTime - previousTime
  
  return currentMessage.sender._id === previousMessage.sender._id && diff < 300000 // 5分钟内同一发送者
}

// 监听新消息
const handleNewMessage = (message) => {
  if (currentChat.value && 
      currentChat.value.type === 'private' && 
      String(message.sender._id) === String(currentChat.value.id) &&
      !isOwnMessage(message)) { // 排除自己发送的消息
    messages.value.push({ ...message, status: 'received' })
    nextTick(() => scrollToBottom())
  }
  
  // 更新聊天列表的未读计数
  updateUnreadCount('private', message.sender._id, message)
}

// 监听新群聊消息
const handleNewGroupMessage = (message) => {
  if (currentChat.value && 
      currentChat.value.type === 'group' && 
      String(message.group) === String(currentChat.value.id) &&
      !isOwnMessage(message)) { // 排除自己发送的消息
    messages.value.push({ ...message, status: 'received' })
    nextTick(() => scrollToBottom())
  }
  
  // 更新聊天列表的未读计数
  updateUnreadCount('group', message.group, message)
}

// 更新未读消息计数
const updateUnreadCount = (chatType, chatId, message) => {
  // 如果当前正在查看这个聊天，不增加未读计数
  if (currentChat.value && 
      currentChat.value.type === chatType && 
      String(currentChat.value.id) === String(chatId)) {
    return
  }
  
  // 找到对应的聊天并更新未读计数
  const chatIndex = chats.value.findIndex(chat => 
    chat.type === chatType && String(chat.id) === String(chatId)
  )
  
  if (chatIndex !== -1) {
    chats.value[chatIndex].unreadCount = (chats.value[chatIndex].unreadCount || 0) + 1
    chats.value[chatIndex].lastMessage = message.content
    chats.value[chatIndex].lastTime = message.createdAt
    
    // 将更新的聊天移到顶部
    const updatedChat = chats.value.splice(chatIndex, 1)[0]
    chats.value.unshift(updatedChat)
  }
}

// 判断是否为自己的消息
const isOwnMessage = (message) => {
  const currentUserId = authStore.user?.id || authStore.user?._id
  const senderId = message.sender._id || message.sender.id
  
  const isOwn = String(currentUserId) === String(senderId)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('消息发送者判断:', {
      currentUserId: String(currentUserId),
      senderId: String(senderId),
      isOwn,
      messageContent: message.content.substring(0, 20) + '...'
    })
  }
  return isOwn
}

// 测试消息显示
const testMessageDisplay = () => {
  // 添加一个测试消息
  const testMessage = {
    _id: 'test-' + Date.now(),
    content: '这是一条测试消息',
    sender: {
      _id: authStore.user?.id || authStore.user?._id,
      username: authStore.user?.username,
      nickname: authStore.user?.nickname,
      avatar: authStore.user?.avatar
    },
    createdAt: new Date(),
    status: 'sent'
  }
  
  console.log('添加测试消息:', testMessage)
  console.log('测试消息是否为自己的消息:', isOwnMessage(testMessage))
  
  messages.value.push(testMessage)
}

// 监听用户状态变化
const handleUserStatus = (data) => {
  const friend = friends.value.find(f => f._id === data.userId)
  if (friend) {
    friend.status = data.status
  }
}

onMounted(async () => {
  // 检测屏幕尺寸，桌面端默认显示侧边栏
  const isMobile = window.innerWidth <= 768
  showSidebar.value = !isMobile

  // 连接Socket
  if (authStore.user?.id || authStore.user?._id) {
    socketStore.connect(authStore.user?.id || authStore.user?._id)
  }

  // 获取聊天列表
  await getChats()

  // 设置Socket监听
  socketStore.onNewMessage(handleNewMessage)
  socketStore.onNewGroupMessage(handleNewGroupMessage)
  socketStore.onUserStatus(handleUserStatus)
})

// 监听消息变化，自动滚动
watch(messages, () => {
  nextTick(() => scrollToBottom())
})
</script>

<style scoped>
/* 微信风格样式 */
.wechat-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 侧边栏样式 */
.sidebar {
  width: 360px;
  background-color: #2f3237;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e6e6e6;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #2f3237;
  border-bottom: 1px solid #3a3f4c;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #3a3f4c;
}

/* 搜索框样式 */
.search-box {
  padding: 15px 20px;
  background-color: #2f3237;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #3a3f4c;
  border-radius: 20px;
  padding: 8px 15px;
}

.search-input i {
  color: #999;
  margin-right: 8px;
}

.search-input input {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  outline: none;
  font-size: 14px;
}

.search-input input::placeholder {
  color: #999;
}

/* 功能按钮样式 */
.function-buttons {
  padding: 15px 20px;
  border-bottom: 1px solid #3a3f4c;
}

.function-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 15px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
  margin-bottom: 8px;
}

.function-btn:last-child {
  margin-bottom: 0;
}

.function-btn:hover {
  background-color: #3a3f4c;
}

.function-btn i {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.function-btn span {
  font-size: 14px;
}

/* 聊天列表样式 */
.chat-list {
  flex: 1;
  overflow-y: auto;
  background-color: #2f3237;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #3a3f4c;
}

.chat-item:hover {
  background-color: #3a3f4c;
}

.chat-item.active {
  background-color: #1aad19;
}

.chat-avatar {
  position: relative;
  margin-right: 12px;
}

.chat-avatar img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff3b30;
  color: white;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  padding: 0 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  color: #fff;
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-last-message {
  color: #999;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  color: #999;
  font-size: 12px;
  margin-left: 10px;
}

/* 主聊天区域样式 */
.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  background-color: #fff;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 500;
}

.online-status {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
}

.status-dot.online {
  background-color: #1aad19;
}

/* 消息区域样式 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f5f5;
}

.messages-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.load-more {
  text-align: center;
  margin-bottom: 20px;
}

.load-more button {
  background-color: #fff;
  border: 1px solid #e6e6e6;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.load-more button:hover {
  background-color: #f0f0f0;
}

.load-more button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.time-divider {
  text-align: center;
  margin: 20px 0;
  color: #999;
  font-size: 12px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
}

.message-item.own {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 8px;
}

.message-avatar img {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.message-avatar-placeholder {
  width: 35px;
  margin: 0 8px;
}

.message-content {
  max-width: 60%;
}

.message-bubble {
  background-color: #fff;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-item.own .message-bubble {
  background-color: #1aad19;
  color: #fff;
}

.message-text {
  font-size: 16px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.message-item.own .message-status {
  color: rgba(255, 255, 255, 0.8);
}

.message-status-icon {
  margin-left: 5px;
}

/* 输入区域样式 */
.input-area {
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  padding: 15px 20px;
}

.input-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.tool-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tool-btn:hover {
  background-color: #f0f0f0;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.message-input {
  flex: 1;
  border: 1px solid #e6e6e6;
  border-radius: 20px;
  padding: 10px 15px;
  font-size: 16px;
  resize: none;
  outline: none;
  max-height: 120px;
  min-height: 40px;
  font-family: inherit;
}

.message-input:focus {
  border-color: #1aad19;
}

.send-btn {
  background-color: #1aad19;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.send-btn:hover {
  background-color: #129611;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 欢迎页面样式 */
.welcome-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.welcome-content {
  text-align: center;
  color: #666;
}

.welcome-icon {
  font-size: 80px;
  color: #1aad19;
  margin-bottom: 20px;
}

.welcome-content h2 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.welcome-content p {
  font-size: 16px;
  color: #999;
}

/* 表情选择器样式 */
.emoji-picker {
  position: absolute;
  bottom: 80px;
  left: 20px;
  background-color: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.emoji-list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
  text-align: center;
}

.emoji-item:hover {
  background-color: #f0f0f0;
}

/* 语音录制器样式 */
.voice-recorder {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.voice-modal {
  background-color: #fff;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
}

.voice-icon {
  font-size: 60px;
  color: #1aad19;
  margin-bottom: 20px;
}

.voice-content p {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.voice-btn {
  background-color: #1aad19;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.voice-btn:hover {
  background-color: #129611;
}

/* 移动端菜单按钮样式 */
.mobile-menu-btn {
  display: none; /* 默认隐藏 */
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  background-color: #2f3237;
  border: 1px solid #3a3f4c;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mobile-menu-btn:hover {
  background-color: #3a3f4c;
}

.mobile-menu-btn i {
  font-size: 20px;
  color: #fff;
}

/* 移动端关闭按钮样式 */
.mobile-close-btn {
  display: none; /* 默认隐藏 */
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  background-color: #2f3237;
  border: 1px solid #3a3f4c;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mobile-close-btn:hover {
  background-color: #3a3f4c;
}

.mobile-close-btn i {
  font-size: 20px;
  color: #fff;
}

/* 移动端遮罩层样式 */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  opacity: 0;
  transition: opacity 0.3s;
}

.mobile-overlay.show {
  opacity: 1;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: absolute;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .main-chat {
    width: 100%;
  }

  .mobile-menu-btn {
    display: flex !important;
  }

  .mobile-close-btn {
    display: flex !important;
  }

  .mobile-overlay {
    display: block !important;
  }
}
</style> 