const Discord = require('discord.js')
const commands = require('../data/commands.json')
const servers = require('../data/servers.json')
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

function sendData(msg, cmd, period, server) {
    // Data validation
    if (!period && !server) {
        // Missing server
        msg.channel.send(
            new Discord.RichEmbed()
            .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_giggle.png?v=1561883974179')
            .setTitle('Missing server')
            .setDescription('You must choose a server!\n**Examples:**\n' + commands.list[cmd].examples.join('\n').split('$').join(process.env.PREFIX) + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
            .setColor('RED')
        )
        return
    }
    period = period.toLowerCase()
    if (!server) {
        // server is undefined, so period must contain a server name and if it contains, the server must support/have gamertrackerID
        if (!Object.keys(servers).some(serverName => {
            return serverName == period
        }) || !servers[period].gamertrackerID) {
            // Invalid server name inside period variable
            msg.channel.send(
                new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + period + '\" is not a valid server!\n**Servers:** ' + getAvailableServers(cmd).join(', ') + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
                .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_confusion.png?v=1561883974127')
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
        if (!period.match(/(day)|(week)|(month)|d|w|m/g)) {
            // Invalid period (and full command is used)
            msg.channel.send(
                new Discord.RichEmbed()
                .setTitle('Invalid period')
                .setDescription('\"' + period + '\" is not a valid period!\n' + commands.list[cmd].syntax[1] + '\nType ``' + process.env.PREFIX + 'help ' + cmd + '`` for more information.')
                .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_confusion.png?v=1561883974127')
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
                .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_confusion.png?v=1561883974127')
                .setColor('RED')
            )
            return
        }
    }

    let graphURL = getGraphURL(cmd, period[0] /* Transform to d|w|m */, server)

    // Send message
    msg.channel.send(
        new Discord.RichEmbed()
        .setDescription(`Showing [${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip}) ${cmd == 'map' ? 'maps' : cmd} throughout the ${period == 'd' ? 'day' : period == 'w' ? 'week' : period == 'm' ? 'month' : period}`)
        .setImage(graphURL)
        .setColor('GOLD')
    )
}

exports.getGraphURL = getGraphURL
exports.sendData = sendData