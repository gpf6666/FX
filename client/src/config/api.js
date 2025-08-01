// API 基础 URL 配置
import envConfig from './render.js'
import axios from 'axios'

const API_BASE_URL = envConfig.API_URL

// 设置axios默认配置
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = 15000
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.withCredentials = false // 跨域请求不发送cookies

// 请求拦截器 - 添加token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API请求错误:', error)
    
    if (error.response?.status === 401) {
      // token过期，清除本地存储
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else if (error.code === 'ERR_NETWORK') {
      // 网络错误，可能是跨域问题
      console.error('网络错误，请检查API地址:', API_BASE_URL)
    } else if (error.response?.status === 0) {
      // CORS错误
      console.error('CORS错误，请检查服务器CORS配置')
    }
    
    return Promise.reject(error)
  }
)

export default API_BASE_URL 