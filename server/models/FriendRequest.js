const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    default: '请求添加您为好友'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// 索引优化查询性能
friendRequestSchema.index({ sender: 1, receiver: 1 });
friendRequestSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('FriendRequest', friendRequestSchema); 