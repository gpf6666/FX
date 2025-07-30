import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('socket', () => {
  const socket = ref(null)
  const connected = ref(false)
  const connecting = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const messageCallbacks = ref(new Map())
  const groupMessageCallbacks = ref(new Map())
  const userStatusCallbacks = ref(new Map())
  const momentCallbacks = ref(new Map())

  // 连接Socket
  const connect = (userId) => {
    if (connecting.value) return
    
    connecting.value = true
    
    if (socket.value) {
      socket.value.disconnect()
    }

    socket.value = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: maxReconnectAttempts
    })
    
    socket.value.on('connect', () => {
      connected.value = true
      connecting.value = false
      reconnectAttempts.value = 0
      console.log('Socket connected successfully')
      
      // 发送用户登录事件
      if (userId) {
        socket.value.emit('user_login', userId)
        console.log('User login event sent:', userId)
      }
    })

    socket.value.on('disconnect', (reason) => {
      connected.value = false
      connecting.value = false
      console.log('Socket disconnected:', reason)
      
      if (reason === 'io server disconnect') {
        // 服务器主动断开，尝试重连
        setTimeout(() => {
          if (reconnectAttempts.value < maxReconnectAttempts) {
            reconnectAttempts.value++
            connect(userId)
          }
        }, 1000)
      }
    })

    socket.value.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      connected.value = false
      connecting.value = false
      
      // 连接失败，尝试重连
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        setTimeout(() => {
          connect(userId)
        }, 2000)
      }
    })

    socket.value.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      reconnectAttempts.value = 0
      
      // 重新发送用户登录事件
      if (userId) {
        socket.value.emit('user_login', userId)
      }
    })

    socket.value.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error)
    })

    socket.value.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after', maxReconnectAttempts, 'attempts')
      reconnectAttempts.value = 0
    })

    // 监听新消息
    socket.value.on('new_message', (message) => {
      console.log('New message received:', message)
      // 调用所有注册的回调函数
      messageCallbacks.value.forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in message callback:', error)
        }
      })
    })

    // 监听新群聊消息
    socket.value.on('new_group_message', (message) => {
      console.log('New group message received:', message)
      // 调用所有注册的回调函数
      groupMessageCallbacks.value.forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error('Error in group message callback:', error)
        }
      })
    })

    // 监听用户状态变化
    socket.value.on('user_status', (data) => {
      console.log('User status change:', data)
      // 调用所有注册的回调函数
      userStatusCallbacks.value.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in user status callback:', error)
        }
      })
    })

    // 监听新朋友圈
    socket.value.on('new_moment', (moment) => {
      console.log('New moment received:', moment)
      // 调用所有注册的回调函数
      momentCallbacks.value.forEach(callback => {
        try {
          callback(moment)
        } catch (error) {
          console.error('Error in moment callback:', error)
        }
      })
    })

    // 监听消息发送状态
    socket.value.on('message_sent', (data) => {
      console.log('Message sent confirmation:', data)
      // 这里可以更新消息状态为已发送
    })

    socket.value.on('message_read', (data) => {
      console.log('Message read confirmation:', data)
      // 这里可以更新消息状态为已读
    })
  }

  // 断开连接
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
      connecting.value = false
      reconnectAttempts.value = 0
      // 清空所有回调
      messageCallbacks.value.clear()
      groupMessageCallbacks.value.clear()
      userStatusCallbacks.value.clear()
      momentCallbacks.value.clear()
    }
  }

  // 发送私聊消息
  const sendPrivateMessage = (data) => {
    if (socket.value && connected.value) {
      console.log('Sending private message:', data)
      socket.value.emit('private_message', data)
      return true
    } else {
      console.warn('Socket not connected, cannot send message')
      return false
    }
  }

  // 发送群聊消息
  const sendGroupMessage = (data) => {
    if (socket.value && connected.value) {
      console.log('Sending group message:', data)
      socket.value.emit('group_message', data)
      return true
    } else {
      console.warn('Socket not connected, cannot send group message')
      return false
    }
  }

  // 标记消息为已读
  const markMessageAsRead = (messageId) => {
    if (socket.value && connected.value) {
      socket.value.emit('mark_message_read', { messageId })
    }
  }

  // 监听新消息
  const onNewMessage = (callback) => {
    const callbackId = Date.now() + Math.random()
    messageCallbacks.value.set(callbackId, callback)
    return callbackId
  }

  // 监听新群聊消息
  const onNewGroupMessage = (callback) => {
    const callbackId = Date.now() + Math.random()
    groupMessageCallbacks.value.set(callbackId, callback)
    return callbackId
  }

  // 监听用户状态变化
  const onUserStatus = (callback) => {
    const callbackId = Date.now() + Math.random()
    userStatusCallbacks.value.set(callbackId, callback)
    return callbackId
  }

  // 监听新朋友圈
  const onNewMoment = (callback) => {
    const callbackId = Date.now() + Math.random()
    momentCallbacks.value.set(callbackId, callback)
    return callbackId
  }

  // 移除监听器
  const removeListener = (event, callbackId) => {
    switch (event) {
      case 'new_message':
        messageCallbacks.value.delete(callbackId)
        break
      case 'new_group_message':
        groupMessageCallbacks.value.delete(callbackId)
        break
      case 'user_status':
        userStatusCallbacks.value.delete(callbackId)
        break
      case 'new_moment':
        momentCallbacks.value.delete(callbackId)
        break
    }
  }

  // 移除所有监听器
  const removeAllListeners = () => {
    messageCallbacks.value.clear()
    groupMessageCallbacks.value.clear()
    userStatusCallbacks.value.clear()
    momentCallbacks.value.clear()
  }

  // 获取连接状态
  const getConnectionStatus = () => {
    return {
      connected: connected.value,
      connecting: connecting.value,
      reconnectAttempts: reconnectAttempts.value,
      maxReconnectAttempts
    }
  }

  return {
    socket,
    connected,
    connecting,
    connect,
    disconnect,
    sendPrivateMessage,
    sendGroupMessage,
    markMessageAsRead,
    onNewMessage,
    onNewGroupMessage,
    onUserStatus,
    onNewMoment,
    removeListener,
    removeAllListeners,
    getConnectionStatus
  }
}) 