var express = require('express');
const examsController = require('../controllers/examsController');
var router = express.Router();

router
  .route('/')
  .post(examsController.createNewExam)
  .get(examsController.getExams)
  .put(examsController.addExamQuestion)
  .delete(examsController.deleteExam);

router
  .route('/delivered')
  .post(examsController.createDeliveredExam)
  .get(examsController.getDeliveredExam);

module.exports = router;
