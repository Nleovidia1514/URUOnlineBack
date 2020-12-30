const { Schema, model } = require('mongoose');

const deliveredAssignationsSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  comment: {
    type: String,
    required: false,
    default: '',
    maxlength: 1000,
  },
  assignation: {
    type: Schema.Types.ObjectId,
    ref: 'Assignations',
    required: true,
  },
  uploadedDate: {
    type: Date,
    required: false,
    default: new Date(),
  },
  attachments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Attachments',
      required: false,
    },
  ],
  grade: {
    type: Schema.Types.ObjectId,
    ref: 'AlumnGrades',
    reqired: false
  },
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'DeliveredExams',
    required: false
  }
});

module.exports = model('DeliveredAssignations', deliveredAssignationsSchema);
