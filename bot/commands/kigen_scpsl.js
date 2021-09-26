const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')

async function getSCPSLServerInfo(ip) {
    let scpServerInfo

    await rp('https://kigen.co/scpsl/browser.php?table=y')
        .then(html => {
            const $ = cheerio.load(html);
            const serverRows = $('#serverlist tbody tr')
            serverRows.each((i, elem) => {
                if (ip === $(elem).children('td:nth-child(1)').text().trim()) {
                    scpServerInfo = {
                        ip,
                        titleText: $(elem).children('td:nth-child(2)').text(),
                        infoPBUrl: $(elem).children('td:nth-child(3)').children('a').attr('href'),
                        players: $(elem).children('td:nth-child(4)').text()
                    }
                    return false;
                }
            })
        })

    return scpServerInfo
}

exports.sendSCPSLServerInfo = (msg, ip) => {
    if (!ip && !ip.trim())
        return;

    const server = 'scp'

    getSCPSLServerInfo(ip)
        .then(scpServerInfo => {
            if (scpServerInfo) {
                msg.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setTitle(servers[server].name + ' status')
                            .setURL(`${process.env.BASEURI}/redirect/${server}`)
                            .setDescription(
                                `**Name:** \`${scpServerInfo.titleText}\``
                                + `\n**IP:** ${servers[server].ip}`
                                + `\n**[Info](${scpServerInfo.infoPBUrl})**`
                                + `\n**Players:** ${scpServerInfo.players} **[Join now!](${process.env.BASEURI}/redirect/${server})**`

                            )
                            .setColor('GOLD')
                    ]
                })
            } else {
                msg.channel.send({
                    embeds: [
                        new Discord.MessageEmbed()
                            .setTitle('Error')
                            .setDescription('Server not found...')
                            .setThumbnail(thumbs.sad)
                            .setColor('DARK_RED')
                    ]
                })
            }
        })
        .catch(err =>
            msg.channel.send({
                embeds: [
                    new Discord.MessageEmbed()
                        .setTitle('Error')
                        .setDescription('Something happened while getting ' + server + ' information.\nPlease ping or open and add <@310491216393404416> to a support ticket if this continues __after some time__. Error:\n```js\n' + (err.toString().length > 250 ? err.toString().substr(0, 250) + ' [...]' : err.toString()) + '\n```')
                        .setThumbnail(thumbs.sad)
                        .setColor('DARK_RED')
                ]
            })
        )
}