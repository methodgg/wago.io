const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({
  // automatic _id
  UID: { type: ObjectId, ref: 'Persons', index: true},
  scopes: [String],
  expires: { type: Date, default: +new Date() + 90*24*60*60*1000 },
  forceUpdate: Boolean,
  requireLogin: Boolean,
  userAgent: String,
  IpAddress: [String]
}, {timestamps: true})

/**
 * Method UserSessions.requireUserUpdate(UID)
 * Flags all open sessions for given user to update account privileges immediately
 */ 
Schema.methods.requireUserUpdate = function(UID) {
  this.update({"UID": UID}, {forceUpdate: true}, {multi: true})
}

/**
 * Method UserSessions.addIpAddress(UID)
 * Adds IP address to user's session (to track session locations for mobile devices)
 */ 
Schema.methods.addIpAddress = function(SID, IpAddress) {
  this.update({"SID": SID}, {$addToSet: { IpAddress: IpAddress }})
}

const UserSessions = mongoose.model('UserSessions', Schema)
module.exports = UserSessions