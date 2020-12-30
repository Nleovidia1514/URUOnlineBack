const { roles } = require('../configuration/constants');
const Assignation = require('../models/Assignation');
const mongoose = require('mongoose');
const { deleteFile } = require('../utils/s3utils');
const DeliveredAssignation = require('../models/DeliveredAssignation');
const { sendMail } = require('../utils/mailer');
const CourseMember = require('../models/CourseMember');
const Course = require('../models/Course');
const moment = require('moment');

module.exports = {
  createAssignation: async (req, res) => {
    const { content, title, dueDate, course, grade, exam } = req.body;
    if (!content || !title || !dueDate || !course || !grade) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie el cuerpo adecuado.',
          status: 400,
          stack: 'createAssignation function',
        },
      });
    }

    const newAssignation = new Assignation({
      ...req.body,
      attachments: req.body.attachments.map((x) => mongoose.Types.ObjectId(x)),
      grade: mongoose.Types.ObjectId(grade),
    });

    if (!exam) {
      newAssignation.exam = null;
    }

    const courseMembers = await CourseMember.find({
      courseId: mongoose.Types.ObjectId(course),
    }).populate('alumn', 'email');

    const courseDoc = await Course.findById(course);
    newAssignation
      .save()
      .then(async (doc) => {
        await Assignation.populate(doc, {
          path: 'grade',
          model: 'Grades',
        });

        sendMail(
          courseMembers.map((x) => x.alumn.email).join('; '),
          courseDoc.name + ' - Nueva asignacion',
          `
          <p>El profesor de el curso ${
            courseDoc.name
          } ha creado una nueva asignacion</p>
          <h3>${title} - (${doc.grade.percentage}%)</h3>
          <p>${content}</p>
          <p>Fecha de entrega: ${moment(dueDate).format('DD/MM/YYYY')}</p>
          <span style="color: red;">Este correo se ha enviado desde una cuenta no monitoreada. Por favor no responder</span>
        `,
          () => res.status(200).json(doc)
        );
      })
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'save assignation to mongoDB [createAssignation]',
          },
        })
      );
  },

  getCourseAssignations: async (req, res) => {
    const { courseId, assignId } = req.query;
    let { filter } = req.query;
    if (!filter) filter = 'all';
    if (!courseId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'getCourseAssignations function',
        },
      });
    }
    let result;
    if (assignId) {
      result = await Assignation.findOne({
        course: courseId,
        _id: mongoose.Types.ObjectId(assignId),
      })
        .populate('attachments')
        .populate('grade')
        .populate('exam')
        .populate(
          filter === 'alumn'
            ? {
                path: 'delivered',
                match: {
                  owner: mongoose.Types.ObjectId(req.user._id),
                },
                populate: [
                  {
                    path: 'owner',
                    select:
                      '_id name lastname profileImg rating identification',
                    model: 'Users',
                  },
                  {
                    path: 'attachments',
                    model: 'Attachments',
                  },
                  {
                    path: 'grade',
                    model: 'AlumnGrades',
                  },
                  {
                    path: 'exam',
                    model: 'DeliveredExams'
                  }
                ],
              }
            : {
                path: 'delivered',
                populate: [
                  {
                    path: 'owner',
                    select:
                      '_id name lastname profileImg rating identification',
                    model: 'Users',
                  },
                  {
                    path: 'attachments',
                    model: 'Attachments',
                  },
                  {
                    path: 'grade',
                    model: 'AlumnGrades',
                  },
                  {
                    path: 'exam',
                    model: 'DeliveredExams'
                  }
                ],
              }
        );
    } else {
      result = await Assignation.find({ course: courseId });
    }
    return res.status(200).json(result);
  },

  updateAssignation: async (req, res) => {
    const { _id, content, title, course, dueDate, grade } = req.body;

    if (!_id || !content || !title || !course || !dueDate || !grade) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie el cuerpo adecuado.',
          status: 400,
          stack: 'updateAssignation function',
        },
      });
    }

    const assign = await Assignation.findById(req.body._id);
    if (!assign) {
      return res.status(404).json({
        error: {
          message: 'La asignacion con el id especificado no existe.',
          status: 404,
          stack: 'updateAssignation function',
        },
      });
    }

    if (
      String(assignation.course.professor) === String(req.user._id) ||
      req.user.role === roles.ADMIN
    ) {
      assign
        .updateOne(req.body)
        .then(() => {
          return res.status(200).json({
            message: 'La asignacion ha sido actualizado con exito.',
          });
        })
        .catch((err) => {
          res.status(500).json({
            error: {
              message: err.message,
              status: 500,
              stack: 'update assignation from mongoDB [updateAssignation]',
            },
          });
        });
    } else {
      return res.status(403).json({
        error: {
          message: 'El usuario no esta autorizado para realizar esta accion.',
          status: 403,
          stack: 'deleteAssignation function',
        },
      });
    }
  },

  deleteAssignation: async (req, res) => {
    const { assignationId } = req.query;

    if (!assignationId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'deleteAssignation function',
        },
      });
    }

    const assignation = await Assignation.findById(assignationId)
      .populate('course', 'professor')
      .populate('attachments');

    if (
      (assignation &&
        String(assignation.course.professor) === String(req.user._id)) ||
      req.user.role === roles.ADMIN
    ) {
      assignation.attachments.map((x) => {
        deleteFile(x.url);
      });
      assignation
        .deleteOne()
        .then(() =>
          res.status(200).json({
            message: 'El registro ha sido eliminado con exito',
          })
        )
        .catch((err) =>
          res.status(500).json({
            error: {
              message: err.message,
              status: 500,
              stack: 'delete assignation to mongoDB [deleteAssignation]',
            },
          })
        );
    } else if (!assignation) {
      return res.status(404).json({
        error: {
          message: 'La asignacion con el id especificado no existe.',
          status: 404,
          stack: 'deleteAssignation function',
        },
      });
    } else {
      return res.status(403).json({
        error: {
          message: 'El usuario no esta autorizado para realizar esta accion.',
          status: 403,
          stack: 'deleteAssignation function',
        },
      });
    }
  },

  uploadDeliveredAssignation: async (req, res) => {
    const { comment, attachments, assignation, exam } = req.body;

    if (!assignation || (!comment && attachments.length === 0)) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'uploadDeliveredAssignation function',
        },
      });
    }

    const exists = await DeliveredAssignation.findOne({
      owner: mongoose.Types.ObjectId(req.user._id),
      assignation: mongoose.Types.ObjectId(assignation),
    });

    if (exists) {
      return res.status(401).json({
        error: {
          message: 'Ya ha subido su respuesta a esta asignacion',
          status: 401,
          stack: 'uploadDeliveredAssignation function',
        },
      });
    }

    const newDelivered = new DeliveredAssignation({
      ...req.body,
      owner: mongoose.Types.ObjectId(req.user._id),
      attachments: req.body.attachments.map((x) => mongoose.Types.ObjectId(x)),
    });

    if (!exam) newDelivered.exam = null;

    newDelivered
      .save()
      .then(async (doc) => {
        await Assignation.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(req.body.assignation) },
          {
            $push: {
              delivered: doc._id,
            },
          }
        );
        await DeliveredAssignation.populate(doc, [
          {
            path: 'owner',
            model: 'Users',
            select: 'name _id profileImg lastname identification',
          },
          {
            path: 'attachments',
            model: 'Attachments',
          },
          {
            path: 'exam',
            model: 'DeliveredExams',
          },
        ]);
        res.status(200).json(doc);
      })
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack:
              'save delivered assignation to mongoDB [uploadDeliveredAssignation]',
          },
        })
      );
  },

  deleteDeliveredAssignation: async (req, res) => {
    const delivered = req.body;

    if (!delivered._id) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'deleteDeliveredAssignation function',
        },
      });
    }

    DeliveredAssignation.deleteOne({
      _id: mongoose.Types.ObjectId(delivered._id),
    })
      .then(async () => {
        await Assignation.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(delivered.assignation) },
          {
            $pull: { delivered: mongoose.Types.ObjectId(delivered._id) },
          }
        );
        res.status(200).json({
          message: 'Se ha eliminado el registro con exito.',
        });
      })
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack:
              'delete delivered assignation to mongoDB [deleteDeliveredAssignation]',
          },
        })
      );
  },
};
