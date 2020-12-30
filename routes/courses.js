var express = require('express');
var router = express.Router();

const loggedIn = require('../middleware/loggedIn');

const coursesController = require('../controllers/coursesController');
const membersController = require('../controllers/membersController');
const assignationsController = require('../controllers/assignationsController');
const { courseImageUpload } = require('../middleware/multer');
const gradesController = require('../controllers/gradesController');

router
  .use(loggedIn)
  .route('')
  .get(coursesController.getCourseById)
  .post(coursesController.createCourse)
  .put(coursesController.updateCourse)
  .delete(coursesController.deleteCourse);

router.post(
  '/uploadCourseImg',
  loggedIn,
  courseImageUpload,
  coursesController.uploadCourseImg
);

router
  .use(loggedIn)
  .route('/members')
  .get(membersController.getCourseMembers)
  .post(membersController.addMemberToCourse)
  .delete(membersController.removeMemberFromCourse);

router
  .route('/assignations')
  .get(assignationsController.getCourseAssignations)
  .post(assignationsController.createAssignation)
  .delete(assignationsController.deleteAssignation);

router
  .route('/deliveredAssignations')
  .post(assignationsController.uploadDeliveredAssignation)
  .delete(assignationsController.deleteDeliveredAssignation);

router
  .route('/grades')
  .post(gradesController.createCourseGrade)
  .delete(gradesController.deleteCourseGrade)
  .get(gradesController.getCourseGrades);

router
  .route('/grades/alumn')
  .get(gradesController.getAlumnGrades)
  .post(gradesController.createAlumnGrade)
  .put(gradesController.updateAlumnGrade)
  .delete(gradesController.deleteAlumnGrades);

router.route('/grades/professor').get(gradesController.getAllAlumnGrades);

router.route('/attachments').get(coursesController.getAllCourseAttachments);

router.route('/feed').post(coursesController.createCourseFeed)

const alumnRouter = express.Router();
alumnRouter.get('/', coursesController.getCoursesByAlumn);
router.use('/alumn', loggedIn, alumnRouter);

const professorRouter = express.Router();
professorRouter.get('/', coursesController.getCoursesByProfessor);
router.use('/professor', loggedIn, professorRouter);

module.exports = router;
