var moment = require('moment')
var patches = [
  {date: moment('2021-11-23T03:00:00Z'), game: 'ffxiv', patch: "FFXIV Endwalker", domain: 1},
  {date: moment('2001-01-01T03:00:00Z'), game: 'ffxiv', patch: "FFXIV Shadowbringers", domain: 1},

  {date: moment('2022-07-15T03:00:00Z'), game: 'wotlk', patch: "WoW WotLK Classic 3.4.0 Beta", domain: 0},
  {date: moment('2022-09-26T03:00:00Z'), game: 'wotlk', patch: "WoW WotLK Classic 3.4.0", domain: 0},

  {date: moment('2021-08-31T03:00:00Z'), game: 'tbc', patch: "WoW TBC Classic 2.5.2", domain: 0},
  {date: moment('2021-06-01T03:00:00Z'), game: 'tbc', patch: "WoW TBC Classic 2.5.1", domain: 0},
  {date: moment('2021-04-20T03:00:00Z'), game: 'tbc', patch: "WoW TBC Classic 2.5.1 Beta", domain: 0},

  {date: moment('2021-12-10T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.14.2", domain: 0},
  {date: moment('2021-11-09T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.14.1", domain: 0},
  {date: moment('2021-09-28T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.14.0", domain: 0},
  {date: moment('2021-04-20T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.13.7", domain: 0},
  {date: moment('2020-12-01T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.13.6", domain: 0},
  {date: moment('2020-07-07T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.13.5", domain: 0},
  {date: moment('2020-03-10T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.13.4", domain: 0},
  {date: moment('2019-12-19T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.13.3", domain: 0},
  {date: moment('2019-05-17T03:00:00Z'), game: 'classic', patch: "WoW Classic 1.13.2", domain: 0},

  {date: moment('2022-11-28T03:00:00Z'), game: 'df', patch: "Dragonflight 10.0.0", base: true, domain: 0},
  {date: moment('2022-10-25T03:00:00Z'), game: 'df', patch: "Dragonflight Pre-patch 10.0.0", base: true, domain: 0},
  {date: moment('2022-09-01T03:00:00Z'), game: 'df', patch: "Dragonflight Beta 10.0.0", base: true, domain: 0},
  {date: moment('2022-08-01T03:00:00Z'), game: 'df', patch: "Dragonflight Alpha 10.0.0", base: true, domain: 0},

  {date: moment('2022-02-22T03:00:00Z'), game: 'sl', patch: "Shadowlands 9.2.0", base: true, domain: 0},
  {date: moment('2021-11-02T03:00:00Z'), game: 'sl', patch: "Shadowlands 9.1.5", base: true, domain: 0},
  {date: moment('2021-06-29T03:00:00Z'), game: 'sl', patch: "Shadowlands 9.1.0", base: true, domain: 0},
  {date: moment('2021-03-10T03:00:00Z'), game: 'sl', patch: "Shadowlands 9.0.5", base: true, domain: 0},
  {date: moment('2020-10-13T03:00:00Z'), game: 'sl', patch: "Shadowlands 9.0.1", base: true, domain: 0},
  {date: moment('2020-06-01T03:00:00Z'), game: 'sl', patch: "Shadowlands 9.0.1 Beta", domain: 0},

  {date: moment('2020-01-07T03:00:00Z'), game: 'bfa', patch: "Battle for Azeroth 8.3.0", base: true, domain: 0},
  {date: moment('2019-09-17T03:00:00Z'), game: 'bfa', patch: "Battle for Azeroth 8.2.5", base: true, domain: 0},
  {date: moment('2019-06-25T03:00:00Z'), game: 'bfa', patch: "Battle for Azeroth 8.2.0", base: true, domain: 0},
  {date: moment('2019-03-12T03:00:00Z'), game: 'bfa', patch: "Battle for Azeroth 8.1.5", base: true, domain: 0},
  {date: moment('2018-12-12T03:00:00Z'), game: 'bfa', patch: "Battle for Azeroth 8.1.0", base: true, domain: 0},
  {date: moment('2018-07-16T03:00:00Z'), game: 'bfa', patch: "Battle for Azeroth 8.0.1", base: true, domain: 0},

  {date: moment('2018-01-16T03:00:00Z'), game: 'legion', patch: "Legion 7.3.5", base: true, domain: 0},
  {date: moment('2017-10-24T03:00:00Z'), game: 'legion', patch: "Legion 7.3.2", base: true, domain: 0},
  {date: moment('2017-08-29T03:00:00Z'), game: 'legion', patch: "Legion 7.3", base: true, domain: 0},
  {date: moment('2017-06-13T03:00:00Z'), game: 'legion', patch: "Legion 7.2.5", base: true, domain: 0},
  {date: moment('2017-03-28T03:00:00Z'), game: 'legion', patch: "Legion 7.2", base: true, domain: 0},
  {date: moment('2017-01-10T03:00:00Z'), game: 'legion', patch: "Legion 7.1.5", base: true, domain: 0},
  {date: moment('2016-10-25T03:00:00Z'), game: 'legion', patch: "Legion 7.1", base: true, domain: 0},
  {date: moment('2016-08-30T03:00:00Z'), game: 'legion', patch: "Legion Launch 7.0.3", base: true, domain: 0},
  {date: moment('2016-07-19T03:00:00Z'), game: 'legion', patch: "Legion Pre-Patch 7.0.3", base: true, domain: 0},

  {date: moment('2016-03-22T03:00:00Z'), game: 'wod', patch: "WoD 6.2.4"},
  {date: moment('2000-01-01T03:00:00Z'), patch: "WoD 6.2.3"} // wago launched during 6.2.3 so no imports will be for an earlier patch.
]

module.exports = {
  getDate: function (strDate, game, domain) {
    var date = moment(strDate)

    for (var i=0; i < patches.length; i++) {
      if (date.isAfter(patches[i].date) && ((!game && patches[i].base) || game === patches[i].game) && domain === patches[i].domain) {
        return patches[i].patch
      }
    }

    // some pre-bfa imports won't have the correct game value set
    for (var i=0; i < patches.length; i++) {
      if (date.isAfter(patches[i].date) ) {
        return patches[i].patch
      }
    }
    // there shouldn't ever be any imports that can possibly reach here
    return patches[patches.length-1].patch
  },

  gameVersion: function (tocversion) {
    tocversion = parseInt(tocversion)
    if (tocversion >= 100000) {
      return 'df'
    }
    else if (tocversion >= 90000) {
      return 'sl'
    }
    else if (tocversion >= 80000) {
      return 'bfa'
    }
    else if (tocversion >= 70000) {
      return 'legion'
    }
    else if (tocversion >= 30000) {
      return 'wotlk'
    }
    else if (tocversion >= 20000) {
      return 'tbc'
    }
    else if (tocversion >= 10000) {
      return 'classic'
    }
    else {
      return this.gameVersion(100000000) // default to the latest
    }
  }
}