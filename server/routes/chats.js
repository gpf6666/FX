const express = require('express');
const Message = require('../models/Message');
const Group = require('../models/Group');
const { authenticateToken } = require('./auth');
const router = express.Router();

// 获取私聊消息
router.get('/private/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: userId },
        { sender: userId, receiver: req.user.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('sender', 'username nickname avatar')
    .populate('receiver', 'username nickname avatar');

    // 标记消息为已读
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('获取私聊消息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 发送私聊消息
router.post('/private', authenticateToken, async (req, res) => {
  try {
    const { receiver, content, type = 'text' } = req.body;

    const message = new Message({
      sender: req.user.userId,
      receiver,
      content,
      type
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username nickname avatar')
      .populate('receiver', 'username nickname avatar');

    // 通过Socket推送消息给接收者
    const io = req.app.get('io');
    if (io) {
      // 只推送给接收者，不推送给发送者
      io.to(`user_${receiver}`).emit('new_message', populatedMessage);
    }

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 创建群组
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = new Group({
      name,
      description,
      avatar: '/default-group-avatar.svg', // 固定的群组头像
      creator: req.user.userId,
      members: [
        { user: req.user.userId, role: 'admin' },
        ...members.map(memberId => ({ user: memberId, role: 'member' }))
      ],
      admins: [req.user.userId]
    });

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('members.user', 'username nickname avatar')
      .populate('creator', 'username nickname avatar');

    res.status(201).json({
      success: true,
      group: populatedGroup
    });
  } catch (error) {
    console.error('创建群组错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取群组列表
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user.userId,
      isActive: true
    })
    .populate('members.user', 'username nickname avatar')
    .populate('creator', 'username nickname avatar');

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('获取群组列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取群组详情
router.get('/groups/:groupId/detail', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // 检查用户是否在群组中
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user.userId,
      isActive: true
    })
    .populate('members.user', 'username nickname avatar')
    .populate('creator', 'username nickname avatar');

    if (!group) {
      return res.status(403).json({
        success: false,
        message: '您不在该群组中'
      });
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    console.error('获取群组详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取群聊消息
router.get('/groups/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // 检查用户是否在群组中
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user.userId,
      isActive: true
    });

    if (!group) {
      return res.status(403).json({
        success: false,
        message: '您不在该群组中'
      });
    }

    const messages = await Message.find({ group: groupId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'username nickname avatar');

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('获取群聊消息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 发送群聊消息
router.post('/groups/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, type = 'text' } = req.body;

    // 检查用户是否在群组中
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user.userId,
      isActive: true
    });

    if (!group) {
      return res.status(403).json({
        success: false,
        message: '您不在该群组中'
      });
    }

    const message = new Message({
      sender: req.user.userId,
      group: groupId,
      content,
      type
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username nickname avatar');

    // 通过Socket推送群聊消息
    const io = req.app.get('io');
    if (io) {
      // 获取群组成员ID列表
      const memberIds = group.members.map(member => member.user.toString());
      
      // 向群组所有成员推送消息（除了发送者）
      memberIds.forEach(memberId => {
        if (memberId !== req.user.userId.toString()) {
          io.to(`user_${memberId}`).emit('new_group_message', {
            ...populatedMessage.toObject(),
            group: groupId,
            groupMembers: memberIds
          });
        }
      });
    }

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('发送群聊消息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 退出群组
router.post('/groups/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // 检查用户是否在群组中
    const group = await Group.findOne({
      _id: groupId,
      'members.user': req.user.userId,
      isActive: true
    });

    if (!group) {
      return res.status(403).json({
        success: false,
        message: '您不在该群组中'
      });
    }

    // 检查是否为群主
    if (group.creator.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '群主不能退出群组，请转让群主或解散群组'
      });
    }

    // 从群组中移除用户
    group.members = group.members.filter(member => member.user.toString() !== req.user.userId);
    await group.save();

    res.json({
      success: true,
      message: '已退出群组'
    });
  } catch (error) {
    console.error('退出群组错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取未读消息数量
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const privateUnread = await Message.countDocuments({
      receiver: req.user.userId,
      isRead: false
    });

    // 获取用户所在的群组
    const userGroups = await Group.find({
      'members.user': req.user.userId,
      isActive: true
    }).select('_id');

    const groupIds = userGroups.map(group => group._id);
    const groupUnread = await Message.countDocuments({
      group: { $in: groupIds },
      sender: { $ne: req.user.userId }
    });

    res.json({
      success: true,
      unread: {
        private: privateUnread,
        group: groupUnread,
        total: privateUnread + groupUnread
      }
    });
  } catch (error) {
    console.error('获取未读消息数量错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取未读消息数量
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    // 获取私聊未读消息数量
    const privateUnreadCount = await Message.countDocuments({
      receiver: req.user.userId,
      sender: { $ne: req.user.userId },
      isRead: false,
      group: { $exists: false }
    });

    // 获取群聊未读消息数量
    const groupUnreadCount = await Message.countDocuments({
      group: { $exists: true },
      sender: { $ne: req.user.userId },
      isRead: false,
      $or: [
        { receiver: req.user.userId },
        { 'group.members.user': req.user.userId }
      ]
    });

    res.json({
      success: true,
      unreadCount: {
        private: privateUnreadCount,
        group: groupUnreadCount,
        total: privateUnreadCount + groupUnreadCount
      }
    });
  } catch (error) {
    console.error('获取未读消息数量错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 