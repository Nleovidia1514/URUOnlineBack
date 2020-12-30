const { Schema, model } = require('mongoose');

const assignationSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  attachments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Attachments',
      required: false,
    },
  ],
  delivered: [
    {
      type: Schema.Types.ObjectId,
      ref: 'DeliveredAssignations',
      required: false,
    },
  ],
  grade: {
    type: Schema.Types.ObjectId,
    ref: 'Grades',
    required: true,
  },
  exam: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'Exams',
  }
});

module.exports = model('Assignations', assignationSchema);
