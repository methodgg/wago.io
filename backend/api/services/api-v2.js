const i18next = require('i18next')
const i18nextBackend = require('i18next-fs-backend')
const GameVersion = require('../models/GameVersion')

const langs = ['de-DE', 'en-GB', 'en-US', 'es-ES', 'es-MX', 'fr-FR', 'it-IT', 'ko-KR', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'zh-CN']
i18next.use(i18nextBackend).init({
  initImmediate: true,
  lng: 'en-US',
  fallbackLng: 'en-US',
  ns: ['warcraft'],
  defaultNS: 'warcraft',
  supportedLngs: langs,
  preload: langs,
  returnEmptyString: false,
  backend: {
    loadPath: __dirname + '/../../../frontend/static/i18n/[-lng-]/[-ns-].json',
  },
  interpolation: {
    prefix: '[-',
    suffix: '-]'
  }
})

module.exports = function (fastify, opts, next) {
  fastify.get('/categories', (req, res) => {
    const lang = req.query.lang ?? 'en-US'
    const t = i18next.getFixedT(lang)
    const domain = parseInt(req.query.domain ?? 0) // 0 = WoW
    let game = (req.query.game ?? 'df').toLowerCase()
    if (parseInt(game) >= 0)  {
        game = invertExpansionId(game)
    }
    const type = (req.query.type ?? 'WEAKAURA').toUpperCase()
    const root = Categories.rootCategories(type, game, domain)
    const categories = recursiveCategories(root, type, game, t)
    
    res.send(categories)
  })

  next()
}

function recursiveCategories(cats, type, game, t) {
    if (!cats) return null
    const categories = []
    console.log(cats, typeof cats)
    for (const cat of cats) {
        if (!cat.slug) {
            continue // skip menu subtitles
        }
        categories.push({
            id: cat.id,
            name: t(cat.i18n), 
            slug: cat.slug, 
            color: Categories.getAttr(cat, 'color') ?? null, 
            image: Categories.getAttr(cat, 'image') ?? null,
            children: recursiveCategories(Categories.matchChildren(cat.id, type, game), type, game, t)
        })
    }
    return categories
}

function invertExpansionId(x) {
    switch (x) {
        case 'classic': return 0
        case 0: return 'classic'
        case 'tbc': return 1
        case 1: return 'tbc'
        case 'wotlk': return 2
        case 2: return 'wotlk'
        case 'cata': return 3
        case 3: return 'cata'
        case 'mop': return 4
        case 4: return 'mop'
        case 'wod': return 5
        case 5: return 'wod'
        case 'legion': return 6
        case 6: return 'legion'
        case 'bfa': return 7
        case 7: return 'bfa'
        case 'sl': return 8
        case 8: return 'sl'
        case 'df': return 9
        case 9: return 'df'
        case 'tww': return 10
        case 10: return 'tww'
        case 'midnight': return 11
        case 11: return 'midnight'
        case 'tlt': return 12
        case 12: return 'tlt'   
    }
    return 0
}

