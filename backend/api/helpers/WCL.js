const config = require('../../config')
const Axios = require('axios')

function getAPIFights (logID) {
  return new Promise((resolve, reject) => {
    Axios.get(`https://www.warcraftlogs.com/v1/report/fights/${logID}?api_key=${config.warcraftLogsKey}`).then((result) => {
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
            if (enemy.type === 'NPC' && fightIDs[enemy.fights[i].id]) {
              enemies[enemy.id] = enemy.guid
              break
            }
          }
        })
        var log = new WarcraftLogs({log: logID, dungeons, enemies})
        log.save()
        resolve(log)
      }
    }).catch((e) => {
      console.log(e.message)
    })
  })
}

function getAPIEvents (logID, start, end, Events, Engaged) {
  if (!Events) {
    Events = []
    Engaged = {}
  }
  return new Promise((resolve, reject) => {
    Axios.get(`https://www.warcraftlogs.com/v1/report/events/${logID}&start=${start}&end=${end}&filter=%28source.disposition%3D%22enemy%22%20and%20resources.hpPercent%20%3E%2095%20and%20target.name%21%3D%22Environment%22%20and%20%28type%3D%22damage%22%20or%20type%3D%22begincast%22%20or%20type%3D%22cast%22%29%29%20OR%20%28target.disposition%3D%22enemy%22%20and%20type%3D%22death%22%29&api_key=${config.warcraftLogsKey}`
    ).then((result) => {
      if (result && result.data && result.data.events) {
        result.data.events.forEach((event) => {
          if (log[event.targetID] && event.type === 'death') {
            Events.push({
              id: log[event.targetID],
              uid: event.targetInstance,
              event: 'death'
            })
          }
          else if (!Engaged[`${log[event.targetID]}-${event.targetInstance}`]) {
            Engaged[`${log[event.targetID]}-${event.targetInstance}`] = 1
            Events.push({
              id: log[event.targetID],
              uid: event.targetInstance,
              event: 'engaged',
              x: event.x,
              y: event.y
            })
          }
        })
        if (result.data.nextPageTimestamp) {
          resolve(getAPIEvents(logID, result.data.nextPageTimestamp, end, Events, Engaged))
        }
        else {
          resolve(Events)
        }
      }
      else {
        reject({error: 'No events found'})
      }
    }).catch((e) => {
      logger.error(e)
      reject({error: 'Unable to fetch data'})
    })
  })
}

module.exports = {
  getDungeons: (logID) => {
    return new Promise((resolve, reject) => {
      WarcraftLogs.lookup(logID).then((log) => {
        if (log) {
          resolve(log.dungeons)
        }
        else {
          getAPIFights(logID).then((log) => {
            resolve(log.dungeons)
          })
        }        
      })
    })
  },

  generateMDT: (logID, dungeonIndex) => {
    return new Promise((resolve, reject) => {
      WarcraftLogs.lookup(logID).then((log) => {
        if (!log || !log.dungeons || !log.dungeons[dungeonIndex]) {
          return reject({error: 'Must lookup dungeons first'})
        }
        return getAPIEvents(logID, log.dungeons[dungeonIndex].start, log.dungeons[dungeonIndex].end).then((events) => {
          resolve({events: events, dungeon: log.dungeons[dungeonIndex]})
        }).catch((e) => {
          reject(e)
        })
      })
    })
  }
}