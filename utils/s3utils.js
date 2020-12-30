const aws = require('aws-sdk');

const s3 = new aws.S3();

module.exports = {
  deleteFile: async (url, cb = null) => {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: url.replace(process.env.S3_HOST, ''),
    };
    console.log('hola')
    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);
      // an error occurred
      else {
        console.log(data);
        cb && cb(data);
      } // successful response
    });
  },
};
