const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  content: String,
  title: String,
  date: {type: Date, default: Date.now},
  _userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  format: {type: String, default: 'markdown'}
})

const Blog = mongoose.model('Blog', Schema)
module.exports = Blog