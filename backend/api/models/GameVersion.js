const mongoose = require('mongoose')
const moment = require('moment')
const patchDates = require('../helpers/patchDates')

const Schema = new mongoose.Schema({
    domain: { type: Number, index: true, default: 0 }, // 0 = wow, 1 == ffxiv
    isTest: { type: Boolean, index: true },
    date: { type: Date, index: true },
    major: Number,
    minor: Number,
    patch: Number,
    semver: { type: String, index: true },
    tocversion: { type: Number, index: true }
})

Schema.virtual('game').get(function () {
    if (this.domain === 1) {
        return 'Final Fantasy XIV'
    }
    switch (this.major - 1) {
        case 0: switch (this.minor) {
            case 14: return 'Season of Mastery'
            case 15: return 'Season of Discovery'
            default: return 'Classic'
        }
        case 1: return 'The Burning Crusade'
        case 2: return 'Wrath of the Lich King'
        case 3: return 'Cataclysm'
        case 4: return 'Mists of Pandaria'
        case 5: return 'Warlords of Draenor'
        case 6: return 'Legion'
        case 7: return 'Battle for Azeroth'
        case 8: return 'Shadowlands'
        case 9: return 'Dragonflight'
        case 10: return 'The War Within'
        case 11: return 'Midnight'
        case 12: return 'The Last Titan'
        default: 'World of Warcraft'
    }
})

Schema.virtual('game_short').get(function () {
    if (this.domain === 1) {
        return 'XIV'
    }
    switch (this.major - 1) {
        case 0: return 'Classic'
        case 1: return 'TBC'
        case 2: return 'WotLK'
        case 3: return 'Cata'
        case 4: return 'MoP'
        case 5: return 'WoD'
        case 6: return 'Legion'
        case 7: return 'BfA'
        case 8: return 'SL'
        case 9: return 'DF'
        case 10: return 'WW'
        case 11: return 'Midnight'
        case 12: return 'TLT'
        default: 'WoW'
    }
})

Schema.virtual('name').get(function () {
    return `${this.semver} - ${this.game}${this.isTest ? ' (Test)' : ''}`
})

Schema.statics.tocToPatch = function (toc) {
    toc = parseInt(toc)
    if (toc >= 40000 && toc < 40400) {
        return 0
    }
    else if (toc >= 30000 && toc < 30400) {
        return 0
    }
    else if (toc >= 20000 && toc < 20501) {
        return 0
    }
    else if (toc >= 10000 && toc < 11403) {
        return 0
    }
    const major = Math.floor(toc / 10000 % 100)
    const minor = Math.floor(toc / 100 % 100)
    const patch = toc % 100
    return {
        semver: `${major}.${minor}.${patch}`,
        major,
        minor,
        patch
    }
}

Schema.statics.patchToToc = function (semver) {
    const [major, minor, patch] = semver.split('.')
    return 10000 * parseInt(major) + 100 * parseInt(minor) + parseInt(patch)
}

Schema.statics.updatePatches = async function () {
    // wow patch data from wago.tools
    try {
        const res = await axios.get('https://wago.tools/api/builds')
        for (const [product, builds] of Object.entries(res.data)) {
            const domain = 0
            const done = {} // since we don't use build numbers we can ignore duplicate versions with the otherwise same data
            const isTest = !(product === 'wow' || product === 'wow_classic' || product === 'wow_classic_era')
            for (const data of builds.reverse()) {
                const date = new Date(data.created_at)
                const tocversion = this.patchToToc(data.version)
                const version = this.tocToPatch(tocversion)

                if (!done[tocversion]) {
                    done[tocversion] = true
                    const obj = {
                        domain,
                        isTest,
                        tocversion,
                        date,
                        major: version.major,
                        minor: version.minor,
                        patch: version.patch,
                        semver: version.semver,
                    }
                    await this.findOneAndUpdate({ domain, semver: version.semver, tocversion, isTest }, obj, { upsert: true })
                }
            }
        }
    }
    catch (e) {
        console.error('Error updating patch data', e)
    }

    // fixed ffxiv patch data
    const ffxiv = [
        { domain: 1, date: moment('2019-07-02T03:00:00Z') },
        { domain: 1, date: moment('2021-11-23T03:00:00Z') },
    ]
    for (const data of ffxiv) {
        this.findOneAndUpdate({ domain: 1, date: data.date }, { domain: 1, date: data.date }, { upsert: true })
    }
}

Schema.statics.findVersion = async function (toc, date, domain, isTest = false) {
    let gameVersion
    if (toc && toc > 100) {
        gameVersion = await this.findOne({ domain: domain, tocversion: toc, date: { $lt: date }, isTest }).sort({ date: -1 })
    }
    else if (toc) {
        gameVersion = await this.findOne({ domain: domain, major: toc, date: { $lt: date }, isTest }).sort({ date: -1 })
    }
    else {
        gameVersion = await this.findOne({ domain: domain, date: { $lt: date }, isTest }).sort({ date: -1 })
    }
    if (gameVersion) {
        return gameVersion
    }
    else if (!isTest) {
        return await this.findVersion(toc, date, domain, true)
    }
    return {}
}

Schema.statics.patchIteration = async function (toc) {
    if (!toc) {
        return 0
    }
    const cached = await redis.get(`tocversion:iteration:${toc}`)
    if (cached) {
        return parseInt(cached)
    }
    try {
        const version = this.tocToPatch(toc)
        const iterations = await this.aggregate([
            {
                $match: {
                    $and: [
                        { tocversion: { $lte: toc } },
                        { major: { $eq: version.major } },
                        { isTest: false }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $addToSet: "$_id" } // Counting distinct records using _id field
                }
            },
            {
                $project: {
                    _id: 0,
                    count: { $size: "$count" } // Get the count of distinct records
                }
            }
        ])
        const count = iterations[0].count
        redis.set(`tocversion:iteration:${toc}`, '' + count)
        return count
    } catch (e) {
        return 0
    }
}

const GameVersion = mongoose.model('GameVersion', Schema)
module.exports = GameVersion