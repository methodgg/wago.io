const config = require('../config')
const fs = require('fs').promises
const digitalocean = require('digitalocean')
const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()

const doClient = digitalocean.client(config.digitalOcean.statusToken)
const cfClient = require('cloudflare')({token: config.cloudflare.dnsToken})
const region = 'na' // sfo2
const dataCentre = 'SF2'

async function run() {
  const args = process.argv.slice(2)
  // check DO for current data servers
  const servers = await doClient.droplets.list({
    page: 1,
    per_page: 200 // max 200
  })
  var dnsExpect = []
  var dataIPs = []
  var configHosts = []
  var newIP
  var newConfigHost
  var newDomain
  var httpServers = []
  var serverMap = {}
  var internalMap = {}
  var nextNum = 1
  for (let server of servers) {
    if (!server.name.match(/wago/)) {
      continue
    }
    let dataNum = parseInt(server.name.replace(`wago-data-${region}-`, ''))
    // if (dataNum >= 10) {
    //   continue
    // }
    let ip = getIP(server, 'public')
    serverMap[server.name] = ip
    internalMap[server.name] = getIP(server, 'private')
    if (server.tags.indexOf('wago-data') >= 0 && server.name.indexOf(`-${region}-`) >= 0 && server.tags.indexOf('wago-private') === -1) {
      dnsExpect.push({ip: ip, name: `data${dataNum}.wago.io`})
      dnsExpect.push({ip: ip, name: `data.wago.io`})
      dataIPs.push(ip)
      httpServers.push(`https://data${dataNum}.wago.io`)
      configHosts.push(getHostID(server.name, dataCentre))
      if (dataNum > nextNum) {
        nextNum = dataNum+1
      }
    }
  }
  configHosts.push('admin')

  var dnsRemove = []
  
  var zones = await cfClient.dnsRecords.browse(config.cloudflare.zoneID, {per_page: 100})
  for (let record of zones.result) {
    if (record.type === 'A') {
      for (let i = dnsExpect.length - 1; i >= 0; i--) {
        if (dnsExpect[i].ip === record.content && dnsExpect[i].name === record.name) {
          dnsExpect.splice(i, 1)
        }
      }
      if (dataIPs.indexOf(record.content) < 0 && record.name.match(/data\d*\.wago\.io/)) {
        dnsRemove.push({ip: record.content, name: record.name, id: record.id})
      }
    }
  }

  // TODO: create server (droplet) - add host info to serverMap, internalMap and dnsExpect
  if (args.indexOf('add') >= 0) {
    // var nextServer = `wago-data-${region}-${(''+nextNum).padStart(2, '0')}`
    // console.log('\u001b[36m', 'Adding new droplet', '\u001b[34;1m', nextServer, '\u001b[0m')
    // console.log()
    // // doClient.add...
    nextNum = 7
    nextServer = 'wago-data-na-07'
    newConfigHost = getHostID(nextServer, dataCentre)
    newDomain = `data${nextNum}.wago.io`
    // httpServers.push(`https://data${nextNum}.wago.io`)
    // configHosts.push(newConfigHost)
    // newIP = ...
    // copy ssh key to /home/mark/.ssh
  }

  if (args.indexOf('add') >= 0 || args.indexOf('dns') >= 0) {
    // update dns on cloudflare
    try {
      for (addDNS of dnsExpect) {
        if (newDomain == addDNS.name) {
          newIP = addDNS.ip
        }
      }
      
      console.log('\u001b[36m', 'Checking for removed servers to delete from DNS', '\u001b[0m')
      for (delDNS of dnsRemove) {
        console.log('Delete from Cloudflare', delDNS)
        await cfClient.dnsRecords.del(config.cloudflare.zoneID, delDNS.id)
      }
    }
    catch (e) {
      console.log('\u001b[31;1m', 'Failed update cloudflare', '\u001b[0m')
      console.error(e)
    }

    // generate hosts file format
    var wagoHosts = '# wago start'
    for (const [host, ip] of Object.entries(internalMap)) {
      wagoHosts += '\n' + ip + '\t' + host
    }
    wagoHosts += '\n' + internalMap['wago-logging-01'] + '\t' + 'discordbot'
    wagoHosts += '\n# wago end'
    // update /etc/hosts and config.js file on all servers
    try {
      var configContentTemplate
      for (const [host, ip] of Object.entries(serverMap)) {
        console.log('Connect \u001b[34;1m', host, '\u001b[0m') 
        await ssh.connect({
          host: ip,
          username: 'root',
          privateKey: '/home/mark/.ssh/root_id_rsa'
        })

        console.log('\u001b[36m', 'Updating hosts file', '\u001b[0m')

        await ssh.getFile('/tmp/wago-hosts', '/etc/hosts')
        var hostsContent = await fs.readFile('/tmp/wago-hosts', 'utf8')
        if (hostsContent.match(/# wago start/)) {
          hostsContent = hostsContent.replace(/# wago start([\s\S]*)# wago end/m, wagoHosts)
        }
        else {
          console.log('ADD NEW DNS BLOCK', host)
          hostsContent += '\n\n' + wagoHosts + '\n'
        }
        await fs.writeFile('/tmp/wago-hosts', hostsContent, 'utf8')
        await ssh.putFile('/tmp/wago-hosts', '/etc/hosts')

        if (host.match(/data/)) {
          // get, update and put config.js file
          console.log('\u001b[36m', 'Updating config.js file', '\u001b[0m')
          await ssh.getFile('/tmp/wago-config', '/home/mark/wago.io/backend/config.js')
          var configContent = await fs.readFile('/tmp/wago-config', 'utf8')
          configContent = configContent.replace(/dataHosts: \[.*?\]/, `dataHosts: ${JSON.stringify(configHosts)}`)
          if (host === 'wago-data-na-01') {
            configContentTemplate = configContent
          }
          else if (configContentTemplate) {
            let num = parseInt(host.replace(`wago-data-${region}-`, ''))
            if (num) {
              configContent = new String(configContentTemplate)
              let hostname = getHostID(host, dataCentre)
              configContent = configContent.replace(/host: .*?,/, `host: "${hostname}",`)
              let domain = `https://data${num}.wago.io`
              configContent = configContent.replace(/base_url: .*?,/, `base_url: "${domain}",`)
            }
          }

          await fs.writeFile('/tmp/wago-config', configContent, 'utf8')
          await ssh.putFile('/tmp/wago-config', '/home/mark/wago.io/backend/config.js')
        }

        await ssh.dispose()
      }
      console.log()

      await fs.unlink('/tmp/wago-hosts')
      await fs.unlink('/tmp/wago-config')
    }
    catch (e) {
      console.log('\u001b[31;1m', 'Failed server update', '\u001b[0m')
      console.error(e)
    }
  }

  // install and deploy latest code on each data server
  if (args.indexOf('add') >= 0 || args.indexOf('install') >= 0 || args.indexOf('deploy') >= 0) {
    try {
      for (const [host, ip] of Object.entries(serverMap)) {
        if (!host.match(/data/)) {
          console.log('skipping host', host)
          continue
        }
        console.log('Connect \u001b[34;1m', host, '\u001b[0m') 
        await ssh.connect({
          host: ip,
          username: 'mark',
          privateKey: '/home/mark/.ssh/id_rsa'
        })
        console.log('\u001b[36m', 'Deploying latest code', '\u001b[0m')
        let c = await ssh.execCommand('git stash', {cwd: '/home/mark/wago.io/backend'})
        if (c.stderr) {
          c.command = 'git stash'
          throw c
        }
        c = await ssh.execCommand('git pull', {cwd: '/home/mark/wago.io/backend'})
        if (c.stderr && c.stderr.match(/stash/)) {
          c.command = 'git pull'
          throw c
        }
        if (args.indexOf('add') >= 0 || args.indexOf('install') >= 0) {
          c = await ssh.execCommand('npm install', {cwd: '/home/mark/wago.io/backend'})
          if (c.stderr && !c.stderr.match(/No repository field/)) {
            c.command = 'npm install'
            throw c
          }
        }
        c = await ssh.execCommand('forever restart 0', {cwd: '/home/mark/wago.io/backend'})
        if (c.stderr) {
          c.command = 'forever restart 0'
          throw c
        }
        await ssh.dispose()
      }
    }
    catch (e) {
      console.log('\u001b[31;1m', 'Failed server deploy', '\u001b[0m')
      console.error(e)
    }
  }

  // update frontend nginx include file for list of data servers
  if (args.indexOf('add') >= 0 || args.indexOf('dns') >= 0) {
    try {
      console.log('\u001b[36m', 'Checking for new servers to add to DNS', '\u001b[0m')
      // update dns on cloudflare
      for (addDNS of dnsExpect) {
        console.log('Add to Cloudflare', addDNS)
        await cfClient.dnsRecords.add(config.cloudflare.zoneID, {
          type: 'A',
          name: addDNS.name,
          content: addDNS.ip,
          ttL: 1,
          proxied: true
        })
      }
      for (const [host, ip] of Object.entries(serverMap)) {
        if (!host.match(/web/)) {
          continue
        }
        console.log('Connect \u001b[34;1m', host, '\u001b[0m') 
        await ssh.connect({
          host: ip,
          username: 'root',
          privateKey: '/home/mark/.ssh/root_id_rsa'
        })
        console.log('\u001b[36m', 'Updating nginx include file', '\u001b[0m')
        await ssh.getFile('/tmp/wago-nginx-include', '/var/www/nginx-data.txt')
        var nginxContent = await fs.readFile('/tmp/wago-nginx-include', 'utf8')
        nginxContent = nginxContent.replace(/sub_filter 'window\.dataServers=\["https:\/\/data\.wago\.io"]' .*?;/, `sub_filter 'window.dataServers=["https://data.wago.io"]' 'window.dataServers=${JSON.stringify(httpServers)}';`)
        await fs.writeFile('/tmp/wago-nginx-include', nginxContent, 'utf8')
        await ssh.putFile('/tmp/wago-nginx-include', '/var/www/nginx-data.txt')
        c = await ssh.execCommand('service nginx reload')
        if (c.stderr) {
          c.command = 'service nginx reload'
          throw c
        }
        
        await ssh.dispose()
      }
    }
    catch (e) {
      console.log('\u001b[31;1m', 'Failed update frontend', '\u001b[0m')
      console.error(e)
    }
  }
}
run()


function getIP(server, type='public') {
  for (n of server.networks.v4) {
    if (n.type === type) {
      return n.ip_address
    }
  }
  return null
}

function getHostID(serverName, dataCentre) {
  let dataNum = serverName.replace(/[^\d]*/g, '')
  return `${dataCentre}-${dataNum.padStart(2, '0')}`
}