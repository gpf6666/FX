<template>
  <div class="wechat-page">
    <!-- 头部 -->
    <div class="wechat-header moments-header-custom">
      <el-button @click="$router.push('/chat')" type="text" size="small" class="header-btn-white">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="wechat-header-title moments-title-white">朋友圈</div>
      <el-button type="text" size="small" @click="showPublishMoment = true" class="header-btn-white">
        <el-icon><Camera /></el-icon>
      </el-button>
    </div>

    <!-- 主内容区域 -->
    <div class="wechat-content">
      <!-- 朋友圈封面和用户信息 -->
      <div class="moments-header">
        <div class="moments-cover">
          <div class="cover-image"></div>
        </div>
        <div class="user-profile">
          <el-avatar :src="authStore.user?.avatar" size="large" class="profile-avatar" />
          <div class="user-name">{{ authStore.user?.nickname || authStore.user?.username }}</div>
        </div>
      </div>

      <!-- 发布朋友圈 -->
      <div class="publish-moment">
        <div class="publish-card">
          <div class="publish-header">
            <el-avatar :src="authStore.user?.avatar" size="small" />
            <div class="publish-input" @click="showPublishMoment = true">
              <span class="publish-placeholder">这一刻的想法...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 朋友圈列表 -->
      <div class="moments-list">
        <div 
          v-for="moment in moments" 
          :key="moment._id"
          class="moment-item"
        >
          <div class="moment-header">
            <el-avatar :src="moment.author.avatar" size="small" class="moment-avatar" />
            <div class="moment-info">
              <div class="moment-author">{{ moment.author.nickname || moment.author.username }}</div>
              <div class="moment-time">{{ formatTime(moment.createdAt) }}</div>
            </div>
            <el-dropdown v-if="moment.author._id === authStore.user?.id" @command="handleMomentCommand">
              <el-button type="text" size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'delete', momentId: moment._id }">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="moment-content">
            {{ moment.content }}
          </div>

          <div v-if="moment.images && moment.images.length > 0" class="moment-images">
            <div 
              v-for="(image, index) in moment.images" 
              :key="index"
              class="moment-image-wrapper"
              :class="getImageClass(moment.images.length)"
              @click="previewImage(moment.images, index)"
            >
              <img 
                :src="image"
                :alt="`朋友圈图片 ${index + 1}`"
                class="moment-image"
              />
            </div>
          </div>

          <div v-if="moment.location" class="moment-location">
            <el-icon><Location /></el-icon>
            {{ moment.location }}
          </div>

          <!-- 点赞和评论区域 -->
          <div class="moment-actions">
            <div class="action-buttons">
              <el-button 
                type="text" 
                size="small"
                :class="{ 'liked': isLiked(moment) }"
                @click="toggleLike(moment._id)"
              >
                <el-icon><Star /></el-icon>
                {{ moment.likes.length > 0 ? moment.likes.length : '' }} 赞
              </el-button>
              <el-button 
                type="text" 
                size="small"
                @click="showCommentInput(moment._id)"
              >
                <el-icon><ChatDotRound /></el-icon>
                {{ moment.comments.length > 0 ? moment.comments.length : '' }} 评论
              </el-button>
            </div>
          </div>

          <!-- 点赞列表 -->
          <div v-if="moment.likes.length > 0" class="moment-likes">
            <el-icon><Star /></el-icon>
            <span v-for="(like, index) in moment.likes" :key="like.user._id">
              {{ like.user.nickname || like.user.username }}
              <span v-if="index < moment.likes.length - 1">、</span>
            </span>
          </div>

          <!-- 评论列表 -->
          <div v-if="moment.comments.length > 0" class="moment-comments">
            <div 
              v-for="comment in moment.comments" 
              :key="comment._id"
              class="comment-item"
            >
              <span class="comment-author">{{ comment.user.nickname || comment.user.username }}</span>
              <span v-if="comment.replyTo" class="comment-reply">
                回复 {{ comment.replyTo.nickname || comment.replyTo.username }}：
              </span>
              <span class="comment-content">{{ comment.content }}</span>
              <el-button 
                v-if="comment.user._id === authStore.user?.id || moment.author._id === authStore.user?.id"
                type="text" 
                size="small"
                @click="deleteComment(moment._id, comment._id)"
              >
                删除
              </el-button>
            </div>
          </div>

          <!-- 评论输入框 -->
          <div v-if="activeCommentInput === moment._id" class="comment-input">
            <el-input
              v-model="commentText"
              placeholder="写评论..."
              @keydown.enter.prevent="submitComment(moment._id)"
            >
              <template #append>
                <el-button @click="submitComment(moment._id)">发送</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more">
        <el-button @click="loadMore" :loading="loading">加载更多</el-button>
      </div>

      <!-- 空状态 -->
      <div v-if="moments.length === 0 && !loading" class="wechat-empty">
        <div class="wechat-empty-icon">
          <el-icon><Picture /></el-icon>
        </div>
        <p>暂无朋友圈内容</p>
      </div>
    </div>

    <!-- 发布朋友圈对话框 -->
    <el-dialog v-model="showPublishMoment" title="发布朋友圈" width="600px">
      <el-form :model="publishForm" label-width="80px">
        <el-form-item label="内容">
          <el-input
            v-model="publishForm.content"
            type="textarea"
            :rows="4"
            placeholder="这一刻的想法..."
          />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            :limit="9"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="publishForm.location" placeholder="添加位置（可选）" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-radio-group v-model="publishForm.isPublic">
            <el-radio :label="true">公开</el-radio>
            <el-radio :label="false">仅好友可见</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPublishMoment = false">取消</el-button>
        <el-button type="primary" @click="publishMoment" :loading="publishing">
          发布
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Camera, MoreFilled, Star, ChatDotRound, Location, Picture } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { useSocketStore } from '../stores/socket'
import axios from 'axios'

const authStore = useAuthStore()
const socketStore = useSocketStore()

// 响应式数据
const moments = ref([])
const loading = ref(false)
const publishing = ref(false)
const hasMore = ref(true)
const page = ref(1)
const showPublishMoment = ref(false)
const activeCommentInput = ref(null)
const commentText = ref('')

const publishForm = reactive({
  content: '',
  images: [],
  location: '',
  isPublic: true
})

// 获取朋友圈列表
const getMoments = async (reset = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    if (reset) {
      page.value = 1
      moments.value = []
    }
    
    const response = await axios.get('/api/moments', {
      params: { page: page.value, limit: 10 }
    })
    
    if (response.data.success) {
      if (reset) {
        moments.value = response.data.moments
      } else {
        moments.value.push(...response.data.moments)
      }
      
      hasMore.value = response.data.moments.length === 10
      page.value++
    }
  } catch (error) {
    console.error('获取朋友圈失败:', error)
    ElMessage.error('获取朋友圈失败')
  } finally {
    loading.value = false
  }
}

// 发布朋友圈
const publishMoment = async () => {
  if (!publishForm.content.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  publishing.value = true
  try {
    const response = await axios.post('/api/moments', publishForm)
    if (response.data.success) {
      ElMessage.success('发布成功')
      showPublishMoment.value = false
      Object.assign(publishForm, { content: '', images: [], location: '', isPublic: true })
      await getMoments(true)
    }
  } catch (error) {
    console.error('发布朋友圈失败:', error)
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

// 点赞/取消点赞
const toggleLike = async (momentId) => {
  try {
    const response = await axios.post(`/api/moments/${momentId}/like`)
    if (response.data.success) {
      const moment = moments.value.find(m => m._id === momentId)
      if (moment) {
        moment.likes = response.data.moment.likes
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 显示评论输入框
const showCommentInput = (momentId) => {
  activeCommentInput.value = momentId
  commentText.value = ''
}

// 提交评论
const submitComment = async (momentId) => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  try {
    const response = await axios.post(`/api/moments/${momentId}/comment`, {
      content: commentText.value
    })
    if (response.data.success) {
      const moment = moments.value.find(m => m._id === momentId)
      if (moment) {
        moment.comments = response.data.moment.comments
      }
      commentText.value = ''
      activeCommentInput.value = null
    }
  } catch (error) {
    console.error('评论失败:', error)
    ElMessage.error('评论失败')
  }
}

// 删除评论
const deleteComment = async (momentId, commentId) => {
  try {
    const response = await axios.delete(`/api/moments/${momentId}/comment/${commentId}`)
    if (response.data.success) {
      const moment = moments.value.find(m => m._id === momentId)
      if (moment) {
        moment.comments = response.data.moment.comments
      }
      ElMessage.success('删除成功')
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    ElMessage.error('删除失败')
  }
}

// 删除朋友圈
const deleteMoment = async (momentId) => {
  try {
    const response = await axios.delete(`/api/moments/${momentId}`)
    if (response.data.success) {
      moments.value = moments.value.filter(m => m._id !== momentId)
      ElMessage.success('删除成功')
    }
  } catch (error) {
    console.error('删除朋友圈失败:', error)
    ElMessage.error('删除失败')
  }
}

// 处理朋友圈命令
const handleMomentCommand = (command) => {
  if (command.action === 'delete') {
    ElMessageBox.confirm('确定要删除这条朋友圈吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deleteMoment(command.momentId)
    })
  }
}

// 检查是否已点赞
const isLiked = (moment) => {
  return moment.likes.some(like => like.user._id === authStore.user?.id)
}

// 格式化时间
const formatTime = (time) => {
  const now = new Date()
  const momentTime = new Date(time)
  const diff = now - momentTime
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return momentTime.toLocaleDateString('zh-CN')
}

// 获取图片布局类名
const getImageClass = (count) => {
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  if (count === 3) return 'triple'
  if (count === 4) return 'quad'
  return 'grid'
}

// 加载更多
const loadMore = () => {
  getMoments()
}

// 处理图片上传
const handleImageChange = (file) => {
  // 这里应该上传到服务器，这里简化处理
  publishForm.images.push(URL.createObjectURL(file.raw))
}

const handleImageRemove = (file) => {
  const index = publishForm.images.indexOf(file.url)
  if (index > -1) {
    publishForm.images.splice(index, 1)
  }
}

// 预览图片
const previewImage = (images, index) => {
  // 这里可以使用图片预览组件
  console.log('预览图片:', images[index])
}

// 监听新朋友圈
const handleNewMoment = (moment) => {
  moments.value.unshift(moment)
}

onMounted(async () => {
  await getMoments(true)
  socketStore.onNewMoment(handleNewMoment)
})
</script>

<style scoped>
/* 朋友圈头部自定义样式 */
.moments-header-custom {
  background-color: #2f3237 !important;
}

.header-btn-white {
  color: white !important;
}

.header-btn-white .el-icon {
  color: white !important;
}

.header-btn-white:hover {
  color: #f0f0f0 !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.header-btn-white:hover .el-icon {
  color: #f0f0f0 !important;
}

/* 确保Element Plus按钮样式被覆盖 */
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

/* 确保按钮有足够的点击区域 */
.moments-header-custom .el-button {
  padding: 8px 12px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.moments-title-white {
  color: white !important;
  font-weight: 500 !important;
}

/* 确保整个头部区域的文字都是白色 */
.moments-header-custom .wechat-header-title {
  color: white !important;
}

.moments-header {
  position: relative;
  height: 200px;
  margin-bottom: 60px;
}

.moments-cover {
  height: 100%;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
}

.user-profile {
  position: absolute;
  bottom: -50px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.profile-avatar {
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--wechat-text);
}

.publish-moment {
  margin-bottom: 16px;
  padding: 0 16px;
}

.publish-card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.publish-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.publish-input {
  flex: 1;
  min-height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.publish-placeholder {
  color: var(--wechat-text-light);
  font-size: 16px;
}

.moments-list {
  padding: 0 16px;
}

.moment-item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.moment-avatar {
  margin-right: 12px;
}

.moment-info {
  flex: 1;
}

.moment-author {
  font-size: 16px;
  font-weight: 500;
  color: var(--wechat-text);
  margin-bottom: 2px;
}

.moment-time {
  font-size: 12px;
  color: var(--wechat-text-light);
}

.moment-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: var(--wechat-text);
  font-size: 16px;
}

.moment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.moment-image-wrapper {
  overflow: hidden;
  border-radius: 4px;
}

.moment-image-wrapper.single {
  width: 200px;
  height: 200px;
}

.moment-image-wrapper.double {
  width: calc(50% - 2px);
  height: 120px;
}

.moment-image-wrapper.triple {
  width: calc(33.33% - 3px);
  height: 100px;
}

.moment-image-wrapper.quad {
  width: calc(50% - 2px);
  height: 100px;
}

.moment-image-wrapper.grid {
  width: calc(33.33% - 3px);
  height: 80px;
}

.moment-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.moment-image:hover {
  transform: scale(1.05);
}

.moment-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--wechat-blue);
  margin-bottom: 12px;
}

.moment-actions {
  border-top: 1px solid var(--wechat-border);
  padding-top: 12px;
  margin-bottom: 8px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-buttons .el-button {
  color: var(--wechat-text-secondary);
  font-size: 14px;
}

.action-buttons .el-button.liked {
  color: var(--wechat-green);
}

.moment-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--wechat-blue);
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: var(--wechat-gray);
  border-radius: 4px;
}

.moment-comments {
  background-color: var(--wechat-gray);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
}

.comment-item {
  margin-bottom: 6px;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  flex-wrap: wrap;
}

.comment-item:last-child {
  margin-bottom: 0;
}

.comment-author {
  color: var(--wechat-blue);
  font-weight: 500;
}

.comment-reply {
  color: var(--wechat-blue);
}

.comment-content {
  color: var(--wechat-text);
  flex: 1;
}

.comment-input {
  margin-top: 8px;
}

.load-more {
  text-align: center;
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .moments-header {
    height: 150px;
    margin-bottom: 50px;
  }
  
  .user-profile {
    right: 16px;
    bottom: -40px;
  }
  
  .profile-avatar {
    width: 60px;
    height: 60px;
  }
  
  .publish-moment,
  .moments-list {
    padding: 0 12px;
  }
  
  .moment-image-wrapper.single {
    width: 100%;
    height: 200px;
  }
}
</style> 