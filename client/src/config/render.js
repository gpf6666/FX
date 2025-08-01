// 环境配置
const ENV_CONFIG = {
  // 开发环境
  development: {
    API_URL: 'https://surviving-chandal-starkhome-2f8d1e2b.koyeb.app',
    SOCKET_URL: 'https://surviving-chandal-starkhome-2f8d1e2b.koyeb.app',
    BASE_URL: '/'
  },
  // 生产环境 (Koyeb)
  production: {
    API_URL: 'https://surviving-chandal-starkhome-2f8d1e2b.koyeb.app',
    SOCKET_URL: 'https://surviving-chandal-starkhome-2f8d1e2b.koyeb.app',
    BASE_URL: '/'
  }
};

// 获取当前环境
const getEnvConfig = () => {
  const mode = import.meta.env.MODE || 'development';
  return ENV_CONFIG[mode] || ENV_CONFIG.development;
};

export default getEnvConfig(); 