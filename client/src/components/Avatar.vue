<template>
  <div class="avatar-container" :class="[`avatar-${size}`, { 'avatar-circle': circle }]">
    <img 
      :src="avatarSrc" 
      :alt="alt"
      @error="handleImageError"
      @load="handleImageLoad"
      :class="{ 'avatar-loaded': imageLoaded }"
    />
    <div v-if="!imageLoaded && !imageError" class="avatar-loading">
      <div class="loading-spinner"></div>
    </div>
    <div v-if="imageError" class="avatar-fallback">
      <div class="fallback-icon">👤</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: '头像'
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large, xlarge
    validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
  },
  circle: {
    type: Boolean,
    default: true
  },
  fallback: {
    type: String,
    default: '/default-avatar.svg'
  }
})

const imageLoaded = ref(false)
const imageError = ref(false)

// 计算头像源
const avatarSrc = computed(() => {
  if (!props.src || props.src.trim() === '') {
    return props.fallback
  }
  
  // 如果是相对路径，添加基础URL
  if (props.src.startsWith('/')) {
    return props.src
  }
  
  // 如果是完整URL，直接使用
  if (props.src.startsWith('http://') || props.src.startsWith('https://')) {
    return props.src
  }
  
  // 如果是base64，直接使用
  if (props.src.startsWith('data:')) {
    return props.src
  }
  
  // 默认返回fallback
  return props.fallback
})

// 处理图片加载错误
const handleImageError = () => {
  imageError.value = true
  imageLoaded.value = false
}

// 处理图片加载成功
const handleImageLoad = () => {
  imageLoaded.value = true
  imageError.value = false
}

// 监听src变化，重置状态
watch(() => props.src, () => {
  imageLoaded.value = false
  imageError.value = false
})
</script>

<style scoped>
.avatar-container {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background-color: #f0f0f0;
}

.avatar-circle {
  border-radius: 50%;
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: 0;
}

.avatar-container img.avatar-loaded {
  opacity: 1;
}

/* 尺寸样式 */
.avatar-small {
  width: 32px;
  height: 32px;
}

.avatar-medium {
  width: 40px;
  height: 40px;
}

.avatar-large {
  width: 48px;
  height: 48px;
}

.avatar-xlarge {
  width: 64px;
  height: 64px;
}

/* 加载状态 */
.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #1aad19;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.avatar-fallback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1aad19, #129611);
  color: white;
  font-size: 18px;
}

.fallback-icon {
  font-size: 1.2em;
}

/* 响应式尺寸 */
@media (max-width: 768px) {
  .avatar-small {
    width: 28px;
    height: 28px;
  }
  
  .avatar-medium {
    width: 36px;
    height: 36px;
  }
  
  .avatar-large {
    width: 44px;
    height: 44px;
  }
  
  .avatar-xlarge {
    width: 56px;
    height: 56px;
  }
}
</style> 