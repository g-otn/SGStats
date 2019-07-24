const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers

async function getServerInfo(server) {
    let serverInfo
    let options = { 
        uri: 'https://status.smithtainment.com/api/' + server.smithtainmentStatusAPIName,
        headers: { 'User-Agent': 'Request-Promise' } 
    }
    await rp('https://status.smithtainment.com/api/' + server.smithtainmentStatusAPIName)
        .then(html => {
            let $ = cheerio.load(html)
            let data = $('.server-status [class*=grohsfabian_game_server_status]').contents()
            serverInfo = {
                name: data.eq(2).text(),
                status: data.eq(5).text(),
                ip: data.eq(8).text(),
                players: data.eq(11).text(),
            }
        })
    
    return serverInfo
}

exports.sendServerInfo = (msg, server) => {
    getServerInfo(server)
        .then(serverInfo =>
            msg.channel.send(
                new Discord.RichEmbed()
                .setDescription()
                .setColor('GOLD')
            )
        )
        .catch(err =>
            msg.channel.send(
                new Discord.RichEmbed()
                    .setTitle('Error')
                    .setDescription('Something happened while getting ' + server.name + ' information.\nPlease ping or open and add <@310491216393404416> to a support ticket if this continues __after some time__. Error:\n```js\n' + (err.toString().length > 250 ? err.toString().substr(0, 250) + ' [...]' : err.toString()) + '\n```')
                    .setThumbnail(thumbs.sad)
                    .setColor('DARK_RED')
            )
        )
}