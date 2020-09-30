const Vote = require('../models/Vote');
const mongoose = require('mongoose');
const Post = require('../models/Post');

module.exports = {
  addVote: async (req, res) => {
    if (!req.query.parentId) {
      return res.status(400).json({
        error: {
          message: 'Envie el id del padre del voto en los parametros.',
          status: 400,
          stack: 'addVote function',
        },
      });
    }

    let vote = await Vote.findOne({
      parentId: mongoose.Types.ObjectId(req.query.parentId),
      ownerId: mongoose.Types.ObjectId(req.user._id),
    });
    if (vote) {
      return res.status(400).json({
        error: {
          message: 'El usuario ya ha votado el post.',
          status: 400,
          stack: 'addVote function',
        },
      });
    }
    vote = new Vote();
    vote.parentId = req.query.parentId;
    vote.ownerId = req.user._id;

    vote
      .save()
      .then(() => Post.updateOne({ _id: mongoose.Types.ObjectId(req.query.parentId) }, {
        $inc: {
          votes: 1
        }
      }))
      .then(() =>
        res.status(200).json({
          message: 'Se ha votado correctamente.',
        })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'add vote to mongoDB [addVote]',
          },
        })
      );
  },

  removeVote: async (req, res) => {
    if (!req.query.parentId) {
      return res.status(400).json({
        error: {
          message: 'Envie el id del padre del voto en los parametros.',
          status: 400,
          stack: 'deleteVote function',
        },
      });
    }
    const vote = await Vote.findOne({
      parentId: mongoose.Types.ObjectId(req.query.parentId),
      ownerId: mongoose.Types.ObjectId(req.user._id),
    });
    if (!vote) {
      return res.status(404).json({
        error: {
          message: 'No se encontro un voto con los datos especificados.',
          status: 404,
          stack: 'deleteVote function',
        },
      });
    }
    vote.parentId = req.query.parentId;
    vote.ownerId = req.user._id;

    vote
      .deleteOne()
      .then(() => Post.updateOne({ _id: mongoose.Types.ObjectId(req.query.parentId) }, {
        $inc: {
          votes: -1
        }
      }))
      .then(() =>
        res.status(200).json({
          message: 'Se ha votado correctamente.',
        })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'delete vote from mongoDB [delete]',
          },
        })
      );
  },
};
