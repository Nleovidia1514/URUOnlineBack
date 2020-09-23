const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const mongoose = require('mongoose');

module.exports = {
  getPosts: (req, res) => {
    const { page } = req.query;
    if (!page) {
      return res.status(400).json({
        error: {
          message: 'Envie el numero de pagina en los parametros.',
          status: 400,
          stack: 'getPosts function',
        },
      });
    }
    const aggregateQuery = Post.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: "$owner"
      },
      {
        $project: {
          viewed: 1,
          createdDate: 1,
          tags: 1,
          title: 1,
          content: 1,
          'owner.profileImg': 1,
          'owner.name': 1,
          'owner.rating': 1,
        },
      },
    ]);

    Post.aggregatePaginate(
      aggregateQuery,
      { page, limit: 10 },
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            error: {
              message: err,
              status: 500,
              stack: 'getPosts function',
            },
          });
        }
        await new Promise(resolve => result.docs.forEach(async (post, index) => {
          post.comments = await Comment.countDocuments({ postId: mongoose.Types.ObjectId(post._id) })
          post.votes = await Vote.countDocuments({ parentId: mongoose.Types.ObjectId(post._id) })
          result.docs[index] = post;
          if (index === result.docs.length - 1) resolve(null);
        }))
        return res.status(200).json(result);
      }
    );
  },
  createPost: (req, res) => {
    const post = new Post({
      title: req.body.title,
      ownerId: req.user._id,
      content: req.body.content,
      tags: req.body.tags,
    });

    post
      .save()
      .then(() => {
        return res.status(201).json({
          message: 'El post ha sido creado con exito.',
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'save post to mongoDB [createPost]',
          },
        });
      });
  },
  updatePost: async (req, res) => {
    if (!req.body) {
      return res.status(400).json({
        error: {
          message: 'Envie el cuerpo del request correctamente.',
          status: 400,
          stack: 'updatePost function',
        },
      });
    }

    const post = await Post.findById(req.body._id);
    if (!post) {
      return res.status(404).json({
        error: {
          message: 'El post con el id especificado no existe.',
          status: 404,
          stack: 'deletePost function',
        },
      });
    }

    post
      .updateOne(req.body)
      .then(() => {
        return res.status(200).json({
          message: 'El post ha sido actualizado con exito.',
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'update post from mongoDB [updatePost]',
          },
        });
      });
  },
  deletePost: async (req, res) => {
    if (!req.query.postId) {
      return res.status(400).json({
        error: {
          message: 'Envie el id del post de pagina en los parametros.',
          status: 400,
          stack: 'deletePost function',
        },
      });
    }
    const post = await Post.findById(req.query.postId);
    if (!post) {
      return res.status(404).json({
        error: {
          message: 'El post con el id especificado no existe.',
          status: 404,
          stack: 'deletePost function',
        },
      });
    }
    post
      .deleteOne()
      .then(() => new Promise(async (resolve) => {
        const comments = await Comment.find({ postId: mongoose.Types.ObjectId(req.query.postId) });
        comments.forEach(async (com) => {
          await Vote.deleteMany({ parentId: mongoose.Types.ObjectId(com._id) })
        });
        resolve(null);
      }))
      .then(() => Vote.deleteMany({ parentId: mongoose.Types.ObjectId(req.query.postId) }))
      .then(() => {
        return res.status(200).json({
          message: 'El post ha sido eliminado con exito.',
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'delete post from mongoDB [deletePost]',
          },
        });
      });
  }
};
