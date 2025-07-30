<template>
  <div class="group-chat-page">
    <div class="group-header">
      <button class="back-btn" @click="goBack" aria-label="返回">
        <i class="iconfont icon-back"></i>
      </button>
      <h2>群聊</h2>
      <div class="header-actions">
        <button class="test-btn" @click="$router.push('/test-group-avatar')" aria-label="测试群组头像">
          <i class="iconfont icon-group"></i>
        </button>
        <button class="create-btn" @click="showCreateGroup = true" aria-label="创建群组">
          <i class="iconfont icon-add"></i>
        </button>
      </div>
    </div>

    <div class="group-content">
      <!-- 群组列表 -->
      <div v-if="groups.length > 0" class="group-list">
        <div 
          v-for="group in groups" 
          :key="group._id"
          class="group-item"
          @click="selectGroup(group)"
        >
          <div class="group-avatar">
            <Avatar :src="group.avatar" size="medium" />
            <div v-if="group.unreadCount > 0" class="unread-badge">
              {{ group.unreadCount > 99 ? '99+' : group.unreadCount }}
            </div>
          </div>
          <div class="group-info">
            <div class="group-name">{{ group.name }}</div>
            <div class="group-members">{{ group.members.length }}人</div>
            <div class="group-last-message">{{ group.lastMessage || '暂无消息' }}</div>
          </div>
          <div class="group-time">{{ formatTime(group.lastMessageTime) }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="iconfont icon-group"></i>
        </div>
        <p>暂无群组</p>
        <button class="create-group-btn" @click="showCreateGroup = true">
          创建群组
        </button>
      </div>
    </div>

    <!-- 创建群组弹窗 -->
    <el-dialog 
      v-model="showCreateGroup" 
      title="创建群组" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef">

        <el-form-item label="群组名称" prop="name">
          <el-input v-model="groupForm.name" placeholder="请输入群组名称" />
        </el-form-item>
        <el-form-item label="群组描述" prop="description">
          <el-input 
            v-model="groupForm.description" 
            type="textarea" 
            placeholder="请输入群组描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="选择成员">
          <div class="member-selector">
            <div class="selected-members">
              <div 
                v-for="member in selectedMembers" 
                :key="member._id"
                class="selected-member"
              >
                <Avatar :src="member.avatar" size="small" />
                <span>{{ member.nickname || member.username }}</span>
                <button 
                  type="button"
                  class="remove-member"
                  @click.stop.prevent="removeMember(member._id)"
                  aria-label="移除成员"
                >
                  ×
                </button>
              </div>
            </div>
            <button type="button" class="add-member-btn" @click.stop.prevent="openMemberSelector">
              <i class="iconfont icon-add"></i>
              添加成员
            </button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateGroup = false">取消</el-button>
        <el-button type="primary" @click="createGroup" :loading="creating">
          {{ creating ? '创建中...' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 成员选择器弹窗 -->
    <el-dialog 
      v-model="showMemberSelector" 
      title="选择成员" 
      width="600px"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="handleMemberSelectorClose"
    >
      <div class="member-selector-content">
        <div class="search-box">
          <i class="iconfont icon-search"></i>
          <input 
            v-model="memberSearchKeyword" 
            type="text" 
            placeholder="搜索好友" 
            @input="searchMembers"
          />
        </div>
        <div class="member-list">
          <div v-if="filteredFriends.length === 0" class="empty-members">
            <div class="empty-icon">
              <i class="iconfont icon-user"></i>
            </div>
            <p>{{ memberSearchKeyword ? '没有找到匹配的好友' : '暂无好友' }}</p>
          </div>
          <div 
            v-for="friend in filteredFriends" 
            :key="friend._id"
            class="member-item"
            :class="{ selected: isMemberSelected(friend._id) }"
            @click.stop="toggleMember(friend)"
          >
            <div class="member-avatar">
              <Avatar :src="friend.avatar" size="small" />
            </div>
            <div class="member-info">
              <div class="member-name">{{ friend.nickname || friend.username }}</div>
              <div class="member-username">@{{ friend.username }}</div>
            </div>
            <div class="member-check">
              <i v-if="isMemberSelected(friend._id)" class="iconfont icon-check"></i>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelMemberSelection">取消</el-button>
        <el-button type="primary" @click="confirmMembers">确定</el-button>
      </template>
    </el-dialog>

    <!-- 群组详情弹窗 -->
    <el-dialog v-model="showGroupDetail" title="群组详情" width="600px">
      <div v-if="selectedGroupDetail" class="group-detail">
        <div class="group-header-info">
          <Avatar :src="selectedGroupDetail.avatar" size="xlarge" />
          <div class="group-info-detail">
            <h3>{{ selectedGroupDetail.name }}</h3>
            <p>{{ selectedGroupDetail.description || '暂无描述' }}</p>
            <p>群成员：{{ selectedGroupDetail.members.length }}人</p>
          </div>
        </div>
        
        <div class="group-members-list">
          <h4>群成员</h4>
          <div class="members-grid">
            <div 
              v-for="member in selectedGroupDetail.members" 
              :key="member.user._id"
              class="member-card"
            >
              <Avatar :src="member.user.avatar" size="medium" />
              <div class="member-name">{{ member.user.nickname || member.user.username }}</div>
              <div class="member-role">{{ member.role === 'admin' ? '管理员' : '成员' }}</div>
            </div>
          </div>
        </div>

        <div class="group-actions">
          <button 
            v-if="isGroupAdmin"
            class="action-btn edit-btn"
            @click="editGroup"
          >
            编辑群组
          </button>
          <button 
            class="action-btn leave-btn"
            @click="leaveGroup"
          >
            退出群组
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import Avatar from '../components/Avatar.vue'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const groups = ref([])
const friends = ref([])
const showCreateGroup = ref(false)
const showMemberSelector = ref(false)
const showGroupDetail = ref(false)
const creating = ref(false)
const memberSearchKeyword = ref('')
const selectedMembers = ref([])
const tempSelectedMembers = ref([]) // 临时存储成员选择器中的选择
const selectedGroupDetail = ref(null)
const groupFormRef = ref()

// 群组表单
const groupForm = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const groupRules = {
  name: [
    { required: true, message: '请输入群组名称', trigger: 'blur' },
    { min: 2, max: 20, message: '群组名称长度在2-20个字符', trigger: 'blur' }
  ],
  description: [
    { max: 100, message: '群组描述不能超过100个字符', trigger: 'blur' }
  ]
}

// 过滤后的好友列表
const filteredFriends = computed(() => {
  if (!memberSearchKeyword.value) return friends.value
  return friends.value.filter(friend => 
    (friend.nickname || friend.username).toLowerCase().includes(memberSearchKeyword.value.toLowerCase())
  )
})

// 判断是否为群组管理员
const isGroupAdmin = computed(() => {
  if (!selectedGroupDetail.value || !authStore.user) return false
  return selectedGroupDetail.value.members.some(member => 
    member.user._id === authStore.user.id && member.role === 'admin'
  )
})

// 返回上一页
const goBack = () => {
  router.back()
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
    ElMessage.error('获取群组列表失败')
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

// 选择群组
const selectGroup = (group) => {
  // 跳转到聊天页面并选择该群组
  router.push(`/chat?group=${group._id}`)
}

// 创建群组
const createGroup = async () => {
  try {
    await groupFormRef.value.validate()
    
    if (selectedMembers.value.length === 0) {
      ElMessage.warning('请至少选择一个成员')
      return
    }

    creating.value = true

    const response = await axios.post('/api/chats/groups', {
      name: groupForm.name,
      description: groupForm.description,
      members: selectedMembers.value.map(member => member._id)
    })

    if (response.data.success) {
      ElMessage.success('群组创建成功')
      showCreateGroup.value = false
      
      // 重置表单
      groupForm.name = ''
      groupForm.description = ''
      selectedMembers.value = []
      tempSelectedMembers.value = []
      
      // 刷新群组列表
      await getGroups()
    }
  } catch (error) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('创建群组失败')
    }
  } finally {
    creating.value = false
  }
}

// 搜索成员
const searchMembers = () => {
  // 实时搜索，不需要额外处理
}

// 切换成员选择
const toggleMember = (friend) => {
  const index = tempSelectedMembers.value.findIndex(member => member._id === friend._id)
  if (index !== -1) {
    tempSelectedMembers.value.splice(index, 1)
  } else {
    tempSelectedMembers.value.push(friend)
  }
}

// 判断成员是否已选择
const isMemberSelected = (friendId) => {
  return tempSelectedMembers.value.some(member => member._id === friendId)
}

// 移除已选择的成员
const removeMember = (friendId) => {
  const index = selectedMembers.value.findIndex(member => member._id === friendId)
  if (index !== -1) {
    selectedMembers.value.splice(index, 1)
  }
}

// 测试打开成员选择器
const testOpenMemberSelector = async () => {
  console.log('测试打开成员选择器')
  try {
    // 先显示弹窗
    showMemberSelector.value = true
    
    // 确保好友列表已加载
    if (friends.value.length === 0) {
      await getFriends()
    }
    
    console.log('测试弹窗已打开，好友数量:', friends.value.length)
  } catch (error) {
    console.error('测试弹窗打开失败:', error)
    showMemberSelector.value = false
  }
}

// 打开成员选择器
const openMemberSelector = async () => {
  try {
    console.log('开始打开成员选择器')
    
    // 先显示弹窗，再加载数据
    showMemberSelector.value = true
    
    // 确保好友列表已加载
    if (friends.value.length === 0) {
      console.log('好友列表为空，开始加载...')
      await getFriends()
      console.log('好友列表加载完成，数量:', friends.value.length)
    }
    
    // 初始化临时选择为当前已选择的成员
    tempSelectedMembers.value = [...selectedMembers.value]
    
    console.log('成员选择器打开完成，当前选中成员数:', tempSelectedMembers.value.length)
  } catch (error) {
    console.error('打开成员选择器失败:', error)
    ElMessage.error('打开成员选择器失败')
    showMemberSelector.value = false
  }
}

// 取消成员选择
const cancelMemberSelection = () => {
  // 清空临时选择，不影响已选择的成员
  tempSelectedMembers.value = []
  showMemberSelector.value = false
  console.log('取消成员选择')
}

// 确认成员选择
const confirmMembers = () => {
  // 将临时选中的成员合并到创建群组的成员列表中
  selectedMembers.value = [...tempSelectedMembers.value]
  showMemberSelector.value = false
  console.log('确认成员选择，选中成员数:', selectedMembers.value.length)
}

// 查看群组详情
const viewGroupDetail = async (group) => {
  try {
    const response = await axios.get(`/api/chats/groups/${group._id}/detail`)
    if (response.data.success) {
      selectedGroupDetail.value = response.data.group
      showGroupDetail.value = true
    }
  } catch (error) {
    console.error('获取群组详情失败:', error)
    ElMessage.error('获取群组详情失败')
  }
}

// 编辑群组
const editGroup = () => {
  // TODO: 实现编辑群组功能
  ElMessage.info('编辑群组功能开发中')
}

// 退出群组
const leaveGroup = async () => {
  try {
    await ElMessageBox.confirm('确定要退出该群组吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await axios.post(`/api/chats/groups/${selectedGroupDetail.value._id}/leave`)
    
    if (response.data.success) {
      ElMessage.success('已退出群组')
      showGroupDetail.value = false
      await getGroups()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出群组失败')
    }
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString()
}

onMounted(() => {
  getGroups()
  getFriends()
})



// 处理成员选择器关闭
const handleMemberSelectorClose = (done) => {
  console.log('成员选择器即将关闭')
  // 阻止自动关闭，只允许通过按钮关闭
  if (showMemberSelector.value) {
    done()
  }
}


</script>

<style scoped>
.group-chat-page {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #2f3237;
  color: white;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.test-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.test-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}



.back-btn,
.create-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.back-btn:hover,
.create-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.group-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.group-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.group-item:hover {
  background-color: #f8f8f8;
}

.group-avatar {
  position: relative;
  margin-right: 15px;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.group-members {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.group-last-message {
  font-size: 14px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-time {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
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
  margin-bottom: 20px;
}

.create-group-btn {
  background-color: #1aad19;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
}

.create-group-btn:hover {
  background-color: #129611;
}



.member-selector {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.selected-members {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.selected-member {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f0f0;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.remove-member {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-member:hover {
  color: #ff4757;
}

.add-member-btn {
  background-color: #1aad19;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-member-btn:hover {
  background-color: #129611;
}

.member-selector-content {
  max-height: 400px;
  overflow-y: auto;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 10px 15px;
  margin-bottom: 15px;
}

.search-box i {
  color: #999;
  margin-right: 10px;
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  font-size: 14px;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.member-item:hover {
  background-color: #f0f0f0;
}

.member-item.selected {
  background-color: #e8f5e8;
}

.member-avatar {
  margin-right: 12px;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.member-username {
  font-size: 12px;
  color: #999;
}

.member-check {
  color: #1aad19;
  font-size: 16px;
}

.empty-members {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 15px;
  color: #ccc;
}

.empty-members p {
  margin: 0;
  font-size: 14px;
}

.group-detail {
  padding: 20px 0;
}

.group-header-info {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.group-info-detail {
  margin-left: 20px;
}

.group-info-detail h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.group-info-detail p {
  margin: 5px 0;
  color: #666;
}

.group-members-list h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.member-card {
  text-align: center;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 10px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 8px 0 4px 0;
}

.member-role {
  font-size: 12px;
  color: #999;
}

.group-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.edit-btn {
  background-color: #1aad19;
  color: white;
}

.edit-btn:hover {
  background-color: #129611;
}

.leave-btn {
  background-color: #ff4757;
  color: white;
}

.leave-btn:hover {
  background-color: #e63946;
}

@media (max-width: 768px) {
  .group-content {
    padding: 10px;
  }
  
  .group-item {
    padding: 12px;
  }
  
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .group-actions {
    flex-direction: column;
  }
}
</style> 