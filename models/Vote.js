const { Schema, model } = require('mongoose');

const votesSchema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    required: true,
    minlength: 6,
    maxlength: 500,
    trim: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
    minlength: 6,
    maxlength: 500,
    trim: true,
  },
});

module.exports = model('Votes', votesSchema);
