const {S3} = require('@aws-sdk/client-s3')
const {Upload} = require('@aws-sdk/lib-storage')
const fs = require('node:fs')
const client = new S3({
    forcePathStyle: false,
    endpoint: "https://sfo2.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
      accessKeyId: config.digitalOcean.spaces.key,
      secretAccessKey: config.digitalOcean.spaces.secret
    }
})

module.exports = {
  async uploadFile({ localFile, s3Params }) {
    const uploader = new Upload({
      client,
      params: {
        ...s3Params,
        Body: fs.createReadStream(localFile)
      },
      queueSize: 20,
      partSize: 15 * 1024 * 1024,
      leavePartsOnError: false
    })

    return uploader.done()
  },

  delete (params) {
    return client.send(
      new DeleteObjectsCommand(params)
    )
  },

  async getFile(s3Params, localFile) {
    const response = await client.send(
      new GetObjectCommand(s3Params)
    )

    await pipeline(
      response.Body,
      fs.createWriteStream(localFile)
    )

    return localFile
  }
}


// const s3 = require('s3-client')
// const config = require('../../config')
// const s3ClientParams = {
//   maxAsyncS3: 20,
//   s3RetryCount: 3,
//   s3RetryDelay: 1000,
//   multipartUploadThreshold: 20971520,
//   multipartUploadSize: 15728640,
//   s3Options: {
//     accessKeyId: config.digitalOcean.spaces.key,
//     secretAccessKey: config.digitalOcean.spaces.secret,
//     region: 'sfo2',
//     endpoint: 'sfo2.digitaloceanspaces.com',
//     sslEnabled: true
//   }
// }

// module.exports = {
//   uploadFile (s3Params) {
//     const client = s3.createClient(s3ClientParams)
//     return promise = new Promise((resolve, reject) => {
//       const uploader = client.uploadFile(s3Params)
//       uploader.on('error', (e) => reject(e))
//       uploader.on('end', resolve)
//     })
//   },

//   delete (params) {
//     const client = s3.createClient(s3ClientParams)
//     client.deleteObjects({s3Params: params})
//   },

//   getFile (s3Params, localFile) {
//     const client = s3.createClient(s3ClientParams)
//     return promise = new Promise((resolve, reject) => {
//       const downloader = client.downloadFile({localFile, s3Params})
//       downloader.on('error', function(err) {
//         reject(err.stack)
//       })
//       downloader.on('end', function() {
//         resolve(localFile)
//       })
//     })
//   }
// }