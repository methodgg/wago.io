const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  content: {type: String, index: 'text'},
  title: {type: String, index: true},
  date: {type: Date, default: Date.now},
  _userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  format: {type: String, default: 'markdown'}
})

const Blog = mongoose.model('Blog', Schema)
module.exports = Blog