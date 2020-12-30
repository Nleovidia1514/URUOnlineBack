const { Schema, model } = require('mongoose');

const gradeSchema = new Schema({
  percentage: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
  },
});

module.exports = model('Grades', gradeSchema);
