const { Schema, model } = require('mongoose');

const attachmentSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255,
  },
  extension: {
    type: String,
    required: true,
    maxlength: 10,
  },
  url: {
    type: String,
    required: true,
    maxlength: 255,
  },
  contentType: {
    type: String,
    required: true,
    maxlength: 50,
  },
});

module.exports = model('Attachments', attachmentSchema);
