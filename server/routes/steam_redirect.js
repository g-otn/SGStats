var express = require('express')
var app = module.exports = express()

app.get('/redirect/:ip', (req, res) => {
    res.redirect('steam://connect/' + req.params.ip)
})