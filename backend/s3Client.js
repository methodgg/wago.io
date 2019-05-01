const s3 = require('s3-client')
const config = require('./config')

module.exports = s3.createClient({
  maxAsyncS3: 20,
  s3RetryCount: 3,
  s3RetryDelay: 1000,
  multipartUploadThreshold: 20971520,
  multipartUploadSize: 15728640,
  s3Options: {
    accessKeyId: config.digitalOcean.spaces.key,
    secretAccessKey: config.digitalOcean.spaces.secret,
    region: 'sfo2',
    endpoint: 'sfo2.digitaloceanspaces.com',
    sslEnabled: true
  },
})