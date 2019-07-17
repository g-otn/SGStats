const Discord = require('discord.js')
const encodeUrl = require('encodeurl')
const Base64 = require('js-base64').Base64
const rp = require('request-promise')
const cheerio = require('cheerio')
const thumbs = require('../data/thumbnails.json')

async function searchPlayer(type, server, period, player) {
    // Requests to search page instead of generating a direct url so it can work with similar names
    let foundPlayer = {}
    let options = {
        headers: {
            'User-Agent': 'Request-Promise'
        }
    }
    // Tries to find player with similar name
    options.uri = `https://www.gametracker.com/server_info/${server.ip}/top_players/?query=${player}`
    await rp(options)
        .then(html => {
            let $ = cheerio.load(html)
            let selection = $('.table_lst a[href^="/player"]')
            foundPlayer.name = selection.eq(0).text().trim()
            if (foundPlayer.name) {
                foundPlayer.profile = 'https://www.gametracker.com' + selection.eq(0).attr('href')
                if (period)
                    foundPlayer.graphURL = `https://cache.gametracker.com/images/graphs/player_${type == 'h' ? 'time' : 'score'}.php?nameb64=${encodeUrl(Base64.encode(foundPlayer.name))}&host=${server.ip}&start=-1${period}`
            }
        })
    return foundPlayer
}

exports.sendPlayerGraph = (msg, type, server, period, player) => {
    // Data validation
    if (!period || (period.match(/^(day)$|^(week)$|^(month)$|^d$|^w$|^m$/) && !player)) {
        // Missing player name
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing player')
                .setDescription('You must type a player name!\nType ``' + process.env.PREFIX + 'help player' + type + '`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }
    // Data parsing
    if (!period.match(/^(day)$|^(week)$|^(month)$|^d$|^w$|^m$/)) {
        // Invalid period, period interpreted as player name (or start of it)
        player = period + (player ? ' ' + player : '')
        period = 'w' // Default when period is ommited
    } else // Valid period
        period = period[0] /* Abbreviates period to 'd', 'w' or 'm' */

    let unencodedPlayerName = player
    player = encodeUrl(player)

    searchPlayer(type, server, period, player)
        .then(foundPlayer => {
            // Send message
            if (foundPlayer.name)
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setDescription(`Showing [${foundPlayer.name}](${foundPlayer.profile})'s ${type == 'h' ? 'activity' : 'score'} on\n[${server.name}](https://www.gametracker.com/server_info/${server.ip}) throughout the ${period == 'd' ? 'day' : period == 'w' ? 'week' : period == 'm' ? 'month' : period}.\nFor similar names, click [here](https://www.gametracker.com/server_info/${server.ip}/top_players/?query=${player}).`)
                        .setImage(foundPlayer.graphURL)
                        .setColor('BLUE')
                )
            else
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setTitle('Player not found')
                        .setDescription(`No player with the name of [${unencodedPlayerName}](https://www.gametracker.com/server_info/${server.ip}/top_players/?query=${player}) was found on [${server.name}](https://www.gametracker.com/server_info/${server.ip}).`)
                        .setThumbnail(thumbs.sad)
                        .setColor('RED')
                )
        })
        .catch(err => {
            msg.channel.send(
                new Discord.RichEmbed()
                    .setTitle('Error')
                    .setDescription(`An error occured while getting ${unencodedPlayerName}'s graph`)
                    .setThumbnail(thumbs.sad)
                    .setColor('DARK_RED')
            )
        })
}

exports.searchPlayer = searchPlayer