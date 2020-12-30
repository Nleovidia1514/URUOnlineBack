const { Schema, model } = require('mongoose');

const courseSchema = new Schema({
  professor: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  period: {
    type: String,
    required: true,
    maxlength: 30,
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  feed: {
    type: [
      {
        owner: {
          type: Schema.Types.ObjectId,
          ref: 'Users',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdDate: {
          type: Date,
          required: false,
          default: new Date()
        }
      },
    ],
    required: false,
    default: []
  },
  backgroundImg: {
    type: String,
    required: false,
    maxlength: 255,
    default: '',
  },
});

module.exports = model('Courses', courseSchema);
