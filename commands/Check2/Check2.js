// Require check2 fora do bot.onmessage, para não 'instanciar' a cada mensagem, impedindo o uso do controle/trava de autoChecking
const request = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const bot = require('../bot.js').bot
const options = { headers: {'user-agent': 'node.js'} }
const data = require('./Forums Data.json').areas

var autoChecking = false

async function scrapThreadInfo() {

}

async function filterSteamID() {
    
}

async function scrapGTHours() {

}

async function scrapGTChart() {

}

async function scrapSteamInfo() {

}

async function scrapSteamProfile() {

}

async function sendMessage() {

}

async function check(msg, fid) {
    if (msg)
    switch (fid) {
        case "auto"
    }
}

exports.check = check