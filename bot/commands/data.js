const Discord = require('discord.js')
const commands = require('../data/commands.json')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers

function getGraphURL(cmd, period, server) {
    switch (cmd) {
        case 'map':
            return `https://cache.gametracker.com/images/graphs/server_maps.php?GSID=${servers[server].gamertrackerID}&start=-1${period}`
        case 'rank':
            return `https://cache.gametracker.com/images/graphs/server_rank.php?GSID=${servers[server].gamertrackerID}&start=-1${period}`
        case 'population':
            return `https://cache.gametracker.com/images/graphs/server_players.php?GSID=${servers[server].gamertrackerID}&start=-1${period}`
    }
}

exports.sendData = (msg, cmd, period, server) => {
    // Data validation
    if (!period && !server) {
        // Missing server
        msg.channel.send(
            new Discord.RichEmbed()
            .setTitle('Missing server')
            .setDescription('You must choose a server!\n**Servers:** ' + getAvailableServers(cmd).join(', ') + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
            .setThumbnail(thumbs.giggle)
            .setColor('RED')
        )
        return
    }
    period = period.toLowerCase()
    if (!server) {
        // server is undefined, so period must contain a server name and if it contains, the server must support/have gamertrackerID
        if (period.match(/^(day)$|^(week)$|^(month)$|^d$|^w$|^m$/)) {
            // Correct period but missing server name
            msg.channel.send(
                new Discord.RichEmbed()
                .setTitle('Missing server')
                .setDescription('You must choose a server!\n**Servers:** ' + getAvailableServers(cmd).join(', ') + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
            )
            return
        }

        if (!Object.keys(servers).some(serverName => {
            return serverName == period
        }) || !servers[period].gamertrackerID) {
            // Invalid server name inside period variable
            msg.channel.send(
                new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + period + '\" is not a valid server!\n**Servers:** ' + getAvailableServers(cmd).join(', ') + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
                .setThumbnail(thumbs.confused)
                .setColor('RED')
            )
            return
        }

        // period contains valid server name
        server = period 
        switch (cmd) {
            case 'map':
            case 'rank':
                period = 'm'
                break
            case 'population':
                period = 'd'
        }
    } else { // period && server
        server = server.toLowerCase()
        if (!period.match(/^(day)$|^(week)$|^(month)$|^d$|^w$|^m$/)) {
            // Invalid period (and full command is used)
            msg.channel.send(
                new Discord.RichEmbed()
                .setTitle('Invalid period')
                .setDescription('\"' + period + '\" is not a valid period!\n' + commands.list[cmd].syntax[1] + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
                .setThumbnail(thumbs.confused)
                .setColor('RED')
            )
            return
        }
        if (!Object.keys(servers).some(serverName => {
            return serverName == server
        }) || !servers[server].gamertrackerID) {
            // Invalid server name inside server variable
            msg.channel.send(
                new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + server + '\" is not a valid server!\n**Servers:** ' + getAvailableServers(cmd).join(', ') + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
                .setThumbnail(thumbs.sad)
                .setColor('RED')
            )
            return
        }
    }

    let graphURL = getGraphURL(cmd, period[0] /* Transform to d|w|m */, server)

    // Send message
    msg.channel.send(
        new Discord.RichEmbed()
        .setDescription(`Showing [${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip}) ${cmd == 'map' ? 'maps' : cmd}\nthroughout the ${period == 'd' ? 'day' : period == 'w' ? 'week' : period == 'm' ? 'month' : period}. **[Join now!](https://sgstats.glitch.me/redirect/${servers[server].ip})**`)
        .setImage(graphURL)
        .setColor('GOLD')
    )
}

exports.getGraphURL = getGraphURL