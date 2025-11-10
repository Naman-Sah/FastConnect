const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Global search endpoint
router.get('/', async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query || query.length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Case-insensitive regex
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // 1️⃣ Find users whose name matches
    const matchedUsers = await User.find({ name: { $regex: regex } }, '_id name');

    // Extract IDs for searching posts by author
    const userIds = matchedUsers.map(u => u._id);

    // 2️⃣ Find posts that match by title, tags, or author
    const matchedPosts = await Post.find({
      $or: [
        { title: { $regex: regex } },
        { tags: { $in: [query.toLowerCase()] } },
        { author: { $in: userIds } }
      ]
    })
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    // 3️⃣ Combine results
    res.json({
      query,
      total: matchedPosts.length,
      results: matchedPosts
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search', details: err.message });
  }
});

module.exports = router;
