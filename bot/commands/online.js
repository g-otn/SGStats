const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers
const getGraphURL = require('./data').getGraphURL

async function getOnlinePlayers(serverIP) {
    let options = {
        uri: `https://www.gametracker.com/server_info/${serverIP}/`,
        headers: { 'User-Agent': 'Request-Promise' }
    }
    let onlinePlayers = []
    await rp(options)
        .then(html => {
            const $ = cheerio.load(html)
            let selection = $('#HTML_online_players tr').slice(1) // table rows without first row (column titles)
            for (let i = 0; i < selection.length; i++) {
                let rowCells = selection.eq(i).children()
                let player = {
                    rank: rowCells.eq(0).text().trim().replace('.', ''),
                    name: rowCells.eq(1).text().trim(),
                    score: rowCells.eq(2).text().trim(),
                    time: rowCells.eq(3).text().trim().split(':'),
                }

                // Parses hours and minutes
                player.time = (isNaN(player.time[player.time.length - 3]) ? 0 : Number(player.time[player.time.length - 3]) * 60) + Number(player.time[player.time.length - 2])

                if (player.name) // Discards rows with blank names
                    onlinePlayers.push(player)
            }
        })
    return onlinePlayers
}

exports.sendOnline = (msg, server) => {
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
    server = server.toLowerCase() // Removes case sensitivity
    if (!getAvailableServers('online').some(avaliableServer => { return avaliableServer == '``' + server + '``' })) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + server + '\" is not a valid server!\n**Servers:** ' + getAvailableServers('online').join(', ') + '\nType ``' + process.env.PREFIX + 'help online`` for more information.')
                .setThumbnail(thumbs.confused)
                .setColor('RED')
        )
        return
    }

    getOnlinePlayers(servers[server].ip)
        .then(onlinePlayers => {
            if (onlinePlayers.length > 0) {
                onlinePlayers = onlinePlayers.sort((a, b) => { return a.time < b.time ? 1 : (a.time > b.time ? -1 : 0) })
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setDescription(`Showing [${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip}) online players\n and population throughout the day. **[Join now!](https://sgstats.glitch.me/redirect/${server})**`)
                        .addField('Name', onlinePlayers.map(player => player.name).join('\n'), true)
                        .addField('Time played', onlinePlayers.map(player => (player.time / 60 >= 1 ? Math.floor(player.time / 60) + 'h ' : '') + player.time % 60 + 'min').join('\n'), true)
                        .setImage(getGraphURL('population', 'day', server))
                        .setColor('GOLD')
                )
            }
            else
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setTitle('No players online')
                        .setDescription(`There are no players online on\n[${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip}). **[Join now!](https://sgstats.glitch.me/redirect/${server})**`)
                        .setImage(getGraphURL('population', 'day', server))
                        .setColor('GOLD')
                )
        })
        .catch(err => {
            msg.channel.send(
                new Discord.RichEmbed()
                    .setTitle('Error')
                    .setDescription('Something happened while getting the online players.\nPlease ping or open and add <@310491216393404416> to a support ticket if this continues __after some time__. Error:\n```js\n' + (err.toString().length > 250 ? err.toString().substr(0, 250) + ' [...]' : err.toString()) + '\n```')
                    .setThumbnail(thumbs.sad)
                    .setColor('DARK_RED')
            )
        })
}

exports.getOnlinePlayers = getOnlinePlayers