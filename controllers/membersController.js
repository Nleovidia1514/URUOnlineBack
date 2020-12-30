const mongoose = require('mongoose');

const Course = require('../models/Course');
const CourseMember = require('../models/CourseMember');
const User = require('../models/User');

module.exports = {
  getCourseMembers: async (req, res) => {},

  addMemberToCourse: async (req, res) => {
    const { alumnId, courseId } = req.query;
    if (!alumnId || !courseId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'addMember function',
        },
      });
    }

    const exists = await User.findById(alumnId);

    if (!exists) {
      return res.status(404).json({
        error: {
          message: 'No existe un usuario con el id enviado.',
          status: 404,
          stack: 'addMember function',
        },
      });
    }

    const newMember = new CourseMember({
      courseId: mongoose.Types.ObjectId(courseId),
      alumn: mongoose.Types.ObjectId(alumnId),
    });

    newMember
      .save()
      .then(() => {
        return res.status(200).json({
          message: 'Se ha agregado un alumno al curso con exito.',
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'add member to mongoDB [addMemberToCourse]',
          },
        });
      });
  },
  removeMemberFromCourse: async (req, res) => {
    const { alumnId, courseId } = req.query;
    if (!alumnId || !courseId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'removeMember function',
        },
      });
    }

    const exists = await User.findById(alumnId);

    if (!exists) {
      return res.status(404).json({
        error: {
          message: 'No existe un usuario con el id enviado.',
          status: 404,
          stack: 'removeMember function',
        },
      });
    }

    const oldMember = await CourseMember.findOne({
      courseId: mongoose.Types.ObjectId(courseId),
      alumn: mongoose.Types.ObjectId(alumnId),
    });

    if (!oldMember) {
      return res.status(400).json({
        error: {
          message: 'El usuario no pertenece al curso.',
          status: 400,
          stack: 'removeMember function',
        },
      });
    }

    oldMember
      .deleteOne()
      .then(() =>
        res.status(200).json({
          message: 'Se ha quitado el alumno del curso con exito..',
        })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'remove member from mongoDB [removeMemberFromCourse]',
          },
        })
      );
  },
};
