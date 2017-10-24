const mongoose = require('mongoose')
const shortid = require('shortid')

const Schema = new mongoose.Schema({
  _id: { type: String, default: shortid.generate },
  content: {type: String, index: 'text'},
  title: {type: String, index: true},
  date: {type: Date, default: Date.now},
  publishStatus: String,
  _userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  format: {type: String, default: 'markdown'}
})

const Blog = mongoose.model('Blog', Schema)
module.exports = Blog