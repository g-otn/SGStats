const Discord = require('discord.js')
const timeago = require('timeago.js')
const version = require('../../package.json').version
const commands = require('../data/commands.json')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const onlineSince = new Date()

function getAvailableServers(command) {
    let commandInfo = commands.list[command]  
    let availableServers = []
    let requiredResources = []
    if (commandInfo.server.usesGamertrackerID)
        requiredResources.push('gamertrackerID')
    if (commandInfo.server.usesSmithtainmentStatusAPI)
        requiredResources.push('smithtainmentStatusAPIName')
    // Add to availableServers only the servers who match all requiredResources
    Object.keys(servers).forEach(serverKey => {
        if (requiredResources.every(requiredResource => {
                return servers[serverKey][requiredResource]
            }))
            availableServers.push('``' + serverKey + '``')
    })
    return availableServers
}

exports.sendHelpMenu = (msg, command) => {
    let helpmsg = new Discord.RichEmbed()
    .setFooter(`SGStats v${version} by Skeke#2155 - Online since ${timeago.format(onlineSince)}`, 'https://cdn.discordapp.com/avatars/310491216393404416/97be88722638646a0be55b1fcb65bf7c.png?size=32')

    if (command && commands.list[command]) { // Command exists
        let commandInfo = commands.list[command]
        helpmsg
        .setTitle('The ' + command + ' command')
        .setDescription(commandInfo.description)

        if (commandInfo.server) // Command requires specific server info
            helpmsg.addField('Syntax', commandInfo.syntax.join('\n').split('$').join(process.env.PREFIX) + '\n**Servers:** ' + getAvailableServers(command).join(', '))
        else
            helpmsg.addField('Syntax', commandInfo.syntax.join('\n').split('$').join(process.env.PREFIX), false)
        helpmsg.addField('Examples', commandInfo.examples.join('\n').split('$').join(process.env.PREFIX), false)
        if (commandInfo.notes)
            helpmsg.addField('Notes', commandInfo.notes, false)
        helpmsg.setColor(commands.categories.filter(category => {
            return category.name == commands.list[command].category
        })[0].color)
    } else {                                // Unknown or no command
        helpmsg
        .setTitle('SGStats')
        .setURL('https://sgstats.glitch.me/')
        .setColor('DARK_BLUE')

        let description = 'Use ``' + process.env.PREFIX + 'help <command>`` for help on a specific command.\nCheck out the [changelog](https://sgstats.glitch.me/)!'
        commands.categories.forEach(category => {
            helpmsg.addField(category.name + ' commands', '```' + category.language + '\n' + Object.keys(commands.list).filter(commandKey => {
                return commands.list[commandKey].category == category.name
            }).join('\n') + '\n```', false)
        });

        helpmsg
        .setDescription(description)
        .setThumbnail(thumbs.ok)
    }

    msg.channel.send(helpmsg)
}

exports.getAvailableServers = getAvailableServers