const { Schema, model } = require('mongoose');

const courseMemberSchema = new Schema({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
  alumn: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
});

module.exports = model('CourseMembers', courseMemberSchema);
