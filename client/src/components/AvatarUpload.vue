<template>
  <div class="avatar-upload">
    <div class="avatar-preview" @click="triggerFileInput">
      <Avatar :src="previewSrc || currentAvatar" :size="size" />
      <div class="upload-overlay">
        <i class="iconfont icon-image"></i>
        <span>更换头像</span>
      </div>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      @change="handleFileChange"
      style="display: none"
    />
    
    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
      </div>
      <span class="progress-text">{{ uploadProgress }}%</span>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="uploadError" class="upload-error">
      {{ uploadError }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Avatar from './Avatar.vue'

const props = defineProps({
  currentAvatar: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'large'
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  }
})

const emit = defineEmits(['upload-success', 'upload-error'])

const fileInput = ref(null)
const previewSrc = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

  // 处理文件选择
  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      uploadError.value = '请选择图片文件'
      return
    }
    
    // 验证文件大小
    if (file.size > props.maxSize) {
      uploadError.value = `文件大小不能超过 ${props.maxSize / 1024 / 1024}MB`
      return
    }
    
    // 清除错误
    uploadError.value = ''
    
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      previewSrc.value = e.target.result
    }
    reader.readAsDataURL(file)
    
    // 上传文件
    try {
      uploading.value = true
      uploadProgress.value = 0
      
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('上传失败')
      }
      
      const result = await response.json()
      
      if (result.success) {
        uploadProgress.value = 100
        uploading.value = false
        
        // 更新预览为服务器返回的URL
        previewSrc.value = result.data.url
        
        emit('upload-success', {
          url: result.data.url,
          file: file
        })
        
        // 清除预览
        setTimeout(() => {
          previewSrc.value = ''
        }, 1000)
      } else {
        throw new Error(result.message || '上传失败')
      }
    } catch (error) {
      uploading.value = false
      uploadError.value = error.message || '上传失败'
      emit('upload-error', error.message || '上传失败')
    }
  }
</script>

<style scoped>
.avatar-upload {
  display: inline-block;
}

.avatar-preview {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-preview:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 12px;
}

.upload-overlay i {
  font-size: 20px;
  margin-bottom: 4px;
}

.upload-progress {
  margin-top: 8px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background-color: #1aad19;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
}

.upload-error {
  margin-top: 8px;
  color: #ff3b30;
  font-size: 12px;
  text-align: center;
}
</style> 