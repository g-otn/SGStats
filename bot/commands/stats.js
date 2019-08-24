const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const encodeUrl = require('encodeurl')
const timeago = require('timeago.js')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers
const searchPlayer = require('./player').searchPlayer
const servers = require('../data/servers.json')

async function getPlayerStats(server, player, graphType = 'h', period = 'm') {
    let playerStats

    // Gets rank, name, score, score/min and profile link
    await searchPlayer(graphType, server, period, player) // graphType and period not required
        .then(foundPlayer => playerStats = foundPlayer)

    if (!playerStats || !playerStats.profile) // Player not found
        return playerStats

    let options = {
        uri: playerStats.profile,
        headers: { 'User-Agent': 'Request-Promise' }
    }

    // Gets first and last join from GameTracker's user server profile 
    await rp(options)
        .then(html => {
            let $ = cheerio.load(html)
            playerStats.firstJoined = $('.blocknew666:nth-child(1) .item_float_left').contents().eq(4).text().trim()
            playerStats.lastJoined = $('.blocknew666:nth-child(1) .item_float_left').contents().eq(8).text().trim()
        })
        .catch(err => playerStats.firstJoined == `Error (${err.statusCode})`)

    return playerStats
}

exports.sendPlayerStats = (msg, server, player) => {
    // Data validation
    if (!server) { // no server and no player
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing server')
                .setDescription('You must choose a server!\n**Servers:** ' + getAvailableServers('stats').join(', ') + '\nType ``' + process.env.PREFIX + 'help stats`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }
    server = server.toLowerCase()
    if (!servers[server]) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + server + '\" is not a valid server!\n**Servers:** ' + getAvailableServers('stats').join(', ') + '\nType ``' + process.env.PREFIX + 'help online`` for more information.')
                .setThumbnail(thumbs.confused)
                .setColor('RED')
        )
        return
    }
    if (!player) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing player')
                .setDescription('You must type a player name!\nType ``' + process.env.PREFIX + 'help leaderboard`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }

    getPlayerStats(servers[server], player)
        .then(playerStats => {
            if (!playerStats.name)
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setTitle('Player not found')
                        .setDescription(`No player with the name of [${player}](https://www.gametracker.com/server_info/${servers[server].ip}/top_players/?query=${encodeUrl(player)}) was found on [${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip}).`)
                        .setThumbnail(thumbs.sad)
                        .setColor('RED')
                )
            else
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setTitle(playerStats.name + '\'s stats')
                        .setDescription(
                            '__**Rank:** ' + playerStats.rank + '__'
                            + '\n**Total score:** ' + playerStats.score
                            + '\n**Time played:** ' + (playerStats.timePlayed.split('.')[1] ? `${playerStats.timePlayed.split('.')[0]}h ${Math.floor(Number(playerStats.timePlayed.split('.')[1]) * 0.6)}min` : playerStats.timePlayed)
                            + '\n**Score/min:** ' + playerStats.scoreMin
                            + '\n**First joined:** ' + (!isNaN(new Date(playerStats.firstJoined)) ? timeago.format(new Date(playerStats.firstJoined)) + '\n(' + new Date(playerStats.firstJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ')' : playerStats.firstJoined)
                            + '\n**Last joined:** ' + (playerStats.lastJoined == 'Online Now' ? `**[Online Now](https://sgstats.glitch.me/redirect/${servers[server].ip})**` : (!isNaN(new Date(playerStats.lastJoined)) ? timeago.format(new Date(playerStats.lastJoined)) + '\n(' + new Date(playerStats.lastJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ')' : playerStats.lastJoined))
                        )
                        .setThumbnail(playerStats.graphURL)
                        .setColor('BLUE')
                )
        })
        .catch(err => {
            msg.channel.send(
                new Discord.RichEmbed()
                    .setTitle('Error')
                    .setDescription('Something happened while getting ' + player + '\' stats.\nPlease ping or open and add <@310491216393404416> to a support ticket if this continues __after some time__. Error:\n```js\n' + (err.toString().length > 250 ? err.toString().substr(0, 250) + ' [...]' : err.toString()) + '\n```')
                    .setThumbnail(thumbs.sad)
                    .setColor('DARK_RED')
            )

        })
}

exports.getPlayerStats = getPlayerStats