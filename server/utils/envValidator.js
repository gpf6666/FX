/**
 * 环境变量验证工具
 * 确保所有必需的环境变量都已设置
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET'
]

const optionalEnvVars = [
  'PORT',
  'NODE_ENV'
]

function validateEnvironment() {
  const missing = []
  const warnings = []

  // 检查必需的环境变量
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  // 检查可选的环境变量
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName)
    }
  })

  // 如果有缺失的必需变量，抛出错误
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // 如果有缺失的可选变量，输出警告
  if (warnings.length > 0) {
    console.warn(`Warning: Missing optional environment variables: ${warnings.join(', ')}`)
  }

  // 验证 JWT_SECRET 长度
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters long for security')
  }

  // 验证 MongoDB URI 格式
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mongodb')) {
    console.warn('Warning: MONGODB_URI does not appear to be a valid MongoDB connection string')
  }

  console.log('✅ Environment variables validation passed')
}

// 安全的环境变量获取函数
function getEnvVar(name, defaultValue = null) {
  const value = process.env[name]
  if (!value && defaultValue === null) {
    throw new Error(`Environment variable ${name} is required but not set`)
  }
  return value || defaultValue
}

// 敏感信息脱敏函数
function maskSensitiveInfo(str) {
  if (!str) return str
  if (str.length <= 8) return '*'.repeat(str.length)
  return str.substring(0, 4) + '*'.repeat(str.length - 8) + str.substring(str.length - 4)
}

// 安全的环境变量日志函数
function logEnvInfo() {
  console.log('Environment Configuration:')
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
  console.log(`- PORT: ${process.env.PORT || '3000'}`)
  console.log(`- MONGODB_URI: ${maskSensitiveInfo(process.env.MONGODB_URI)}`)
  console.log(`- JWT_SECRET: ${maskSensitiveInfo(process.env.JWT_SECRET)}`)
}

module.exports = {
  validateEnvironment,
  getEnvVar,
  maskSensitiveInfo,
  logEnvInfo
} 