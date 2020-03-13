const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId
const localeEnum = ['frFR', 'deDE', 'enGB', 'enUS', 'itIT', 'koKR', 'zhCN', 'zhTW', 'ruRU', 'esES', 'esMX', 'ptBR']

const Schema = new mongoose.Schema({
  wagoID: {type: String, index: true},
  locale: {type: String, index: true, enum: localeEnum },
  key : {type: String, index: true},
  term : String,
  active: {type: Boolean, index: true},
  submissions : [{
    user:  { type: ObjectId, ref: 'Users', index: true},
    term: String,
    fuzzy: Date,
    date: Date,
    accepted: Boolean}]
})

Schema.statics.getTranslations = async function(wagoID) {
  var terms = {}
  var keys = await this.find({wagoID: wagoID, active: true}).distinct('key').exec()
  if (!keys.length) return false
  keys = keys.slice(0, 100)
  
  var t = await this.find({wagoID: wagoID, key: keys}).populate("submissions.user").exec()
  t.forEach(t => {
    if (t.active) {
      terms[t.locale] = terms[t.locale] || {}
      var submissions = []
      t.submissions.forEach(sub => {
        submissions.push({name: sub.user.account.username, roleclass: sub.user.roleclass, locale: sub.locale, date: sub.date, accepted: sub.accepted })
      })
      submissions.sort((a, b) => {
        if (a.date > b.sort) return 1
        if (a.date < b.sort) return -1
        return 0
      })
      terms[t.locale][t.key] = {term: t.term, submissions: submissions}
    }
  })

  // fill in empty missing term structure
  localeEnum.forEach(loc => {
    terms[loc] = terms[loc] || {}
    keys.forEach(k => {
      terms[loc][k] = terms[loc][k] || {}
    })
  })
  return terms
}

Schema.statics.setTranslation = async function (wagoID, locale, key, term, approveUser) {
  var t = await this.findOne({wagoID: wagoID, locale: locale, key: key}).exec()
  if (!t) {
    return this.newTranslation(wagoID, locale, key, term)
  }
  else if (approveUser) {
    t.term = term
    for (let i = 0; i < t.submissions.length; i++) {
      if (t.submissions[i].user.equals(approveUser)) {
        t.submissions[i].accepted = true
      }
    }
    await t.save()
  }
  else if (t.term !== term) {
    t.term = term
    for (let i = 0; i < t.submissions.length; i++) {
      t.submissions[i].fuzzy = new Date()
    }
    await t.save()
  }
}

Schema.statics.newTranslation = async function (wagoID, locale, key, term) {
  await this.create({wagoID: wagoID, locale: locale, key: key, term: term, active: true})
}

const Translations = mongoose.model('WagoTranslations', Schema)
module.exports = Translations