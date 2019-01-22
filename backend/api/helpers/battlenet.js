const config = require('../../config')
const axios = require('axios')
const querystring = require('querystring')
const async = require('async')
const mdtWeekReset = 670


// where region is NA, EU, KR, TW or CN
function getHost (region) {
  switch (region) {
    case 'NA':
      return 'https://us.api.blizzard.com'
    case 'EU':
      return 'https://eu.api.blizzard.com'
    case 'KR':
      return 'https://kr.api.blizzard.com'
    case 'TW':
      return 'https://tw.api.blizzard.com'
    case 'CN':
      return 'https://gateway.battlenet.com.cn'
    default:
      return 'https://us.api.blizzard.com'
  }
}

function getToken (region) {
  return new Promise((resolve, reject) => {
    if (region === 'CN') {
      tokenURL = 'https://www.battlenet.com.cn/oauth/token'
    }
    else {
      tokenURL = 'https://us.battle.net/oauth/token'
    }
    axios.post(tokenURL, querystring.stringify({
      grant_type: 'client_credentials'
    }), {
      auth: {
        username: config.auth.battlenet.clientID,
        password: config.auth.battlenet.clientSecret
      }
    }).then(function (response) {
      if (response && response.data && response.data.access_token) {
        resolve(response.data.access_token)
      }
      else {
        reject('No token')
      }
    }).catch((e) => {
      console.log('error getting token')
      reject(e.message)
    })
  })
}

function getAPI (region, endpoint, token) {
  var namespace = 'dynamic-' + region.toLowerCase()
  if (namespace === 'dynamic-na') {
    namespace = 'dynamic-us'
  }
  return axios.get(getHost(region) + endpoint + '?namespace=' + namespace, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
}

module.exports = {
  updateMDTWeek: (region) => {
    return new Promise((resolve, reject) => {
      async.parallel({
        CN: (done) => {
          return done()
          // china MDT data currently not available via API
          // use Taiwan below and hope it matches?
          // if (!region || region === 'CN') {
          //   getToken('CN').then((token) => {
          //     getAPI('CN', '/data/wow/mythic-keystone/period/index', token).then((res) => {
          //       var week = 1
          //       try {
          //         week = (res.data.current_period.id - mdtWeekReset) % 12
          //         if (!week) week = 12
          //         SiteData.findByIdAndUpdate('mdtWeekCN', {value: week}, {upsert: true}).exec()
          //         global['mdtWeekCN'] = week
          //         done()
          //       }
          //       catch (e) {
          //         logger.error({label: 'Error updating MDT Week', region: 'CN', msg: e.message})
          //         done()
          //       }
          //     }).catch((e) => {
          //       logger.error({label: 'Error updating MDT Week', region: 'CN', msg: e.message})
          //       done()
          //     })
          //   })
          // }
          // else {
          //   done()
          // }
        },
        other: (alldone) => {
          if (!region || region !== 'CN') {
            getToken().then((token) => {
              async.parallel({
                NA: (done) => {
                  if (!region || region === 'NA') {
                    getAPI('NA', '/data/wow/mythic-keystone/period/index', token).then((res) => {
                      var week = 1
                      try {
                        week = (res.data.current_period.id - mdtWeekReset) % 12
                        if (!week) week = 12
                        SiteData.findByIdAndUpdate('mdtWeekNA', {value: week}, {upsert: true}).exec()
                        global['mdtWeekNA'] = week
                        done()
                      }
                      catch (e) {
                        logger.error({label: 'Error updating MDT Week', region: 'NA', msg: e.message})
                        done()
                      }
                    }).catch((e) => {
                      logger.error({label: 'Error updating MDT Week', region: 'NA', msg: e.message})
                      done()
                    })
                  }
                  else {
                    done()
                  }
                },
                EU: (done) => {
                  if (!region || region === 'EU') {
                    getAPI('EU', '/data/wow/mythic-keystone/period/index', token).then((res) => {
                      var week = 1
                      try {
                        week = (res.data.current_period.id - mdtWeekReset) % 12
                        if (!week) week = 12
                        SiteData.findByIdAndUpdate('mdtWeekEU', {value: week}, {upsert: true}).exec()
                        global['mdtWeekEU'] = week
                        done()
                      }
                      catch (e) {
                        logger.error({label: 'Error updating MDT Week', region: 'EU', msg: e.message})
                        done()
                      }
                    }).catch((e) => {
                      logger.error({label: 'Error updating MDT Week', region: 'EU', msg: e.message})
                      done()
                    })
                  }
                  else {
                    done()
                  }
                },
                KR: (done) => {
                  if (!region || region === 'KR') {
                    getAPI('NA', '/data/wow/mythic-keystone/period/index', token).then((res) => {
                      var week = 1
                      try {
                        week = (res.data.current_period.id - mdtWeekReset) % 12
                        if (!week) week = 12
                        SiteData.findByIdAndUpdate('mdtWeekKR', {value: week}, {upsert: true}).exec()
                        global['mdtWeekKR'] = week
                        done()
                      }
                      catch (e) {
                        logger.error({label: 'Error updating MDT Week', region: 'KR', msg: e.message})
                        done()
                      }
                    }).catch((e) => {
                      logger.error({label: 'Error updating MDT Week', region: 'KR', msg: e.message})
                      done()
                    })
                  }
                  else {
                    done()
                  }
                },
                TW: (done) => {
                  if (!region || region === 'TW') {
                    getAPI('TW', '/data/wow/mythic-keystone/period/index', token).then((res) => {
                      var week = 1
                      try {
                        week = (res.data.current_period.id - mdtWeekReset) % 12
                        if (!week) week = 12
                        SiteData.findByIdAndUpdate('mdtWeekTW', {value: week}, {upsert: true}).exec()
                        global['mdtWeekTW'] = week
                        SiteData.findByIdAndUpdate('mdtWeekCN', {value: week}, {upsert: true}).exec()
                        global['mdtWeekCN'] = week
                        done()
                      }
                      catch (e) {
                        logger.error({label: 'Error updating MDT Week', region: 'TW', msg: e.message})
                        done()
                      }
                    }).catch((e) => {
                      logger.error({label: 'Error updating MDT Week', region: 'TW', msg: e.message})
                      done()
                    })
                  }
                  else {
                    done()
                  }
                }
              }, () => {
                alldone()
              })
            })
          }
          else {
            done()
          }
        }
      }, () => {
        resolve()
      })
    })
  },

  lookupSpell: (spellID, locale) => {
    if (!locale) {
      locale = 'en_US'
    }
    var spellLookup = `spell/${spellID}`
    return new Promise((resolve, reject) => {
      BlizzData.findOne({_id: spellLookup, locale: locale}).then((doc) => {
        if (doc && doc.value) {
          return resolve(doc.value)
        }
        getToken().then((token) => {
          getAPI('NA', '/wow/' + spellLookup, token).then((res) => {
            try {
              if (res.data) {
                BlizzData.findOneAndUpdate({_id: spellLookup, locale: locale}, {_id: spellLookup, locale: locale, value: res.data}, {upsert: true}).exec()
                resolve(res.data)
              }
            }
            catch (e) {
              reject(e)
            }
          })
        })
      })
    })
  }
}