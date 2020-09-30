const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Vote = require('../models/Vote');

module.exports = {
  addComment: async (req, res) => {
    const post = await Post.findById(req.body.postId);
    if (!post) {
      return res.status(404).json({
        error: {
          message: 'El Post del comentario no existe.',
          status: 404,
          stack: 'addComment function',
        },
      });
    }

    const comment = new Comment(req.body);
    comment.ownerId = req.user._id;
    comment
      .save()
      .then(() => {
        return res.status(201).json({
          error: {
            message: 'El comentario ha sido creado con exito.',
          },
        });
      })
      .catch((err) => {
        return res.status(400).json({
          error: {
            message: err.message,
            status: 400,
            stack: 'addComment function',
          },
        });
      });
  },
  deleteComment: async (req, res) => {
    if (!req.query.commentId) {
      return res.status(400).json({
        error: {
          message: 'Envie el id del comentario en los parametros.',
          status: 400,
          stack: 'deleteComment function',
        },
      });
    }
    const exists = await Comment.findById(req.query.commentId);
    if (!exists) {
      return res.status(404).json({
        error: {
          message: 'El comentario con el id enviado no existo.',
          status: 404,
          stack: 'deleteComment function',
        },
      });
    }
    Comment.findByIdAndDelete(req.query.commentId)
      .then((data) => {
        return res.status(200).json({
          error: {
            message: 'El comentario ha sido eliminado con exito.',
          },
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'deleteComment function',
          },
        });
      });
  },
  updateComment: async (req, res) => {
    Comment.findByIdAndUpdate(req.body._id, req.body)
      .then((data) => {
        return res.status(200).json({
          error: {
            message: 'El comentario ha sido actualizado con exito.',
          },
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'updateComment function',
          },
        });
      });
  },
  getComments: async (req, res) => {
    if (!req.query.postId) {
      return res.status(400).json({
        error: {
          message: 'Envie el id del comentario en los parametros.',
          status: 400,
          stack: 'getComments function',
        },
      });
    }
    const exists = await Post.findById(req.query.postId);
    if (!exists) {
      return res.status(404).json({
        error: {
          message: 'No se pudo encontrar el post con el id enviado.',
          status: 404,
          stack: 'getComments function',
        },
      });
    }
    const comments = await Comment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: '$owner',
      },
      {
        $match: {
          postId: mongoose.Types.ObjectId(req.query.postId),
        },
      },
      {
        $project: {
          content: 1,
          createdDate: 1,
          'owner.profileImg': 1,
          'owner.name': 1,
          'owner.rating': 1,
        },
      },
    ]);
    const promises = comments.map(
      (comment, index) =>
        new Promise(async (resolve) => {
          comment.votes = await Vote.countDocuments({
            parentId: mongoose.Types.ObjectId(comment._id),
          });
          if (req.user) {
            comment.voted = await Vote.findOne({
              parentId: mongoose.Types.ObjectId(comment._id),
              ownerId: mongoose.Types.ObjectId(req.user._id),
            });
          } else {
            comment.voted = false;
          }
          comments[index] = comment;
          resolve();
        })
    );
    await Promise.all(promises);
    return res.status(200).json(comments);
  },
};
