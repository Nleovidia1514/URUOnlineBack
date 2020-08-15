const { Schema, model } = require('mongoose');

const resetCodeSchema = new Schema({
  created: {
    type: Number,
    required: false,
    default: Date.now(),
  },
  expiresIn: {
    type: Number,
    required: false,
    default: 300000,
  },
  email: {
    type: String,
    required: true,
    maxlength: 100,
  },
  code: {
    type: String,
    required: true,
    maxlength: 5,
    minlength: 5,
  },
});

module.exports = model('ResetCodes', resetCodeSchema);
