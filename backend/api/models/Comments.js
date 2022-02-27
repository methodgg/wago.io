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
  }],
  _indexComment: Boolean
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

Schema.virtual('indexedCommentData').get(async function () {
  if (!this.commentText) {
    console.log('no text')
    return {
      id: this._id,
      deleted: true
    }
  }
  const data = {
    id: this._id,
    text: this.commentText,
    timestamp: Math.round(this.postDate.getTime() / 1000),
    taggedIDs: this.usersTagged.map(x => x.userID.toString())
  }

  await this.populate('wagoID').execPopulate()
  if (this.wagoID && this.wagoID._id) {
    data.importID = this.wagoID._id.toString()
    data.importName = this.wagoID.name
    data.hidden = this.wagoID.visibility !== 'Public'
  }
  else {
    return {
      id: this._id,
      deleted: true
    }
  }

  await this.populate('authorID').execPopulate()
  if (this.authorID && this.authorID._id) {
    data.userId = this.authorID._id.toString()
    data.userName = this.authorID.account.username
    let avatar = await this.authorID.avatarURL
    data.userAvatar = avatar.webp || avatar.gif || avatar.png || avatar.jpg
    data.userClass = this.authorID.roleclass
    data.userLinked = !this.authorID.account.hidden
  }
  else {
    return {
      id: this._id,
      deleted: true
    }
  }

  return data
})

async function updateIndexes() {
  if (this.commentText) {
    await elastic.addDoc('comment', await this.indexedCommentData)
    this._indexComment = true
  }
  else if (this._indexImport) {
    this._indexComment = false
    await elastic.removeDoc('comment', this._id)
  }
}

Schema.pre('save', updateIndexes)
Schema.pre('update', updateIndexes)
Schema.pre('remove', updateIndexes)

const Comments = mongoose.model('Comments', Schema)
module.exports = Comments