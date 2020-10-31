// model Comment
const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({
  wagoID: { type: String, ref: 'WagoItem', index: true },
  authorID: { type: ObjectId, ref: 'Users', index: true},
  commentText: {type: String, index: 'text'},
  codeReview: {type: String, index: true, maxlength: 256},
  codeReviewFalsePositive: {type: Boolean},
  postDate: { type: Date, default: +new Date() },
  usersTagged: [{
    _id: false,
    userID: { type: ObjectId, ref: 'Users', index: true},
    read: {type: Boolean, default: false}
  }]
})

Schema.statics.findUnread = async function(userID) {
  const comments = await this.find({usersTagged: {$elemMatch: {userID: userID, read: false}}}).populate('wagoID').select('wagoID').exec()
  var unread = []
  comments.forEach(c => {
    if (c.wagoID && c.wagoID._id && !c.wagoID.deleted) {
      unread.push({_id: c._id, wagoID: c.wagoID._id})
    }
  })
  return unread
}

Schema.statics.findMentions = async function(userID, includeRead) {
  const comments = await this.find({"usersTagged.userID": userID}).select('wagoID usersTagged.$').exec()

  var mentions = []
  comments.forEach((mention) => {
    mention.usersTagged.forEach((tag) => {
      if (userID.equals(tag.userID) && (!tag.read || includeRead) && mentions.indexOf(mention.wagoID) < 0) {
        mentions.push(mention.wagoID)
      }
    })    
  })
  return mentions
}

const Comments = mongoose.model('Comments', Schema)
module.exports = Comments