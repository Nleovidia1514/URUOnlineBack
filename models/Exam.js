const { Schema, model } = require('mongoose');

const examSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Users',
  },
  questions: [
    {
      label: {
        type: String,
        maxlength: 1000,
        required: true,
      },
      type: {
        type: String,
        maxlength: 100,
        required: false,
        default: 'text',
      },
      options: [String],
      order: Number
    },
  ],
});

module.exports = model('Exams', examSchema);
