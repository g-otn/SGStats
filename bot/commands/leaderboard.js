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
    // Data validation
    if (!server) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing server')
                .setDescription('You must choose a server!\n**Servers:** ' + getAvailableServers('online').join(', ') + '\nType ``' + process.env.PREFIX + 'help online`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }
    if (!servers[server] || !servers[server].gamertrackerID) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + server + '\" is not a valid server!\n**Servers:** ' + getAvailableServers('leaderboard').join(', ') + '\nType ``' + process.env.PREFIX + 'help leaderboard`` for more information.')
                .setThumbnail(thumbs.confused)
                .setColor('RED')
        )
        return
    }
    if (!sortingMethod) {
        // Sorting method is optional, so only player name needs to be input, if player name is inserted and sorting method is ommited, part of player name is inside sortingMethod (args[0])
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing player')
                .setDescription('You must type a player name!\nType ``' + process.env.PREFIX + 'help leaderboard`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }

    // Data parsing
    if (!sortingMethod.match(/^(score)$|^(time)$|^(min)$|^s$|^t$|^m$/i)) {
        // Invalid sorting method, sortingMethod interpreted as player name (or start of it)
        player = sortingMethod + (player ? ' ' + player : '')
        sortingMethod = 'score'
    }

    console.log('\nserver:', server, '\nsort:', sortingMethod, '\nplayer:', player)
    getLeaderboard(servers[server].ip, sortingMethod, player)
        .then(leaderboard => {

        })
}

exports.getLeaderboard = getLeaderboard