const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers

async function getServerInfo(server) {
    let getServerInfo

    await rp({
        uri: 'https://status.smithtainment.com/api/json.php',
        qs: {
            type: 'info',
            ip: server.ip,
            key: process.env.SMITHTAINMENT_API_KEY
        },
        json: true
    })
        .then(data => {
            if (!data || data.length === 0)
                throw new Error(`No response data from API. IP: \`${server.ip}\`, type: \`info\``)
            
            serverInfo = data
        })

    return serverInfo
}

exports.sendServerInfo = (msg, server) => {
    getServerInfo(servers[server])
        .then(serverInfo =>
            msg.channel.send(
                new Discord.RichEmbed()
                    .setTitle(servers[server].name + ' status')
                    .setURL(`${process.env.BASEURI}/redirect/${server}`)
                    .setDescription(
                        `**Name:** ${serverInfo.HostName}`
                        + `\n**IP:** ${servers[server].ip}`
                        + `\n**Map:** ${serverInfo.Map}`
                        + `\n**Players:** ${serverInfo.Players}/${serverInfo.MaxPlayers} **[Join now!](${process.env.BASEURI}/redirect/${server})**`

                    )
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