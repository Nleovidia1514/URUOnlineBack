const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const s3 = new aws.S3();
const path = require('path');

aws.config.update({
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  accessKeyId: process.env.S3_ACCESS_KEY,
  region: 'us-east-1',
});

config = {
  acl: 'public-read',
  s3,
  bucket: process.env.S3_BUCKET,
  metadata: function (req, file, cb) {
    cb(null, {
      'Content-Type': file.mimetype,
      originalname: file.originalname,
      encoding: file.encoding,
    });
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
};

module.exports = {
  profileImageUpload: multer({
    storage: multerS3({
      ...config,
      key: function (req, file, cb) {
        cb(
          null,
          'images/profile/' + req.user._id + path.extname(file.originalname)
        );
      },
    }),
  }).single('file'),
  courseImageUpload: multer({
    storage: multerS3({
      ...config,
      key: function (req, file, cb) {
        cb(
          null,
          'images/courses/' +
            req.query.courseName +
            path.extname(file.originalname)
        );
      },
    }),
  }).single('file'),
  attachmentUpload: multer({
    storage: multerS3({
      ...config,
      key: function (req, file, cb) {
        cb(
          null,
          `attachments/${
            file.originalname
          }-${new Date().getTime()}${path.extname(file.originalname)}`
        );
      },
    }),
  }).single('file'),
};
