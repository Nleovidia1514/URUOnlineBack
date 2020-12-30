var express = require('express');
var router = express.Router();
const attachmentsController = require('../controllers/attachmentsController');
const loggedIn = require('../middleware/loggedIn');
const { attachmentUpload } = require('../middleware/multer');

router
  .use(loggedIn)
  .route('/upload')
  .post(
    attachmentUpload,
    attachmentsController.createAttachment
  );

router.delete('/', loggedIn, attachmentsController.deleteAttachment)

module.exports = router;
