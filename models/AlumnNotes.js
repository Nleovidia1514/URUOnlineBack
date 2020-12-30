const { Schema, model } = require('mongoose');

const alumnNotesSchema = new Schema({
  alumnId: {
    type: Schema.Types.ObjectId,
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
  noteId: {
    type: Schema.Types.ObjectId,
    required: true,
    minlength: 6,
    maxlength: 255,
    trim: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

module.exports = model('AlumnNotes', alumnNotesSchema);
