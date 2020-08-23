const {Queue} = require('bullmq')
const queues = []

// sets globals for DB-stored, frequently accessed data
module.exports = {
  run: async (items) => {
    if (typeof items === 'string') {
      items = [items]
    }
    else if (!Array.isArray(items)) {
      items = [
        'LatestAddons',
        'LatestNews',
        'mdtWeekNA',
        'mdtWeekEU',
        'mdtWeekKR',
        'mdtWeekTW',
        'mdtWeekCN',
        'TopLists',
        'WagoOfTheMoment',
        'weakAuraInternalVersion'
      ]
    }
    items.forEach(async (item) => {
      var data = await SiteData.findById(item).exec()
      if (data && data.value) {
        global[item] = data.value
      }
    })
  },

  queue: async (items) => {
    if (!queues.length) {
      for (const host of config.dataHosts) {
        queues.push(new Queue(`tasks:${host}`, {connection: config.redis}))
      }
    }
    for (const q of queues) {
      q.add('UpdateCache', items)
    }
  }
}