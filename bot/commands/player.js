const Discord = require('discord.js')
const encodeUrl = require('encodeurl')
const Base64 = require('js-base64').Base64
const rp = require('request-promise')
const cheerio = require('cheerio')
const thumbs = require('../data/thumbnails.json')

async function searchPlayer(graphType, server, period, player) {
    // Requests to search page instead of generating a direct url so it can work with similar names
    let foundPlayer = {}
    let options = {
        headers: {
            'User-Agent': 'Request-Promise'
        }
    }
    // Tries to find player with similar name
    options.uri = `https://www.gametracker.com/server_info/${server.ip}/top_players/?query=${encodeUrl(player)}`
    await rp(options)
        .then(html => {
            let $ = cheerio.load(html)
            let firstRow = $('.table_lst tr:nth-child(2)').children() // First table row (excluding columns titles row)
            foundPlayer = {
                rank: firstRow.eq(0).text().trim(),
                name: firstRow.eq(1).text().trim(),
                score: firstRow.eq(3).text().trim(),
                timePlayed: firstRow.eq(4).text().trim(),
                scoreMin: firstRow.eq(5).text().trim()
            }
            if (foundPlayer.name) {
                foundPlayer.profile = 'https://www.gametracker.com' + firstRow.eq(1).children().eq(0).attr('href')
                if (graphType && period)
                    foundPlayer.graphURL = `https://cache.gametracker.com/images/graphs/player_${graphType == 'h' ? 'time' : 'score'}.php?nameb64=${encodeUrl(Base64.encode(foundPlayer.name))}&host=${server.ip}&start=-1${period}&request=0${Math.floor(Math.random() * 9999999999999999)}`
            }
        })
    return foundPlayer
}

exports.sendPlayerGraph = (msg, graphType, server, period, player) => {
    // Data validation
    if (!period || (period.match(/^(day)$|^(week)$|^(month)$|^d$|^w$|^m$/i) && !player)) {
        // Missing player name
        msg.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                    .setTitle('Missing player')
                    .setDescription('You must type a player name!\nType ``' + process.env.PREFIX + 'help player' + graphType + '`` for more information.')
                    .setThumbnail(thumbs.giggle)
                    .setColor('RED')
            ]
        })
        return
    }
    // Data parsing
    if (!period.match(/^(day)$|^(week)$|^(month)$|^d$|^w$|^m$/i)) {
        // Invalid period, period interpreted as player name (or start of it)
        player = period + (player ? ' ' + player : '')
        period = 'w' // Default when period is ommited
    } else // Valid period
        period = period[0].toLowerCase() /* Abbreviates period to 'd', 'w' or 'm' */

    let unencodedPlayerName = player
    player = encodeUrl(player)

    searchPlayer(graphType, server, period, player)
        .then(foundPlayer => {
            // Send message
            if (foundPlayer.name)
                msg.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setDescription(`Showing [${foundPlayer.name}](${foundPlayer.profile})'s ${graphType == 'h' ? 'activity' : 'score'} on\n[${server.name}](https://www.gametracker.com/server_info/${server.ip}) throughout the ${period == 'd' ? 'day' : period == 'w' ? 'week' : period == 'm' ? 'month' : period}.\nFor similar names, click [here](https://www.gametracker.com/server_info/${server.ip}/top_players/?query=${player}).`)
                            .setImage(foundPlayer.graphURL)
                            .setColor('BLUE')
                    ]
                })
            else
                msg.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setTitle('Player not found')
                            .setDescription(`No player with the name of [${unencodedPlayerName}](https://www.gametracker.com/server_info/${server.ip}/top_players/?query=${player}) was found on [${server.name}](https://www.gametracker.com/server_info/${server.ip}).`)
                            .setThumbnail(thumbs.sad)
                            .setColor('RED')
                    ]
                })
        })
        .catch(err =>
            msg.channel.send({
                embeds: [
                    new Discord.MessageEmbed()
                        .setTitle('Error')
                        .setDescription('Something happened while getting ' + unencodedPlayerName + '\'s graph.\nPlease ping or open and add <@310491216393404416> to a support ticket if this continues __after some time__. Error:\n```js\n' + (err.toString().length > 250 ? err.toString().substr(0, 250) + ' [...]' : err.toString()) + '\n```')
                        .setThumbnail(thumbs.sad)
                        .setColor('DARK_RED')
                ]
            })
        )
}

exports.searchPlayer = searchPlayer