const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers
const searchPlayer = require('./player').searchPlayer

async function getLeaderboard(serverIP, sortingMethod, player) {

}

exports.sendLeaderboard = (msg, server, sortingMethod, player) => {

}

exports.getLeaderboard = getLeaderboard