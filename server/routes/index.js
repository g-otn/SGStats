var express = require('express')
var app = module.exports = express()

app.use(express.static('public'))
app.use((req, res) => res.redirect('/'))
