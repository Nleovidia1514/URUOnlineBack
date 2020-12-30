const { Schema, model } = require('mongoose');

const deliveredExamSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Users',
  },
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'Exams',
    required: true,
    maxlength: 255,
  },
  answers: [
    {
      question: {
        type: Number,
        required: true,
      },
      value: {
        type: String,
        required: true
      },
    },
  ],
});

module.exports = model('DeliveredExams', deliveredExamSchema);
