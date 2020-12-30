const { Schema, model } = require('mongoose');

const alumnGradeSchema = new Schema({
  alumn: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  grade: {
    type: Schema.Types.ObjectId,
    ref: 'Grades',
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

module.exports = model('AlumnGrades', alumnGradeSchema);