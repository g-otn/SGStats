const express = require('express')
var app = module.exports = express()

app.use(express.static('server/public'))
app.use(require('./gateway_status'))
app.use(require('./steam_redirect'))
app.use((req, res) => res.redirect('/'))
