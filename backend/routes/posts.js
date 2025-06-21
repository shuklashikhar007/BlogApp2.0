const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author', 'email').sort({ createdAt: -1 });
  res.json(posts);
});

// Get single post
router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'email');
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json(post);
});

// Create post (auth)
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  const post = new Post({ title, content, author: req.user._id });
  await post.save();
  res.status(201).json(post);
});

// Update post (auth)
router.put('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  post.title = req.body.title;
  post.content = req.body.content;
  await post.save();
  res.json(post);
});

// Delete post (auth)
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  await post.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
