const config = require('../../config')

async function getAPIFights (logID) {
  const cachedLog = await WarcraftLogs.lookup(logID)
  if (cachedLog) {
    return cachedLog
  }
  try {
    const result = await axios.get(`https://www.warcraftlogs.com/v1/report/fights/${logID}?translate=true&api_key=${config.warcraftLogsKey}`)
    if (result && result.data.fights) {
      var dungeons = []
      var enemies = {}
      var fightIDs = {}
      result.data.fights.forEach((fight) => {
        if (fight.difficulty === 10 && fight.kill) {
          dungeons.push({name: fight.name, start: fight.start_time, end: fight.end_time, level: fight.keystoneLevel, affixes: fight.affixes})
          fightIDs[fight.id] = 1
        }
      })
      result.data.enemies.forEach((enemy) => {
        for (let i = 0; i < enemy.fights.length; i++) {
          if ((enemy.type === 'NPC' || enemy.type === 'Boss') && fightIDs[enemy.fights[i].id]) {
            enemies[enemy.id] = enemy.guid
            break
          }
        }
      })
      var log = new WarcraftLogs({log: logID, dungeons, enemies, time: {start: new Date(result.data.start), end: new Date(result.data.end)}})
      log.save()
      return log
    }
  }
  catch (e) {
    console.log('WCL Dungeon Lookup ERR', e.message)
    return {}
  }
}

async function getAPIEvents (logID, enemies, start, end, Events, Engaged, Dimensions) {
  if (!Events) {
    Events = []
    Engaged = {}
    Dimensions = {maxX: -9999999, minX: 9999999, maxY: -9999999, minY: 9999999}
  }
  try {
    const result = await axios.get(`https://www.warcraftlogs.com/v1/report/events/${logID}?start=${start}&end=${end}&filter=%28source.disposition%3D%22enemy%22%20and%20resources.hpPercent%20%3E%2090%20and%20target.name%21%3D%22Environment%22%20and%20%28type%3D%22damage%22%20or%20type%3D%22begincast%22%20or%20type%3D%22cast%22%29%29%20OR%20%28target.disposition%3D%22enemy%22%20and%20type%3D%22death%22%29&api_key=${config.warcraftLogsKey}`)
    if (result && result.data && result.data.events) {
      result.data.events.forEach((event) => {
        if (enemies[event.targetID] && Engaged[`${enemies[event.targetID]}-${event.targetInstance}`] && event.type === 'death' && !event.targetIsFriendly) {
          Events.push({
            id: enemies[event.targetID],
            uid: event.targetInstance,
            event: 'death'
          })
        }
        else if (enemies[event.sourceID] && !Engaged[`${enemies[event.sourceID]}-${event.sourceInstance}`] && !event.sourceIsFriendly && event.targetIsFriendly && event.x && event.y) {
          Engaged[`${enemies[event.sourceID]}-${event.sourceInstance}`] = 1
          Events.push({
            id: enemies[event.sourceID],
            uid: event.sourceInstance,
            event: 'engaged',
            x: event.x,
            y: event.y
          })
          Dimensions.maxX = Math.max(Dimensions.maxX, event.x)
          Dimensions.minX = Math.min(Dimensions.minX, event.x)
          Dimensions.maxY = Math.max(Dimensions.maxY, event.y)
          Dimensions.minY = Math.min(Dimensions.minY, event.y)
        }
      })
      if (result.data.nextPageTimestamp) {
        return getAPIEvents(logID, enemies, result.data.nextPageTimestamp, end, Events, Engaged, Dimensions)
      }
      else {
        return {Events, Dimensions}
      }
    }
    else {
      return {Events, Dimensions}
    }
  }
  catch (e) {
    console.log('WCL Events Lookup ERR', e.message)
    return {}
  }
}

function getMDTEnemyIndex(mdt, dungeonIndex, creatureID) {
  for (let i = 0; i < mdt.dungeonEnemies[dungeonIndex].length; i++) {
    if (mdt.dungeonEnemies[dungeonIndex][i].id === creatureID) {
      return i
    }
  }
  return -1
}

module.exports = {
  getDungeons: async (logID) => {
    const log = await getAPIFights(logID)
    if (log) {
      return {dungeons: log.dungeons, time: log.time}
    }
    else {
      return {}
    }
  },

  generateMDT: async (logID, dungeonIndex) => {
    const log = await getAPIFights(logID)
    if (!log || !log.dungeons || !log.dungeons[dungeonIndex]) {
      return {error: 'Must select dungeon'}
    }
    // TODO: make this more efficient and don't use this gigantic table - need to store dungeon indexes separately
    var mdt = await SiteData.findById('mdtDungeonTable').exec()
    if (!mdt) {
      return {}
    }
    mdt = mdt.value
    var mdtDungeonIndex = mdt.dungeonList.indexOf(log.dungeons[dungeonIndex].name)
    if (mdtDungeonIndex <= 0) {
      return {error: 'Dungeon not found ' + log.dungeons[dungeonIndex].name}
    }
    const data = await getAPIEvents(logID, log.enemies, log.dungeons[dungeonIndex].start, log.dungeons[dungeonIndex].end)
    var Engaged = []
    var Pulls = []
    data.Events.forEach((target) => {
      if (target.event === 'engaged' && target.id) {
        // find creature if relevant
        let creatureIndex = getMDTEnemyIndex(mdt, mdtDungeonIndex, target.id)
        if (creatureIndex < 0) {
          return
        }                
        // make new pull if necessary
        if (!Engaged.length) {
          Pulls.push([])
        }
        // track engagement
        Engaged.push(`${target.id}-${target.uid}`)
        // find closest clone
        var closestClone = {distance: 9999999, index: -1}
        mdt.dungeonEnemies[mdtDungeonIndex][creatureIndex].clones.forEach((clone, cloneIndex) => {
          // if clone is already tracked
          if (clone.pulled) {
            return
          }
          // if this clone requires teeming affix
          if (!clone.teeming && log.dungeons[dungeonIndex].affixes.indexOf(5) >= 0){
            return
          }
          let distance = Math.sqrt(
            Math.pow((clone.x - mdt.dungeonDimensions[mdtDungeonIndex].minX) / (mdt.dungeonDimensions[mdtDungeonIndex].maxX - mdt.dungeonDimensions[mdtDungeonIndex].minX) - ((target.x - data.Dimensions.minX) / (data.Dimensions.maxX - data.Dimensions.minX)), 2) + 
            Math.pow((clone.y - mdt.dungeonDimensions[mdtDungeonIndex].minY) / (mdt.dungeonDimensions[mdtDungeonIndex].maxY - mdt.dungeonDimensions[mdtDungeonIndex].minY) - ((target.y - data.Dimensions.minY) / (data.Dimensions.maxY - data.Dimensions.minY)), 2)
          )
          if (distance < closestClone.distance) {
            closestClone = {distance: distance, index: cloneIndex}
          }
        })
        if (closestClone.index < 0) {
          return
        }
        mdt.dungeonEnemies[mdtDungeonIndex][creatureIndex].clones[closestClone.index].pulled = true
        // add clone to mdt table
        let currentPull = Pulls[Pulls.length - 1]
        if (currentPull.length < creatureIndex) {
          for (let i = currentPull.length; i <= creatureIndex; i++) {
            currentPull.push(null)
          }
        }
        if (!currentPull[creatureIndex]) {
          currentPull[creatureIndex] = []
        }
        currentPull[creatureIndex].push(closestClone.index + 1)
        Pulls[Pulls.length - 1] = currentPull
      }
      else if (target.event === 'death' && target.id) {
        var i = Engaged.indexOf(`${target.id}-${target.uid}`)
        if (i !== -1) {
          Engaged.splice(i, 1)
        }
      }
    })
    return Pulls
  }
}