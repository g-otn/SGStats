var express = require('express')
var app = module.exports = express()
const servers = require('../../bot/data/servers.json')

app.get('/redirect/:serverKey', (req, res) => {
    let server = req.params.serverKey
    
    if (servers[server])
        res.render('../server/views/redirect.pug', servers[server])
    else
        res.render('../server/views/invalid.pug', { invalidServer: server, servers: servers })
})