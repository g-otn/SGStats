const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers

async function getOnlinePlayers(serverIP) {
    let options = {
        uri: `https://www.gametracker.com/server_info/${serverIP}/`,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    }
    let onlinePlayers = []
    await rp(options)
        .then(html => {
            const $ = cheerio.load(html)
            let selection = $('#HTML_online_players tr').slice(1)
            if (selection) {
                selection.each((i, elem) => {
                    console.log(i, elem.text())
                    onlinePlayers.push({
                        rank: elem.children().eq(0).text(),
                        name: elem.children().eq(1).text(),
                        score: elem.children().eq(2).text(),
                        time: elem.children().eq(3).text(),
                    })
                    console.log(onlinePlayers[onlinePlayers.length - 1])
                })
            }
        })
        .catch(err => onlinePlayers.err = err)
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
            msg.channel.send(
                new Discord.RichEmbed()
                    .setDescription(JSON.stringify(onlinePlayers, null, '\t'))
            )
        })
}

exports.getOnlinePlayers = getOnlinePlayers