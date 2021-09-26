const Discord = require('discord.js')
const timeago = require('timeago.js')
const version = require('../../package.json').version
const commands = require('../data/commands.json')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const onlineSince = new Date()

function getAvailableServers(commandName, serverNameWrapper = '``') {
    let command = commands.list[commandName]
    let availableServers = []
    let requiredResources = command.requiredProperties

    // Add to availableServers only the servers who match all requiredResources
    Object.keys(servers).forEach(serverKey => {
        if (requiredResources.every(requiredResource => {
            return servers[serverKey][requiredResource]
        }))
            availableServers.push(serverNameWrapper ? serverNameWrapper + serverKey + serverNameWrapper : serverKey)
    })
    return availableServers
}

exports.sendHelpMenu = (msg, commandName) => {
    let helpmsg = new Discord.MessageEmbed()
        .setFooter(`SGStats v${version} by Skeke#2155 - Online since ${timeago.format(onlineSince)}`, 'https://cdn.discordapp.com/avatars/310491216393404416/97be88722638646a0be55b1fcb65bf7c.png?size=32')

    if (commandName && commands.list[commandName]) { // Command exists
        let command = commands.list[commandName]
        helpmsg
            .setTitle('The ' + commandName + ' command')
            .setDescription(command.description)

        if (command.requiredProperties.length > 0) // Command requires specific server info
            helpmsg.addField('Syntax', command.syntax.join('\n').split('$').join(process.env.PREFIX) + '\n**Servers:** ' + getAvailableServers(commandName).join(', '))
        else
            helpmsg.addField('Syntax', command.syntax.join('\n').split('$').join(process.env.PREFIX), false)
        helpmsg.addField('Examples', command.examples.join('\n').split('$').join(process.env.PREFIX), false)
        if (command.notes)
            helpmsg.addField('Notes', command.notes, false)
        helpmsg.setColor(commands.categories.filter(category => {
            return category.name == commands.list[commandName].category
        })[0].color)
    } else {                                // Unknown or no command
        helpmsg
            .setTitle('SGStats')
            .setURL(`${process.env.BASEURI}`)
            .setColor('DARK_BLUE')

        let description = 'Use ``' + process.env.PREFIX + 'help <command>`` for help on a specific command.\nCheck out the [changelog](' + process.env.BASEURI + ') and its [source code](https://github.com/g-otn/SGStats)!'
        commands.categories.forEach(category => {
            helpmsg.addField(category.name + ' commands', '```' + category.language + '\n' + Object.keys(commands.list).filter(commandKey => {
                return commands.list[commandKey].category == category.name
            }).join('\n') + '\n```', false)
        });

        helpmsg
            .setDescription(description)
            .setThumbnail(thumbs.ok)
    }

    msg.channel.send({
        embeds: [
            helpmsg
        ]
    })
}

exports.getAvailableServers = getAvailableServers