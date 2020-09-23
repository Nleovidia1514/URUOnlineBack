var express = require('express');
var router = express.Router();

const loggedIn = require('../middleware/loggedIn');

const postsController = require('../controllers/postsController');
const commentsController = require('../controllers/commentsController');
const votesController = require('../controllers/votesController');

router
  .route('')
  .get(postsController.getPosts)
  .post(loggedIn, postsController.createPost)
  .put(loggedIn, postsController.updatePost)
  .delete(loggedIn, postsController.deletePost);

router
  .route('/vote')
  .post(loggedIn, votesController.addVote)
  .delete(loggedIn, votesController.removeVote);

router
  .route('/comments')
  .get(commentsController.getComments)
  .post(loggedIn, commentsController.addComment)
  .delete(loggedIn, commentsController.deleteComment);

module.exports = router;
