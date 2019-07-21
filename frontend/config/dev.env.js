var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_SERVER: '"http://io:3030"',
  DATA_SERVERS: ['https://data1.wago.io', 'https://data2.wago.io'],
})
