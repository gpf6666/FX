const express = require('express');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { authenticateToken } = require('./auth');
const router = express.Router();

// 获取所有用户（用于添加好友）
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.userId }
    }).select('username nickname avatar status');

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取推荐用户（用于添加好友）
router.get('/recommended', authenticateToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    const currentUserFriends = currentUser.friends || [];
    
    // 获取推荐用户（排除自己和好友）
    const recommendedUsers = await User.find({
      _id: { 
        $ne: req.user.userId,
        $nin: currentUserFriends
      }
    })
    .select('username nickname avatar status')
    .limit(10);
    
    // 检查是否已经发送过好友请求
    const currentUserSentRequests = await FriendRequest.find({
      sender: req.user.userId,
      status: 'pending'
    });
    
    const usersWithStatus = recommendedUsers.map(user => {
      const requestSent = currentUserSentRequests.some(request => 
        request.receiver.toString() === user._id.toString()
      );
      
      return {
        ...user.toObject(),
        isFriend: false,
        requestSent
      };
    });

    res.json({
      success: true,
      users: usersWithStatus
    });
  } catch (error) {
    console.error('获取推荐用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 搜索用户（支持用户名和昵称搜索）
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || keyword.trim() === '') {
      return res.json({
        success: true,
        users: []
      });
    }

    // 构建搜索条件：支持用户名和昵称模糊搜索
    const searchCondition = {
      _id: { $ne: req.user.userId }, // 排除自己
      $or: [
        { username: { $regex: keyword, $options: 'i' } }, // 用户名模糊搜索，不区分大小写
        { nickname: { $regex: keyword, $options: 'i' } }  // 昵称模糊搜索，不区分大小写
      ]
    };

    const users = await User.find(searchCondition)
      .select('username nickname avatar status')
      .limit(20); // 限制搜索结果数量

    // 检查是否已经是好友
    const currentUser = await User.findById(req.user.userId);
    const currentUserFriends = currentUser.friends || [];
    
    // 检查是否已经发送过好友请求
    const currentUserSentRequests = await FriendRequest.find({
      sender: req.user.userId,
      status: 'pending'
    });
    
    const usersWithStatus = users.map(user => {
      const isFriend = currentUserFriends.some(friendId => 
        friendId.toString() === user._id.toString()
      );
      
      const requestSent = currentUserSentRequests.some(request => 
        request.receiver.toString() === user._id.toString()
      );
      
      return {
        ...user.toObject(),
        isFriend,
        requestSent
      };
    });

    res.json({
      success: true,
      users: usersWithStatus
    });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户详情
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 更新用户信息
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    const updateData = {};

    if (nickname) updateData.nickname = nickname;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: '更新成功',
      user
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 发送好友请求
router.post('/friends/request', authenticateToken, async (req, res) => {
  try {
    const { receiver, message } = req.body;
    
    // 检查接收者是否存在
    const targetUser = await User.findById(receiver);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 不能给自己发送好友请求
    if (receiver === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '不能给自己发送好友请求'
      });
    }

    // 检查是否已经是好友
    const currentUser = await User.findById(req.user.userId);
    if (currentUser.friends.includes(receiver)) {
      return res.status(400).json({
        success: false,
        message: '已经是好友了'
      });
    }

    // 检查是否已经发送过请求
    const existingRequest = await FriendRequest.findOne({
      sender: req.user.userId,
      receiver: receiver,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: '已经发送过好友请求了'
      });
    }

    // 创建好友请求
    const friendRequest = new FriendRequest({
      sender: req.user.userId,
      receiver: receiver,
      message: message || '请求添加您为好友'
    });

    await friendRequest.save();

    res.status(201).json({
      success: true,
      message: '好友请求已发送'
    });
  } catch (error) {
    console.error('发送好友请求错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 添加好友（通过用户名）
router.post('/friends/:username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUser = await User.findById(req.user.userId);
    const targetUser = await User.findOne({ username });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 不能添加自己为好友
    if (targetUser._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: '不能添加自己为好友'
      });
    }

    if (currentUser.friends.includes(targetUser._id)) {
      return res.status(400).json({
        success: false,
        message: '已经是好友了'
      });
    }

    // 互相添加好友
    currentUser.friends.push(targetUser._id);
    targetUser.friends.push(req.user.userId);

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: '添加好友成功'
    });
  } catch (error) {
    console.error('添加好友错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取收到的好友请求
router.get('/friends/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user.userId,
      status: 'pending'
    }).populate('sender', 'username nickname avatar');

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('获取好友请求错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 接受好友请求
router.post('/friends/accept/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: '好友请求不存在'
      });
    }

    // 检查是否是接收者
    if (friendRequest.receiver.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '无权操作此请求'
      });
    }

    // 更新请求状态
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // 互相添加好友
    const currentUser = await User.findById(req.user.userId);
    const senderUser = await User.findById(friendRequest.sender);

    if (!currentUser.friends.includes(friendRequest.sender)) {
      currentUser.friends.push(friendRequest.sender);
    }
    if (!senderUser.friends.includes(req.user.userId)) {
      senderUser.friends.push(req.user.userId);
    }

    await currentUser.save();
    await senderUser.save();

    res.json({
      success: true,
      message: '已接受好友请求'
    });
  } catch (error) {
    console.error('接受好友请求错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 拒绝好友请求
router.post('/friends/reject/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        success: false,
        message: '好友请求不存在'
      });
    }

    // 检查是否是接收者
    if (friendRequest.receiver.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '无权操作此请求'
      });
    }

    // 更新请求状态
    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({
      success: true,
      message: '已拒绝好友请求'
    });
  } catch (error) {
    console.error('拒绝好友请求错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取好友列表
router.get('/friends/list', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('friends', 'username nickname avatar status');

    res.json({
      success: true,
      friends: user.friends
    });
  } catch (error) {
    console.error('获取好友列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除好友
router.delete('/friends/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.userId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 互相删除好友
    currentUser.friends = currentUser.friends.filter(
      friendId => friendId.toString() !== userId
    );
    targetUser.friends = targetUser.friends.filter(
      friendId => friendId.toString() !== req.user.userId
    );

    await currentUser.save();
    await targetUser.save();

    res.json({
      success: true,
      message: '删除好友成功'
    });
  } catch (error) {
    console.error('删除好友错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 