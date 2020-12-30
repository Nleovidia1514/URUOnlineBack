const { Schema, model } = require('mongoose');

const commentSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    maxlength: 100,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    minlength: 6,
    maxlength: 500,
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  createdDate: {
    type: Date,
    required: false,
    default: new Date()
  }
});


module.exports = model('Comments', commentSchema);
