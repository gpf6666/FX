// Glitch 环境配置
const GLITCH_CONFIG = {
  // 开发环境
  development: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3000',
    BASE_URL: '/'
  },
  // 生产环境 (Glitch)
  production: {
    // 部署后需要更新为实际的 Glitch URL
    API_URL: 'https://your-project-name.glitch.me',
    SOCKET_URL: 'https://your-project-name.glitch.me',
    BASE_URL: '/FX/'
  }
};

// 获取当前环境
const getGlitchConfig = () => {
  const mode = import.meta.env.MODE || 'development';
  return GLITCH_CONFIG[mode] || GLITCH_CONFIG.development;
};

export default getGlitchConfig(); 