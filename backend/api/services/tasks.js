/**
 * Using restify to run cron tasks directly on data service. Restrict all /tasks requests to localhost.
 */
server.get('/tasks/:task', (req, res, next) => {
  if (req.connection.remoteAddress !== '::ffff:127.0.0.1') {
    return res.send(403, {error: 'invalid_access'})
  }
  console.log('running task', req.params.task)
  
  switch (req.params.task) {
    case "random": return MakeWagoOfTheMoment(req, res)
  }
})

/**
 * Updates wago of the moment
 * Includes array of the last five wagos of the moment
 */
function MakeWagoOfTheMoment (req, res) {
  var data = global.WagoOfTheMoment || {}
  WagoItem.randomOfTheMoment((wago) => {
    data = wago
    SiteData.findByIdAndUpdate('WagoOfTheMoment', {value: data}, {upsert: true}).exec()
    global['WagoOfTheMoment'] = data
    
    res.end()
  })
}