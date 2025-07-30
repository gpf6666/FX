import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  // 设置token
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  // 清除token
  const clearToken = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // 登录
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await axios.post('/api/auth/login', credentials)
      if (response.data.success) {
        setToken(response.data.token)
        user.value = response.data.user
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '登录失败' 
      }
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (userData) => {
    loading.value = true
    try {
      const response = await axios.post('/api/auth/register', userData)
      if (response.data.success) {
        setToken(response.data.token)
        user.value = response.data.user
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '注册失败' 
      }
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    if (!token.value) return
    
    try {
      const response = await axios.get('/api/auth/me')
      if (response.data.success) {
        user.value = response.data.user
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      clearToken()
    }
  }

  // 登出
  const logout = () => {
    clearToken()
  }

  // 初始化axios默认配置
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    setToken,
    clearToken,
    login,
    register,
    getUserInfo,
    logout
  }
}) 