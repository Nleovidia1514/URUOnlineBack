var express = require('express');
var router = express.Router();

const authRoutes = require('./auth');
const postsRoutes = require('./posts');
const courseRoutes = require('./courses');
const attachmentRoutes = require('./attachment');
const examRoutes = require('./exam');

router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/courses', courseRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/exams', examRoutes);

module.exports = router;