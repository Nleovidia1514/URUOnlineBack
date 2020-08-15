const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  identification: {
    type: Number,
    required: true,
    unique: true,
    maxlength: 255
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
    lowercase: true,
    maxlength: 100
  },
  lastname: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
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
  isActive: {
      type: Boolean,
      required: false,
      default: true
  },
  profileImg: {
    type: String,
    default: '/img/profileDefault.jpg',
  },
});

module.exports = model('Users', userSchema);
