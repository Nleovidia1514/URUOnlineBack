const Exam = require('../models/Exam');
const DeliveredExam = require('../models/DeliveredExam');
const Types = require('mongoose').Types;

module.exports = {
  createNewExam: (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: {
          message: 'No se envio el cuerpo adecuado.',
          status: 400,
          stack: 'createNewExam function',
        },
      });
    }

    if (req.user.type !== 'professor') {
      return res.status(401).json({
        error: {
          message: 'El usuario no puede crear examenes.',
          status: 401,
          stack: 'createNewExam function',
        },
      });
    }

    new Exam({
      ...req.body,
      creator: req.user._id,
      questions: [],
    })
      .save()
      .then((exam) =>
        res.status(200).json({
          message: 'Se ha creado el examen con exito.',
          exam,
        })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'createNewExam function',
          },
        })
      );
  },

  deleteExam: async (req, res) => {
    const examId = req.body.examId;

    const exam = await Exam.findOne({
      creator: Types.ObjectId(req.user._id),
      _id: Types.ObjectId(examId),
    });

    if (!exam) {
      return res.status(404).json({
        error: {
          message: 'No se pudo eliminar el examen.',
          status: 404,
          stack: 'deleteExam function',
        },
      });
    }

    exam
      .deleteOne()
      .then(() =>
        res
          .status(200)
          .json({ message: 'El examen ha sido eliminado con exito.' })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'deleteExam function',
          },
        })
      );
  },

  getExams: async (req, res) => {
    let result;
    if (req.query.id !== 'undefined') {
      result = await Exam.findOne({
        creator: Types.ObjectId(req.user._id),
        _id: Types.ObjectId(req.query.id),
      });
    } else {
      result = await Exam.find({ creator: Types.ObjectId(req.user._id) });
    }

    return res.status(200).json(result);
  },

  deleteExamQuestion: (req, res) => {
    const { exam, questionLabel } = req.body;
    Exam.findOneAndUpdate(
      { _id: Types.ObjectId(exam) },
      {
        $pull: { questions: { label: questionLabel } },
      },
      { new: true }
    )
      .then((exam) =>
        res.status(200).json({
          message: 'Pregunta removida con exito.',
          exam,
        })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'deleteExamQuestion function',
          },
        })
      );
  },

  addExamQuestion: (req, res) => {
    const { label, type, options, order, exam } = req.body;

    if (!label || !type || !options || !exam) {
      return res.status(400).json({
        error: {
          message: 'No se envio el cuerpo adecuado.',
          status: 400,
          stack: 'addExamQuestion function',
        },
      });
    }

    Exam.findOneAndUpdate(
      { _id: Types.ObjectId(exam) },
      {
        $push: {
          questions: {
            label,
            type,
            options,
            order,
          },
        },
      },
      { new: true }
    )
      .then((exam) =>
        res.status(200).json({
          message: 'Pregunta agregada con exito.',
          exam,
        })
      )
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'addExamQuestion function',
          },
        })
      );
  },

  createDeliveredExam: async (req, res) => {
    const { exam, answers } = req.body;

    if (!exam || answers.length === 0) {
      return res.status(400).json({
        error: {
          message: 'No se envio el cuerpo adecuado.',
          status: 400,
          stack: 'createDeliveredExam function',
        },
      });
    }

    new DeliveredExam({
      ...req.body,
      owner: Types.ObjectId(req.user._id),
    })
      .save()
      .then((doc) => res.status(200).json(doc))
      .catch((err) =>
        res.satus(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'save exam to mongodb [createDeliveredExam]',
          },
        })
      );
  },

  getDeliveredExam: async (req, res) => {
    const { exam, owner } = req.body;

    if (!owner || !exam) {
      return res.status(400).json({
        error: {
          message: 'No se envio el cuerpo adecuado.',
          status: 400,
          stack: 'getDeliveredExam function',
        },
      });
    }

    const result = await DeliveredExam.findOne({
      owner: Types.ObjectId(owner),
      exam: Types.ObjectId(exam),
    });

    if (!result) {
      return res.status(404).json({
        error: {
          message: 'No se encontro el examen.',
          status: 404,
          stack: 'getDeliveredExam function',
        },
      });
    }

    return res.status(200).json(result);
  },
};
