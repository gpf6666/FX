/**
 * 简化的环境变量验证工具
 */

function validateEnvironment() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Environment validation passed');
}

function logEnvInfo() {
  console.log('Environment Configuration:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- PORT: ${process.env.PORT || '3000'}`);
  console.log(`- Platform: ${process.env.RENDER ? 'Render' : 'Local'}`);
}

module.exports = {
  validateEnvironment,
  logEnvInfo
} 