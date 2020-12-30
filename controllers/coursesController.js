const mongoose = require('mongoose');
const Assignation = require('../models/Assignation');
const Course = require('../models/Course');
const CourseMember = require('../models/CourseMember');

module.exports = {
  getCourseById: async (req, res) => {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie los parametros adecuados.',
          status: 400,
          stack: 'addMember function',
        },
      });
    }

    const course = {
      ...(
        await Course.findById(courseId)
          .populate('professor', 'profileImg name lastname rating _id')
          .populate('feed.owner', '_id profileImg name lastname identification rating')
      )._doc,
    };

    const members = await CourseMember.find({
      courseId: mongoose.Types.ObjectId(courseId),
    }).populate('alumn', 'profileImg rating name lastname _id');

    course.alumns = members.map((x) => x.alumn);

    return res.status(200).json(course);
  },
  getCoursesByProfessor: async (req, res) => {
    const { period } = req.query;

    if (!period) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie el periodo en los parametros.',
          status: 400,
          stack: 'getCoursesByProfessor function',
        },
      });
    }

    const result = await Course.find({
      professor: mongoose.Types.ObjectId(req.user._id),
      period,
    }).populate('professor', 'name lastname');

    return res.status(200).json(result);
  },
  getCoursesByAlumn: async (req, res) => {
    const { period } = req.query;

    if (!period) {
      return res.status(400).json({
        error: {
          message: 'Por favor envie el periodo en los parametros.',
          status: 400,
          stack: 'getCoursesByAlumn function',
        },
      });
    }

    const courses = await CourseMember.find({
      alumn: mongoose.Types.ObjectId(req.user._id),
    });
    const result = await Course.find({
      _id: courses.map((x) => mongoose.Types.ObjectId(x.courseId)),
      period,
    }).populate('professor', '_id name lastname identification profileImg');

    console.log(result);

    return res.status(200).json(result);
  },
  createCourse: async (req, res) => {
    const { capacity, period, name } = req.body;

    if (!capacity || !period || !name) {
      return res.status(400).json({
        error: {
          message: 'No se ha enviado el cuerpo correctamente.',
          status: 400,
          stack: 'createCourse function',
        },
      });
    }

    const exists = await Course.find({ period, name }).findOne();

    if (exists) {
      return res.status(401).json({
        error: {
          message:
            'Ya existe un curso con el mismo nombre en el periodo especificado.',
          status: 401,
          stack: 'createCourse function',
        },
      });
    }

    const newCourse = new Course({
      ...req.body,
      professor: req.user._id,
    });

    newCourse
      .save()
      .then(async (course) => {
        await Course.populate(course, { path: 'professor' });
        return res.status(201).json({
          message: 'El curso ha sido creado con exito.',
          course,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'save course to mongoDB [createCourse]',
          },
        });
      });
  },

  uploadCourseImg: (req, res) => {
    return res.status(200).json({
      url: req.file.location,
    });
  },
  deleteCourse: async (req, res) => {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        error: {
          message: 'Envie el id del curso en los parametros.',
          status: 400,
          stack: 'deleteCourse function',
        },
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        error: {
          message: 'No existe un curso con el id especificado.',
          status: 404,
          stack: 'deleteCourse function',
        },
      });
    }

    course
      .deleteOne()
      .then(() => {
        return res.status(200).json({
          message: 'El curso ha sido eliminado con exito.',
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'delete course from mongoDB [deleteCourse]',
          },
        });
      });
  },
  updateCourse: async (req, res) => {
    const { _id, capacity, name, period } = req.body;

    if (!_id || !capacity || !name || !period) {
      return res.status(400).json({
        error: {
          message: 'No se ha enviado el cuerpo correctamente.',
          status: 400,
          stack: 'updateCourse function',
        },
      });
    }

    const course = await Course.findById(_id);

    if (!course) {
      return res.status(404).json({
        error: {
          message: 'No existe un curso con el id especificado.',
          status: 404,
          stack: 'updateCourse function',
        },
      });
    }

    course
      .updateOne(req.body)
      .then(() => {
        return res.status(200).json({
          message: 'El curso ha sido actualizado con exito.',
        });
      })
      .catch((err) => {
        return res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'update course from mongoDB [updateCourse]',
          },
        });
      });
  },

  getAllCourseAttachments: async (req, res) => {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({
        error: {
          message: 'Envie el id del curso en los parametros.',
          status: 400,
          stack: 'getAllCourseAttachments function',
        },
      });
    }

    const assignments = await Assignation.find({
      course: mongoose.Types.ObjectId(courseId),
    }).populate('attachments');

    const allAttachments = assignments.reduce(
      (prev, curr) => prev.concat(curr.attachments),
      []
    );

    return res.status(200).json(allAttachments);
  },

  createCourseFeed: async (req, res) => {
    const { course, content } = req.body;

    if (!course || !content) {
      return res.status(400).json({
        error: {
          message: 'Envie el cuerpo adecuado.',
          status: 400,
          stack: 'createCourseFeed function',
        },
      });
    }

    await Course.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(course) },
      {
        $push: {
          feed: {
            owner: mongoose.Types.ObjectId(req.user._id),
            content,
          },
        },
      },
      { new: true }
    )
      .then(async (doc) => {
        await Course.populate(doc, {
          path: 'feed',
          populate: {
            path: 'owner',
            model: 'Users',
            select: 'profileImg _id name lastname rating identification',
          },
        });
        res.status(200).json(doc.feed);
      })
      .catch((err) =>
        res.status(500).json({
          error: {
            message: err.message,
            status: 500,
            stack: 'createCourseFeed function',
          },
        })
      );
  },
};
