const Types = require('mongoose').Types;
const Grade = require('../models/Grade');
const CourseMember = require('../models/CourseMember');
const AlumnGrade = require('../models/AlumnGrade');
const Assignation = require('../models/Assignation');
const DeliveredAssignation = require('../models/DeliveredAssignation');
const { sendMail } = require('../utils/mailer');

module.exports = {
  createCourseGrade: async (req, res) => {
    const { percentage, name, course } = req.body;

    if (!percentage || !name || !course) {
      return res.status(400).json({
        error: {
          message: 'No se ha enviado el cuerpo correctamente.',
          status: 400,
          stack: 'createCourseGrade function',
        },
      });
    }

    const allGrades = await Grade.find({ course: Types.ObjectId(course) });
    if (
      allGrades.reduce((prev, curr) => prev + curr.percentage, 0) +
        parseInt(percentage) >
      100
    ) {
      return res.status(400).json({
        error: {
          message: 'El porcentaje supera el 100%.',
          status: 400,
          stack: 'createCourseGrade function',
        },
      });
    }

    new Grade({
      ...req.body,
      course: Types.ObjectId(course),
    })
      .save()
      .then(async (grade) => {
        return res.status(201).json({
          message: 'La nota ha sido creada con exito.',
          grade,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'save grade to mongoDB [createCourseGrade]',
          },
        });
      });
  },

  deleteCourseGrade: async (req, res) => {
    const { gradeId } = req.query;

    if (!gradeId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'deleteCourseGrade function',
        },
      });
    }

    Grade.findOneAndDelete({ _id: Types.ObjectId(gradeId) })
      .then(() => {
        return res.status(200).json({
          message: 'La nota ha sido eliminada con exito.',
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'delete grade to mongoDB [deleteCourseGrade]',
          },
        });
      });
  },

  getCourseGrades: async (req, res) => {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'getCourseGrades function',
        },
      });
    }

    const grades = await Grade.find({ course: Types.ObjectId(courseId) });

    return res.status(200).json(grades);
  },

  createAlumnGrade: async (req, res) => {
    const { grade, alumn, value } = req.body;

    if (!grade || !alumn || !value) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie el cuerpo adecuado.',
          status: 400,
          stack: 'addAlumnGrade function',
        },
      });
    }

    const gradeRegistry = await Grade.findById(grade).select('course');
    const member = await CourseMember.findOne({
      courseId: Types.ObjectId(gradeRegistry.course),
      alumn: Types.ObjectId(alumn),
    })
      .populate('alumn', 'email')
      .populate('courseId', 'name');

    if (!member) {
      return res.status(400).json({
        error: {
          message: 'El alumno no pertenece al curso.',
          status: 400,
          stack: 'addAlumnGrade function',
        },
      });
    }

    new AlumnGrade({
      ...req.body,
      grade: Types.ObjectId(grade),
      alumn: Types.ObjectId(alumn),
    })
      .save()
      .then(async (gradeDoc) => {
        const assign = await Assignation.findOne({
          grade: Types.ObjectId(grade),
        });
        await DeliveredAssignation.findOneAndUpdate(
          {
            assignation: Types.ObjectId(assign._id),
            owner: Types.ObjectId(alumn),
          },
          {
            grade: Types.ObjectId(gradeDoc._id),
          }
        );

        sendMail(
          member.alumn.email,
          `Nota subida - ${assign.title}`,
          `
          <p>El profesor del curso ${member.courseId.name} ha subido la nota de la asignacion ${assign.title}:</p>
          <h2>Nota: </h2>
          <h2>${value}</h2>
          <span style="color: red;">Este correo se ha enviado desde una cuenta no monitoreada. Por favor no responder</span>
        `,
          () =>
            res.status(201).json({
              message: 'La nota ha sido creada con exito.',
              gradeDoc,
            })
        );
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'save alumn grade to mongoDB [createAlumnGrade]',
          },
        });
      });
  },

  getAllAlumnGrades: async (req, res) => {
    const { courseId } = req.query;
    const courseGrades = await Grade.find({ course: Types.ObjectId(courseId) });

    const courseMembers = await CourseMember.find({
      courseId: Types.ObjectId(courseId),
    }).populate('alumn', '_id name lastname profileImg identification');

    const result = [];

    const promises = courseMembers.map((member) => {
      return new Promise(async (resolve) => {
        const grades = await AlumnGrade.find({
          alumn: Types.ObjectId(member.alumn._id),
          $or: courseGrades.map((x) => ({ grade: Types.ObjectId(x._id) })),
        });

        const gradesObject = {};

        courseGrades.map((grade) => {
          const alumnGrade = grades.find(
            (x) => String(x.grade) === String(grade._id)
          );

          gradesObject[grade.name] = alumnGrade ? alumnGrade.value : 'N/A';
        });

        result.push({
          alumn: member.alumn,
          grades: gradesObject,
        });

        resolve();
      });
    });

    await Promise.all(promises);

    return res.status(200).json(result);
  },

  getAlumnGrades: async (req, res) => {
    const { alumnId, courseId } = req.query;
    let filter = req.query.filter;

    if (!alumnId || !courseId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'getAlumnGrades function',
        },
      });
    }

    if (!filter) filter = 'all';

    const courseGrades = await Grade.find({ course: Types.ObjectId(courseId) });

    const alumnGrades = await AlumnGrade.find({
      $and: [
        {
          alumn: Types.ObjectId(alumnId),
        },
        {
          $or: courseGrades.map((x) => ({ grade: Types.ObjectId(x._id) })),
        },
      ],
    });

    const result = courseGrades.map((x) => {
      const alumnGrade = alumnGrades.find(
        (a) => String(a.grade) === String(x._id)
      );
      return {
        _id: x._id,
        grade: x,
        alumn: alumnId,
        state: alumnGrade ? 'Realizado' : 'Pendiente',
        value: alumnGrade ? alumnGrade.value : 'N/A',
      };
    });

    return res.status(200).json(result);
  },

  updateAlumnGrade: async (req, res) => {
    const { gradeId, alumnId } = req.query;

    if (!gradeId || !alumnId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'updateAlumnGrade function',
        },
      });
    }

    const doc = await AlumnGrade.findOneAndUpdate(
      {
        grade: Types.ObjectId(gradeId),
        alumn: Types.ObjectId(alumnId),
      },
      { value: req.body.value },
      { new: true }
    ).populate('alumn', 'email').populate({
      path: 'grade',
      select: 'course name',
      populate: {
        path: 'course',
        models: 'Courses',
        select: 'name'
      }
    });

    sendMail(
      doc.alumn.email,
      doc.grade.course.name + ' - Nueva asignacion',
      `
      <p>El profesor del curso ${doc.grade.course.name} ha actualizado la nota correspondiente a ${doc.grade.name}:</p>
      <h2>Nueva nota:</h2>
      <h2>${doc.value}</h2>
      <span style="color: red;">Este correo se ha enviado desde una cuenta no monitoreada. Por favor no responder</span>
    `,
      () => res.status(200).json(doc)
    );
  },

  deleteAlumnGrades: async (req, res) => {
    const { gradeId } = req.query;

    if (!gradeId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'deleteAlumnGrades function',
        },
      });
    }

    AlumnGrade.findOneAndDelete({ _id: Types.ObjectId(gradeId) })
      .then(() => {
        return res.status(200).json({
          message: 'La nota ha sido eliminada con exito.',
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'delete alumn grade to mongoDB [deleteAlumnGrades]',
          },
        });
      });
  },
};
