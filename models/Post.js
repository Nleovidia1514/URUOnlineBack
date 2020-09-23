const { Schema, model } = require('mongoose');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
    minlength: 6,
    maxlength: 500,
    trim: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  viewed: {
    type: Number,
    required: false,
    default: 0
  },
  createdDate: {
    type: Date,
    required: false,
    default: new Date()
  },
  tags: {
    type: Array,
    required: true,
    default: [],
  }
});

postSchema.plugin(aggregatePaginate);

module.exports = model('Posts', postSchema);
