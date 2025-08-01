// Render 环境配置
const RENDER_CONFIG = {
  // 开发环境
  development: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3000',
    BASE_URL: '/'
  },
  // 生产环境 (Render)
  production: {
    // 部署后需要更新为实际的 Render URL
    API_URL: 'https://wechat-clone-server.onrender.com',
    SOCKET_URL: 'https://wechat-clone-server.onrender.com',
    BASE_URL: '/FX/'
  }
};

// 获取当前环境
const getRenderConfig = () => {
  const mode = import.meta.env.MODE || 'development';
  return RENDER_CONFIG[mode] || RENDER_CONFIG.development;
};

export default getRenderConfig(); 