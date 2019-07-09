var moment = require('moment')
var patches = [
  {date: moment('2019-05-17T03:00:00Z'), classic: true, patch: "WoW Classic 1.13.2"}, // wow classic this version will probably never change.

  // {date: moment('2017-01-19T09:00:00Z'), beta: true, patch: "Legion PTR 7.2"},
  // {date: moment('2016-10-01T09:00:00Z'), beta: true, patch: "Legion PTR 7.1"},
  // {date: moment('2016-05-12T09:00:00Z'), beta: true, patch: "Legion Beta 7.0.3"},
  // {date: moment('2016-01-01T09:00:00Z'), beta: true, patch: "Legion Alpha 7.0.1"},

  {date: moment('2018-06-25T03:00:00Z'), patch: "Battle for Azeroth 8.2"},
  {date: moment('2018-03-12T03:00:00Z'), patch: "Battle for Azeroth 8.1.5"},
  {date: moment('2018-12-12T03:00:00Z'), patch: "Battle for Azeroth 8.1.0"},
  {date: moment('2018-07-16T03:00:00Z'), patch: "Battle for Azeroth 8.0.1"},
  {date: moment('2018-01-16T03:00:00Z'), patch: "Legion 7.3.5"},
  {date: moment('2017-10-24T03:00:00Z'), patch: "Legion 7.3.2"},
  {date: moment('2017-08-29T03:00:00Z'), patch: "Legion 7.3"},
  {date: moment('2017-06-13T03:00:00Z'), patch: "Legion 7.2.5"},
  {date: moment('2017-03-28T03:00:00Z'), patch: "Legion 7.2"},
  {date: moment('2017-01-10T03:00:00Z'), patch: "Legion 7.1.5"},
  {date: moment('2016-10-25T03:00:00Z'), patch: "Legion 7.1"},
  {date: moment('2016-08-30T03:00:00Z'), patch: "Legion Launch 7.0.3"},
  {date: moment('2016-07-19T03:00:00Z'), patch: "Legion Pre-Patch 7.0.3"},
  {date: moment('2016-03-22T03:00:00Z'), patch: "WoD 6.2.4"},

  {date: moment('2000-01-01T03:00:00Z'), patch: "WoD 6.2.3"} // wago launched during 6.2.3 so no imports will be for an earlier patch.
]

module.exports = {
  patchByDate: function (strDate, isClassic) {
    var date = moment(strDate)

    for (var i=0; i < patches.length; i++) {
      if (date.isAfter(patches[i].date) && ((isClassic && patches[i].classic) || (!isClassic && !patches[i].classic))) {
        return patches[i].patch
      }
    }
    // there shouldn't ever be any imports that can possibly reach here
    return patches[patches.length-1].patch
  }
}