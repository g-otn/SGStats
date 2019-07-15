const Discord = require('discord.js')
const encodeUrl = require('encodeurl')
const rp = require('request-promise')
const cheerio = require('cheerio')

async function searchPlayer(type, server, period, player) {
    // Requests to search page instead of generating a direct url so it can work with similar names
    let playerData = {}
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
            let selection = $('.table_lst a[href^="/player/"]')
            playerData.foundPlayer = selection.eq(0).text()
        })
    if (playerData.foundPlayer) {
        playerData.foundPlayer = playerData.foundPlayer.trim()
    }
    return playerData
}

exports.sendPlayerGraph = (msg, type, server, period, player) => {
    console.log('type:', type, '\nserver:', server.name, '\nperiod:', period, '\nplayer:', player)
    // Data validation
    if (!period || (period.match(/^(day)$|^(week)$|^(month)$|^d$|^w$|^m$/) && !player)) {
        // Missing player name
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing player')
                .setDescription('You must type a player name!\nType ``' + process.env.PREFIX + 'help player' + type + '`` for more information.')
                .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_giggle.png?v=1561883974179')
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

    console.log('type:', type, '\nserver:', server.name, '\nperiod:', period, '\nplayer:', player)

    searchPlayer(type, server, period, player)
    .then(playerData => {

        console.log(playerData)
    
        // Send message
        msg.channel.send(
            new Discord.RichEmbed()
                .setDescription(`Showing ${playerData.foundPlayer}'s ${type == 'h' ? 'hours' : 'score'} on [${server.name}](https://www.gametracker.com/server_info/${server.ip}) throughout the ${period == 'd' ? 'day' : period == 'w' ? 'week' : period == 'm' ? 'month' : period}. For similar names, click [here](https://www.gametracker.com/server_info/${server.ip}/top_players/?query=${encodeUrl(player)}).`)
                .setImage(playerData.graphURL)
                .setColor('GOLD')
        )
    })
}

exports.searchPlayer = searchPlayer