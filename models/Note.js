const { Schema, model } = require('mongoose');

const noteSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
});

module.exports = model('Notes', noteSchema);
