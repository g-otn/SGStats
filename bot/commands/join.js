const Discord = require('discord.js')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers

exports.sendJoinLink = (msg, server) => {
    if (!server) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing server')
                .setDescription('You must choose a server!\n**Servers:** ' + getAvailableServers('join').join(', ') + '\nType ``' + process.env.PREFIX + 'help join`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }
    if (!servers[server] || !getAvailableServers('join', null).includes(server)) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + server + '\" is not a valid server!\n**Servers:** ' + getAvailableServers('join').join(', ') + '\nType ``' + process.env.PREFIX + 'help join`` for more information.')
                .setThumbnail(thumbs.confused)
                .setColor('RED')
        )
        return
    }

    msg.channel.send(
        new Discord.RichEmbed()
        .setDescription(`**[Click here to join ${servers[server].name}!](${process.env.BASEURI}/redirect/${server})**`)
        .setColor('GOLD')
    )
}