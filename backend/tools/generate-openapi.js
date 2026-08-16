const fs = require('fs')
const path = require('path')

const ref = (name) => ({ $ref: `#/components/schemas/${name}` })

const jsonResponse = (description, schema) => ({
  description,
  content: {
    'application/json': { schema }
  }
})

const apiKeyParameter = { $ref: '#/components/parameters/ApiKey' }
const requiredApiKeyParameter = { $ref: '#/components/parameters/RequiredApiKey' }
const rateLimitResponse = { $ref: '#/components/responses/RateLimit' }
const optionalApiKey = [{}, { apiKeyQuery: [] }, { apiKeyHeader: [] }]

const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Wago WeakAuras API',
    version: '1.0.0',
    description: 'The public WeakAuras API contract consumed by Wago App.'
  },
  servers: [
    {
      url: 'https://data.wago.io',
      description: 'Production'
    }
  ],
  security: [
    { apiKeyQuery: [] },
    { apiKeyHeader: [] }
  ],
  tags: [
    {
      name: 'WeakAuras',
      description: 'WeakAura discovery, updates, details, and downloads.'
    }
  ],
  paths: {
    '/api/categories': {
      get: {
        operationId: 'listWeakAuraCategoryTranslations',
        summary: 'List translated WeakAura categories',
        tags: ['WeakAuras'],
        security: [],
        parameters: [
          {
            name: 'lang',
            in: 'query',
            description: 'Locale used for category names.',
            schema: {
              type: 'string',
              default: 'en-US',
              enum: [
                'de-DE',
                'en-GB',
                'en-US',
                'es-ES',
                'es-MX',
                'fr-FR',
                'it-IT',
                'ko-KR',
                'pl-PL',
                'pt-BR',
                'pt-PT',
                'ru-RU',
                'zh-CN'
              ]
            }
          }
        ],
        responses: {
          200: jsonResponse(
            'Translated categories indexed by category ID.',
            {
              type: 'object',
              additionalProperties: ref('WeakAuraCategoryTranslation')
            }
          ),
          429: rateLimitResponse
        }
      }
    },
    '/api/v2/categories': {
      get: {
        operationId: 'listWeakAuraCategories',
        summary: 'List the WeakAura category tree',
        tags: ['WeakAuras'],
        security: [],
        parameters: [
          {
            name: 'domain',
            in: 'query',
            description: 'Wago domain. Wago App uses the World of Warcraft domain.',
            schema: {
              type: 'integer',
              const: 0,
              default: 0
            }
          },
          {
            name: 'game',
            in: 'query',
            description: 'Game or expansion used to select the category tree.',
            schema: {
              type: 'string',
              default: 'tww',
              enum: [
                'classic',
                'tbc',
                'wotlk',
                'titan-wotlk',
                'cata',
                'mop',
                'wod',
                'legion',
                'bfa',
                'sl',
                'df',
                'tww',
                'midnight',
                'tlt'
              ]
            }
          },
          {
            name: 'type',
            in: 'query',
            description: 'Import type used to select categories.',
            schema: {
              type: 'string',
              const: 'WEAKAURA',
              default: 'WEAKAURA'
            }
          }
        ],
        responses: {
          200: jsonResponse('WeakAura category tree.', {
            type: 'array',
            items: ref('WeakAuraCategory')
          }),
          429: rateLimitResponse
        }
      }
    },
    '/api/check/weakauras': {
      get: {
        operationId: 'checkWeakAuraUpdates',
        summary: 'Check WeakAuras for updates',
        tags: ['WeakAuras'],
        security: optionalApiKey,
        parameters: [
          {
            name: 'ids',
            in: 'query',
            required: true,
            description: 'Comma-separated WeakAura IDs or slugs. At most 200 values are used.',
            schema: {
              type: 'string',
              minLength: 1
            }
          },
          apiKeyParameter
        ],
        responses: {
          200: jsonResponse('Current metadata for visible WeakAuras.', {
            type: 'array',
            items: ref('WeakAuraUpdate')
          }),
          400: jsonResponse('The request does not contain IDs.', ref('ApiError')),
          429: rateLimitResponse
        }
      }
    },
    '/api/raw/encoded': {
      get: {
        operationId: 'downloadEncodedWeakAura',
        summary: 'Download an encoded WeakAura',
        tags: ['WeakAuras'],
        security: optionalApiKey,
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            description: 'WeakAura ID or slug.',
            schema: { type: 'string', minLength: 1 }
          },
          {
            name: 'version',
            in: 'query',
            description: 'WeakAura version or numeric revision. The latest version is used when omitted.',
            schema: {
              oneOf: [
                { type: 'integer', minimum: 0 },
                { type: 'string', minLength: 1 }
              ]
            }
          },
          apiKeyParameter
        ],
        responses: {
          200: {
            description: 'Encoded WeakAura import string.',
            content: {
              'text/plain': {
                schema: { type: 'string' }
              }
            }
          },
          302: {
            description: 'Redirect to the canonical version.',
            headers: {
              Location: {
                required: true,
                schema: { type: 'string' }
              }
            }
          },
          401: jsonResponse('The WeakAura requires a valid API key.', ref('ApiError')),
          404: jsonResponse('The WeakAura or version does not exist.', ref('ApiError')),
          429: rateLimitResponse
        }
      }
    },
    '/api/user/me': {
      get: {
        operationId: 'getWeakAuraUser',
        summary: 'Get the authenticated Wago user',
        tags: ['WeakAuras'],
        parameters: [requiredApiKeyParameter],
        responses: {
          200: jsonResponse('Authenticated Wago user.', ref('WagoUser')),
          401: jsonResponse('No valid user was found for the API key.', ref('ApiError')),
          429: rateLimitResponse
        }
      }
    },
    '/lookup/wago': {
      get: {
        operationId: 'getWeakAuraDetails',
        summary: 'Get WeakAura details',
        tags: ['WeakAuras'],
        security: optionalApiKey,
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            description: 'WeakAura ID or slug.',
            schema: { type: 'string', minLength: 1 }
          },
          {
            name: 'version',
            in: 'query',
            description: 'Specific version to describe.',
            schema: { type: 'string', minLength: 1 }
          },
          apiKeyParameter
        ],
        responses: {
          200: jsonResponse('WeakAura details.', ref('WeakAuraDetails')),
          401: jsonResponse('The WeakAura is not accessible with this API key.', ref('ApiError')),
          404: jsonResponse('The WeakAura does not exist.', ref('ApiError')),
          429: rateLimitResponse
        }
      }
    },
    '/search/es': {
      get: {
        operationId: 'searchWeakAuras',
        summary: 'Search WeakAuras',
        tags: ['WeakAuras'],
        security: [],
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Search text and category filters.',
            schema: { type: 'string', default: '' }
          },
          {
            name: 'expansion',
            in: 'query',
            description: 'Expansion filter.',
            schema: {
              type: 'string',
              default: 'all',
              enum: [
                'all',
                'classic',
                'tbc',
                'wotlk',
                'titan-wotlk',
                'cata',
                'mop',
                'wod',
                'legion',
                'bfa',
                'sl',
                'df',
                'tww',
                'midnight'
              ]
            }
          },
          {
            name: 'type',
            in: 'query',
            description: 'Search result type.',
            schema: {
              type: 'string',
              const: 'weakaura',
              default: 'weakaura'
            }
          },
          {
            name: 'page',
            in: 'query',
            description: 'Zero-based result page.',
            schema: {
              type: 'integer',
              minimum: 0,
              default: 0
            }
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Result order.',
            schema: {
              type: 'string',
              default: 'bestmatchv3',
              enum: ['date', 'stars', 'views', 'installs', 'bestmatchv3', 'bestmatchv2']
            }
          }
        ],
        responses: {
          200: jsonResponse('WeakAura search results.', ref('WeakAuraSearchResult')),
          429: rateLimitResponse
        }
      }
    }
  },
  components: {
    parameters: {
      ApiKey: {
        name: 'key',
        in: 'query',
        description: 'Wago API key or access token. Required for private user data.',
        schema: { type: 'string', minLength: 1 }
      },
      RequiredApiKey: {
        name: 'key',
        in: 'query',
        required: true,
        description: 'Wago API key or access token.',
        schema: { type: 'string', minLength: 1 }
      }
    },
    responses: {
      RateLimit: jsonResponse('Rate limit exceeded.', ref('ApiError'))
    },
    securitySchemes: {
      apiKeyQuery: {
        type: 'apiKey',
        in: 'query',
        name: 'key'
      },
      apiKeyHeader: {
        type: 'apiKey',
        in: 'header',
        name: 'api-key'
      }
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          data: { type: 'string' }
        },
        required: ['error']
      },
      WagoUserAvatar: {
        type: 'object',
        properties: {
          webp: { type: 'string' },
          png: { type: 'string' },
          jpg: { type: 'string' },
          gif: { type: 'string' }
        }
      },
      WeakAuraCategoryTranslation: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          slug: { type: ['string', 'null'] },
          color: { type: ['string', 'null'] },
          image: { type: ['string', 'null'] },
          games: {
            oneOf: [
              {
                type: 'array',
                items: { type: 'string' }
              },
              { type: 'null' }
            ]
          },
          types: {
            oneOf: [
              {
                type: 'array',
                items: { type: 'string' }
              },
              { type: 'null' }
            ]
          }
        },
        required: ['name', 'slug', 'color', 'image']
      },
      WeakAuraCategory: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          color: { type: ['string', 'null'] },
          image: { type: ['string', 'null'] },
          children: {
            oneOf: [
              {
                type: 'array',
                items: ref('WeakAuraCategory')
              },
              { type: 'null' }
            ]
          }
        },
        required: ['id', 'name', 'slug', 'color', 'image', 'children']
      },
      Changelog: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          format: { type: 'string' }
        }
      },
      WeakAuraUpdate: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          url: { type: 'string' },
          created: { type: 'string', format: 'date-time' },
          modified: { type: 'string', format: 'date-time' },
          forkOf: { type: 'string' },
          type: { type: 'string', const: 'WEAKAURA' },
          game: { type: 'string' },
          thumbnail: { type: ['string', 'null'] },
          thumbnailStatic: { type: ['string', 'null'] },
          username: { type: 'string' },
          encrypted: { type: 'boolean' },
          regionType: { type: 'string' },
          version: { type: 'integer' },
          versionString: { type: 'string' },
          changelog: ref('Changelog')
        },
        required: [
          '_id',
          'name',
          'slug',
          'url',
          'created',
          'modified',
          'game',
          'version',
          'versionString',
          'changelog'
        ]
      },
      WagoUser: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          username: { type: 'string' },
          avatar: ref('WagoUserAvatar'),
          hideAds: { type: 'boolean' },
          hideAddonAds: { type: 'boolean' },
          imports: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['user_id', 'username', 'avatar', 'hideAds', 'hideAddonAds', 'imports']
      },
      WeakAuraVisibility: {
        type: 'object',
        properties: {
          private: { type: 'boolean' },
          hidden: { type: 'boolean' },
          encrypted: { type: 'boolean' },
          restricted: { type: 'boolean' },
          moderated: { type: 'boolean' },
          deleted: { type: 'boolean' },
          public: { type: 'boolean' }
        },
        required: ['private', 'hidden', 'encrypted', 'restricted', 'moderated', 'deleted', 'public']
      },
      WeakAuraDate: {
        type: 'object',
        properties: {
          created: { type: 'string', format: 'date-time' },
          modified: { type: 'string', format: 'date-time' }
        },
        required: ['created', 'modified']
      },
      WeakAuraDescription: {
        type: 'object',
        properties: {
          format: { type: 'string', enum: ['bbcode', 'markdown'] },
          text: { type: 'string' },
          html: { type: 'string' }
        },
        required: ['format', 'text', 'html']
      },
      WeakAuraUser: {
        type: 'object',
        properties: {
          name: { type: ['string', 'null'] },
          searchable: { type: 'boolean' },
          roleClass: { type: 'string' },
          avatar: ref('WagoUserAvatar'),
          enableLinks: { type: 'boolean' }
        },
        required: ['name', 'searchable', 'roleClass', 'avatar']
      },
      WeakAuraCommentAuthor: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          avatar: ref('WagoUserAvatar'),
          class: { type: 'string' },
          profile: {
            oneOf: [
              { type: 'string' },
              { type: 'boolean' }
            ]
          },
          enableLinks: { type: 'boolean' }
        },
        required: ['name', 'avatar', 'class', 'profile', 'enableLinks']
      },
      WeakAuraComment: {
        type: 'object',
        properties: {
          cid: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          text: { type: 'string' },
          format: { type: 'string' },
          author: ref('WeakAuraCommentAuthor')
        },
        required: ['cid', 'date', 'text', 'format', 'author']
      },
      WeakAuraCodeReviewComment: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date-time' },
          text: { type: 'string' },
          format: { type: 'string' },
          falsePositive: { type: 'boolean' },
          author: ref('WeakAuraCommentAuthor')
        },
        required: ['date', 'text', 'format', 'falsePositive', 'author']
      },
      WeakAuraScreen: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          src: { type: 'string' },
          thumb: { type: 'string' }
        },
        required: ['_id', 'src', 'thumb']
      },
      WeakAuraVideo: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          thumb: { type: 'string' },
          url: { type: 'string' }
        },
        required: ['_id', 'thumb', 'url']
      },
      WeakAuraCollectionUser: {
        type: 'object',
        properties: {
          name: { type: ['string', 'null'] },
          class: { type: 'string' },
          avatar: ref('WagoUserAvatar'),
          profile: {
            oneOf: [
              { type: 'string' },
              { type: 'boolean' }
            ]
          }
        },
        required: ['name', 'class', 'avatar', 'profile']
      },
      WeakAuraCollection: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          _id: { type: 'string' },
          slug: { type: 'string' },
          modified: { type: 'string', format: 'date-time' },
          user: ref('WeakAuraCollectionUser')
        },
        required: ['name', '_id', 'slug', 'modified', 'user']
      },
      WeakAuraVersion: {
        type: 'object',
        properties: {
          version: { type: 'integer' },
          versionString: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          changelog: ref('Changelog')
        },
        required: ['version', 'versionString', 'date', 'changelog']
      },
      WeakAuraDetails: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          type: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          url: { type: 'string' },
          visibility: ref('WeakAuraVisibility'),
          date: ref('WeakAuraDate'),
          patch: { type: 'string' },
          description: ref('WeakAuraDescription'),
          categories: {
            type: 'array',
            items: { type: 'string' }
          },
          regionType: { type: 'string' },
          game: { type: 'string' },
          domain: { type: 'integer' },
          viewCount: { type: 'integer', minimum: 0 },
          viewsThisWeek: { type: 'integer', minimum: 0 },
          commentCount: { type: 'integer', minimum: 0 },
          downloadCount: { type: 'integer', minimum: 0 },
          embedCount: { type: 'integer', minimum: 0 },
          favoriteCount: { type: 'integer', minimum: 0 },
          installCount: { type: 'integer', minimum: 0 },
          UID: { type: ['string', 'null'] },
          alerts: {
            type: 'object',
            properties: {
              newInternalVersion: {
                type: 'object',
                properties: {
                  build: { type: 'string' },
                  internalVersion: { type: 'number' },
                  waInternalVersion: { type: 'number' }
                },
                required: ['build', 'internalVersion', 'waInternalVersion']
              },
              blacklist: {
                type: 'array',
                items: { type: 'string' }
              },
              malicious: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          },
          collectionCount: { type: 'integer', minimum: 0 },
          collections: {
            type: 'array',
            items: ref('WeakAuraCollection')
          },
          myCollections: {
            type: 'array',
            items: { type: 'string' }
          },
          user: ref('WeakAuraUser'),
          screens: {
            oneOf: [
              {
                type: 'array',
                items: ref('WeakAuraScreen')
              },
              { type: 'null' }
            ]
          },
          thumbnail: { type: ['string', 'null'] },
          thumbnailStatic: { type: ['string', 'null'] },
          videos: {
            oneOf: [
              {
                type: 'array',
                items: ref('WeakAuraVideo')
              },
              { type: 'null' }
            ]
          },
          codeReviewComments: {
            type: 'object',
            additionalProperties: ref('WeakAuraCodeReviewComment')
          },
          comments: {
            type: 'array',
            items: ref('WeakAuraComment')
          },
          translations: {
            oneOf: [
              { type: 'boolean' },
              { type: 'object', additionalProperties: true }
            ]
          },
          versions: {
            type: 'object',
            properties: {
              total: { type: 'integer', minimum: 0 },
              versions: {
                type: 'array',
                items: ref('WeakAuraVersion')
              }
            },
            required: ['total', 'versions']
          },
          codeURL: { type: 'string' },
          fork: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' }
            },
            required: ['_id', 'name']
          }
        },
        required: [
          '_id',
          'type',
          'name',
          'slug',
          'url',
          'visibility',
          'date',
          'patch',
          'description',
          'categories',
          'regionType',
          'game',
          'domain',
          'viewCount',
          'viewsThisWeek',
          'commentCount',
          'downloadCount',
          'embedCount',
          'favoriteCount',
          'installCount',
          'UID',
          'alerts',
          'collectionCount',
          'collections',
          'myCollections',
          'user',
          'codeReviewComments',
          'comments',
          'translations',
          'versions',
          'codeURL'
        ]
      },
      WeakAuraSearchHit: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          descriptionHTML: { type: 'string' },
          descriptionSanitized: { type: 'string' },
          hasDesc: { type: 'integer' },
          categories: {
            type: 'array',
            items: { type: 'string' }
          },
          expansion: { type: 'integer' },
          installs: { type: 'integer' },
          stars: { type: 'integer' },
          views: { type: 'integer' },
          viewsThisWeek: { type: 'integer' },
          versionString: { type: 'string' },
          thumbnail: { type: ['string', 'null'] },
          timestamp: { type: 'integer' },
          ageScore: { type: 'number' },
          viewsScore: { type: 'number' },
          installScore: { type: 'number' },
          starScore: { type: 'number' },
          hidden: { type: 'boolean' },
          type: { type: 'string' },
          domain: { type: 'integer' },
          categoriesRoot: { type: 'integer' },
          categoriesTotal: { type: 'integer' },
          thumbnailStatic: { type: ['string', 'null'] },
          comments: { type: 'integer' },
          userId: { type: 'string' },
          userName: { type: 'string' },
          userAvatar: { type: 'string' },
          userClass: { type: 'string' },
          userLinked: { type: 'boolean' },
          _score: { type: 'number' },
          patchIteration: { type: 'integer' }
        },
        required: [
          'id',
          'name',
          'slug',
          'description',
          'descriptionHTML',
          'descriptionSanitized',
          'hasDesc',
          'categories',
          'expansion',
          'installs',
          'stars',
          'views',
          'viewsThisWeek',
          'versionString',
          'thumbnail',
          'timestamp',
          'ageScore',
          'viewsScore',
          'installScore',
          'starScore',
          'hidden',
          'type',
          'domain',
          'categoriesRoot',
          'categoriesTotal',
          'comments',
          'userId',
          'userName',
          'userAvatar',
          'userClass',
          'userLinked',
          '_score',
          'patchIteration'
        ]
      },
      WeakAuraSearchResult: {
        type: 'object',
        properties: {
          hits: {
            type: 'array',
            items: ref('WeakAuraSearchHit')
          },
          index: { type: 'string' },
          query: { type: 'string' },
          total: { type: 'integer', minimum: 0 }
        },
        required: ['hits', 'index', 'query', 'total']
      }
    }
  }
}

const outputPath = path.resolve(__dirname, '../../public/openapi.json')

const generateOpenApi = () => `${JSON.stringify(openApiDocument, null, 2)}\n`

const writeOpenApi = ({ check = false } = {}) => {
  const generated = generateOpenApi()

  if (check) {
    let committed
    try {
      committed = fs.readFileSync(outputPath, 'utf8')
    }
    catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }

    if (committed !== generated) {
      console.error('public/openapi.json is out of date. Run npm run openapi in backend/.')
      return false
    }
    return true
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, generated)
  return true
}

if (require.main === module) {
  const check = process.argv.includes('--check')
  if (!writeOpenApi({ check })) {
    process.exitCode = 1
  }
}

module.exports = {
  openApiDocument,
  writeOpenApi
}
