// API 基础 URL 配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.vercel.app' // 部署后需要更新为实际的 Vercel URL
  : 'http://localhost:3000'

export default API_BASE_URL 