// Railway 环境配置
const RAILWAY_CONFIG = {
  // 开发环境
  development: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3000',
    BASE_URL: '/'
  },
  // 生产环境 (Railway)
  production: {
    // 部署后需要更新为实际的 Railway URL
    API_URL: 'https://your-project-name.railway.app',
    SOCKET_URL: 'https://your-project-name.railway.app',
    BASE_URL: '/FX/'
  }
};

// 获取当前环境
const getRailwayConfig = () => {
  const mode = import.meta.env.MODE || 'development';
  return RAILWAY_CONFIG[mode] || RAILWAY_CONFIG.development;
};

export default getRailwayConfig(); 