const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  identification: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 500
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  lastname: {
    type: String,
    required: false,
    trim: true,
    maxlength: 100
  },
  birthdate: {
    type: Date,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
  },
  type: {
    type: String,
    required: false,
    default: 'alumn'
  },
  phoneNumber: {
    type: String,
    required: true,
    maxlength: 100
  },
  isActive: {
      type: Boolean,
      required: false,
      default: true,
  },
  profileImg: {
    type: String,
    required: false,
    default: '',
  },
  mfa: {
    type: Boolean,
    required: false,
    default: false
  },
  githubLink: {
    type: String,
    required: false,
    default: ''
  }
});

module.exports = model('Users', userSchema);
