const config = require('./config')
const request = require('request-promise')
const tap = require('tap')

const hostname = `http://localhost:${config.port}`
runTests()
async function runTests() {
  await tap.test('Index object: GET /lookup/index', async (t) => {
    const res = await request({method: 'GET', url: `${hostname}/lookup/index`, resolveWithFullResponse: true})
    const body = JSON.parse(res.body)
    t.true(Array.isArray(body.top10.faves) && Array.isArray(body.top10.newest) && Array.isArray(body.top10.updates), 'top 10 Lists found')
    t.true(Array.isArray(body.news), 'news posts found')
    t.true(Array.isArray(body.addons) && body.addons[0].active, 'addons found')
  })

  await tap.test('Search filters: GET /search?q=...', async (t) => {
    const searchQuery = 'fire'
    const regexQuery = /fire/i
    var res = await request({method: 'GET', url: `${hostname}/search?q=${searchQuery}`, resolveWithFullResponse: true, json: true})
    res = res.body
    t.true(res.results[0].name.match(regexQuery) || res.results[0].slug.match(regexQuery) || res.results[0].description.match(regexQuery), 'text query matches')
    for (let i = 1; i < res.results.length; i++) {
      // don't spam with samey test results but still check and report if there's a problem
      if (!res.results[i].name.match(regexQuery) && !res.results[i].slug.match(regexQuery) && !res.results[i].description.match(regexQuery)) {
        t.true(false, `text query ${i} matches`)
      }
    }
    
    const searchType = 'WEAKAURA'
    res = await request({method: 'GET', url: `${hostname}/search?q=type:${searchType}`, resolveWithFullResponse: true, json: true})
    res = res.body
    t.true(res.results[0].type === searchType, 'type query matches')
    for (let i = 1; i < res.results.length; i++) {
      if (res.results[i].type !== searchType) {
        t.true(false, `type query ${i} matches`)
      }
    }

    const searchUserName = 'Ora'
    res = await request({method: 'GET', url: `${hostname}/search?q=user:${searchUserName}`, resolveWithFullResponse: true, json: true})
    res = res.body
    t.true(res.results[0].user.name === searchUserName, 'user query matches')
    for (let i = 1; i < res.results.length; i++) {
      if (res.results[i].user.name !== searchUserName) {
        t.true(false, `user query ${i} matches`)
      }
    }
  })

  await tap.test('Import and view new WeakAura POST /import...', async (t) => {
    const importString = '!nwvuZjUnq4Fl9Hot7dLX2WCx4rcyA4gIDoKtVxyeiqYgnXwY1sgc5b(T3DLTjeOTxsya5vRw9T733UM6ttOejnAWaF)(dPedLe0Z3RhSSGs44hWbR4vBWtAPYsjJdJscx0yZFQwzjY3e0OGbucR2UtxfxALALboh49X40uJWsJ673ZZZZpiW7RE997doR2coFvq3Q15C9bf5GSuqVV9wgd3ctQkeORZIiZMecUwBS6Iey)Nl5mRGsQB)TliH8mbDdKEB1kmw1grwU(WyDUUcT7IDOITjxWX9FrikhzkfBTlyqkGUWuYcCTcRcglRYIl41voJRShbusmc4c4qLR5rLwjWuVaG8N37uPsA29P93(EAILGlYcJvU9LJtAdcMeVN0j0iF3Na339DFpa)22woA5J7JtsIFCXS)8Ho2hz6P5SmaiXpNmFweqb7eYSDa3(fG75stzo74mSwtMPSIQu2wXs8zZsBfJlwXQ2UJjaGKDKsY1SgPflhO1aCzrDUv6Kn2o73ygPNBmYLPPYTGLJ3SvfaIBmUnNzm3yTCF5)XLkvzv66YBdUo)2GdPDNG5JihBtUYiAwKNEvtWRD9m)rWWH9gc)1)UHFzWDdqoxLkZAATC0Y)ARbs4jo1YMARvRI3lQaU5IEwkzAL8TtR)EnJdcf2P1jjNB2(PkLdsUDxdTFoIxRnQezqvObfUgqclVChdJaPPcz(qpvt7mLmrAk01k7V97N(2L)dUcM5xQTgX5XG46hc2lJa5Uz5JcUKTKG(zwUqVrBVpxw2tNLbAe9Q2R4E3dnr7(p065OAP9SeSt3)(eU2A(NQxk4NuOPKFfkyPvScbXI75QnUtcBvsjVPb0g55MR6MgjXuxXY)lrLbLyrWuAjussKfciW6tRNiZ(fuL8)bqVZaSBQXMUPXtrW0WzKXlcdJA0sOd14f9Jn7Emni67t6)3iAazLXnH1wjZYGhAUZKZgClDHJbeeqH1Be7bPkPgAyFLswnEejzfjz0Ie3MH4MpvjCBsEkC(CkXDak5bblheD4q8v1ijH0OydeOg8(q48NM(8C3eI88z8wSef47Dx)VIPS7ueCifamxCWHjsyYrtaH8qbPF7bjWeifh68pTowDA9SMM1w8Fferuq2PpedQCJ73rGcFVO5wFVw4IbZTvsJXh1CrRKXH7iaaWBGBWm2TZLx8Y0Uj(iu5cdZId5rcadlwRVbZDVxhCypCpdcWRI(pd'
    var res = await request({method: 'POST', url: `${hostname}/import/scan`, json: {importString}, resolveWithFullResponse: true})
    res = res.body
    t.true(res.type === 'WeakAura' && res.scan, 'scan import')

    res = await request({method: 'POST', url: `${hostname}/import/submit`, json: {expireAfter: '15m', name: 'UnitTest', scanID: res.scan, visbility: 'Hidden'}, resolveWithFullResponse: true})
    res = res.body
    t.true(res.success && res.wagoID, 'submit import')

    res = await request({method: 'GET', url: `${hostname}/lookup/wago?id=${res.wagoID}`, resolveWithFullResponse: true, json: true})
    res = res.body
    t.true(res.codeURL && res.name === 'UnitTest', 'lookup import')
    
    res = await request({method: 'GET', url: `${hostname}${res.codeURL}`, resolveWithFullResponse: true, json: true})
    res = res.body
    t.true(res.version === 1 && res.encoded && res.json, 'lookup code')
  })
}