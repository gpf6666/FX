const express = require('express');
const Moment = require('../models/Moment');
const { authenticateToken } = require('./auth');
const router = express.Router();

// 发布朋友圈
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, images, location, isPublic = true, visibleTo } = req.body;

    const moment = new Moment({
      author: req.user.userId,
      content,
      images: images || [],
      location,
      isPublic,
      visibleTo: visibleTo || []
    });

    await moment.save();

    const populatedMoment = await Moment.findById(moment._id)
      .populate('author', 'username nickname avatar')
      .populate('likes.user', 'username nickname avatar')
      .populate('comments.user', 'username nickname avatar');

    res.status(201).json({
      success: true,
      moment: populatedMoment
    });
  } catch (error) {
    console.error('发布朋友圈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取朋友圈列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // 获取好友列表
    const user = await require('../models/User').findById(req.user.userId);
    const friendIds = user.friends.map(friend => friend.toString());

    // 查询条件：公开的朋友圈或好友的朋友圈
    const query = {
      $or: [
        { isPublic: true },
        { author: { $in: friendIds } },
        { author: req.user.userId },
        { visibleTo: req.user.userId }
      ]
    };

    const moments = await Moment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username nickname avatar')
      .populate('likes.user', 'username nickname avatar')
      .populate('comments.user', 'username nickname avatar')
      .populate('comments.replyTo', 'username nickname');

    res.json({
      success: true,
      moments
    });
  } catch (error) {
    console.error('获取朋友圈列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户的朋友圈
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const moments = await Moment.find({
      author: userId,
      $or: [
        { isPublic: true },
        { author: req.user.userId },
        { visibleTo: req.user.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username nickname avatar')
      .populate('likes.user', 'username nickname avatar')
      .populate('comments.user', 'username nickname avatar')
      .populate('comments.replyTo', 'username nickname');

    res.json({
      success: true,
      moments
    });
  } catch (error) {
    console.error('获取用户朋友圈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 点赞朋友圈
router.post('/:momentId/like', authenticateToken, async (req, res) => {
  try {
    const { momentId } = req.params;

    const moment = await Moment.findById(momentId);
    if (!moment) {
      return res.status(404).json({
        success: false,
        message: '朋友圈不存在'
      });
    }

    // 检查是否已经点赞
    const existingLike = moment.likes.find(
      like => like.user.toString() === req.user.userId
    );

    if (existingLike) {
      // 取消点赞
      moment.likes = moment.likes.filter(
        like => like.user.toString() !== req.user.userId
      );
    } else {
      // 添加点赞
      moment.likes.push({ user: req.user.userId });
    }

    await moment.save();

    const updatedMoment = await Moment.findById(momentId)
      .populate('author', 'username nickname avatar')
      .populate('likes.user', 'username nickname avatar')
      .populate('comments.user', 'username nickname avatar')
      .populate('comments.replyTo', 'username nickname');

    res.json({
      success: true,
      moment: updatedMoment
    });
  } catch (error) {
    console.error('点赞朋友圈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 评论朋友圈
router.post('/:momentId/comment', authenticateToken, async (req, res) => {
  try {
    const { momentId } = req.params;
    const { content, replyTo } = req.body;

    const moment = await Moment.findById(momentId);
    if (!moment) {
      return res.status(404).json({
        success: false,
        message: '朋友圈不存在'
      });
    }

    const comment = {
      user: req.user.userId,
      content,
      replyTo: replyTo || null
    };

    moment.comments.push(comment);
    await moment.save();

    const updatedMoment = await Moment.findById(momentId)
      .populate('author', 'username nickname avatar')
      .populate('likes.user', 'username nickname avatar')
      .populate('comments.user', 'username nickname avatar')
      .populate('comments.replyTo', 'username nickname');

    res.json({
      success: true,
      moment: updatedMoment
    });
  } catch (error) {
    console.error('评论朋友圈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除朋友圈
router.delete('/:momentId', authenticateToken, async (req, res) => {
  try {
    const { momentId } = req.params;

    const moment = await Moment.findById(momentId);
    if (!moment) {
      return res.status(404).json({
        success: false,
        message: '朋友圈不存在'
      });
    }

    // 检查权限
    if (moment.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此朋友圈'
      });
    }

    await Moment.findByIdAndDelete(momentId);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除朋友圈错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 删除评论
router.delete('/:momentId/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const { momentId, commentId } = req.params;

    const moment = await Moment.findById(momentId);
    if (!moment) {
      return res.status(404).json({
        success: false,
        message: '朋友圈不存在'
      });
    }

    const comment = moment.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 检查权限
    if (comment.user.toString() !== req.user.userId && 
        moment.author.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此评论'
      });
    }

    comment.remove();
    await moment.save();

    const updatedMoment = await Moment.findById(momentId)
      .populate('author', 'username nickname avatar')
      .populate('likes.user', 'username nickname avatar')
      .populate('comments.user', 'username nickname avatar')
      .populate('comments.replyTo', 'username nickname');

    res.json({
      success: true,
      moment: updatedMoment
    });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router; 