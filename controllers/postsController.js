const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const mongoose = require('mongoose');

module.exports = {
  getPosts: async (req, res) => {
    const { page, id, filter } = req.query;
    if (!page && !id) {
      return res.status(400).json({
        error: {
          message: 'Envie el numero de pagina o el id en los parametros.',
          status: 400,
          stack: 'getPosts function',
        },
      });
    }

    if (id) {
      let post = await Post.aggregate([
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
            _id: mongoose.Types.ObjectId(id),
          },
        },
        {
          $project: {
            viewed: 1,
            createdDate: 1,
            tags: 1,
            title: 1,
            content: 1,
            votes: 1,
            'owner.profileImg': 1,
            'owner.name': 1,
            'owner.rating': 1,
            'owner._id': 1,
          },
        },
      ]);
      if (post.length === 0) {
        return res.status(404).json({
          error: {
            message: 'El post con el id especificado no existe.',
            status: 404,
            stack: 'getPosts function',
          },
        });
      }
      post = post[0];
      if (req.user) {
        post.voted =
          (await Vote.findOne({
            parentId: mongoose.Types.ObjectId(post._id),
            ownerId: mongoose.Types.ObjectId(req.user._id),
          })) !== null;
      } else {
        post.voted = false;
      }
      return res.status(200).json(post);
    }
    let sorting = {};
    if (filter === 'rated') {
      sorting.votes = -1;
    } else if (filter === 'active') {
    }
    sorting.createdDate = -1;
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
        $sort: sorting,
      },
      {
        $unwind: '$owner',
      },
      {
        $project: {
          viewed: 1,
          createdDate: 1,
          tags: 1,
          votes: 1,
          title: 1,
          content: 1,
          'owner.profileImg': 1,
          'owner.name': 1,
          'owner.rating': 1,
          'owner._id': 1,
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
        const promises = result.docs.map(
          (post, index) =>
            new Promise(async (resolve) => {
              post.comments = await Comment.countDocuments({
                postId: mongoose.Types.ObjectId(post._id),
              });
              result.docs[index] = post;
              resolve();
            })
        );
        await Promise.all(promises);
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
        post.owner = {
          email: req.user.email,
          _id: req.user._id,
          name: req.user.name
        };
        post.votes = 0;
        post.voted = false;
        return res.status(201).json({
          post,
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
      .then(() => {
        new Promise(async (resolve) => {
          const comments = await Comment.find({
            postId: mongoose.Types.ObjectId(req.query.postId),
          });
          const promises = comments.map((com) =>
            Vote.deleteMany({ parentId: mongoose.Types.ObjectId(com._id) })
          );
          await Promise.all(promises);
          await Comment.deleteMany({
            postId: mongoose.Types.ObjectId(req.query.postId),
          });
          resolve();
        });
      })
      .then(() =>
        Vote.deleteMany({ parentId: mongoose.Types.ObjectId(req.query.postId) })
      )
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
  },
};
