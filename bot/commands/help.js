const Discord = require('discord.js')
const pkg = require('../../package.json')
const commands = require('../data/commands.json')
const servers = require('../data/servers.json')

async function sendHelpMenu(msg, command) {
    let helpmsg = new Discord.RichEmbed()
    .setFooter('SGStats v' + pkg.version + ' by ' + pkg.author, 'https://cdn.discordapp.com/avatars/310491216393404416/97be88722638646a0be55b1fcb65bf7c.png?size=32')

    if (command && commands.list[command]) { // Command exists
        let commandInfo = commands.list[command]
        helpmsg
        .setTitle('The ' + command + ' command')
        .setDescription(commandInfo.description)
        if (commandInfo.server) { // Command uses server info
            let availableServers = []
            let requiredResources = []
            if (commandInfo.server.usesGamertrackerID)
                requiredResources.push('gamertrackerID')
            if (commandInfo.server.usesReebAPI)
                requiredResources.push('reebAPIHTMLTagDiscriminator')
            // Add to availableServers only the servers who match all requiredResources
            Object.keys(servers).forEach(serverKey => {
                if (requiredResources.every(requiredResource => {
                        return servers[serverKey][requiredResource]
                    }))
                    availableServers.push('``' + serverKey + '``')
            })
            helpmsg.addField('Syntax', commandInfo.syntax.join('\n') + '\nServers: ' + availableServers.join(', '))
        } else
            helpmsg.addField('Syntax', commandInfo.syntax.join('\n'), false)
        helpmsg.addField('Examples', commandInfo.examples.join('\n'), false)
        if (commandInfo.notes)
            helpmsg.addField('Notes', commandInfo.notes, false)
        helpmsg.setColor(commands.categories.filter(category => {
            return category.name == commands.list[command].category
        })[0].color)
    } else {                                // Unknown or no command
        helpmsg
        .setTitle('SGStats Commands')
        .setColor('BLUE')
        let description = 'Use ``' + process.env.PREFIX + 'help <command>`` for help on a specific command\n'
        commands.categories.forEach(category => {
            helpmsg.addField(category.name + ' commands', '```\n' + Object.keys(commands.list).filter(commandKey => {
                return commands.list[commandKey].category == category.name
            }).join('\n') + '\n```', false)
        });
        helpmsg.setDescription(description)
    }
    msg.channel.send(helpmsg)
}

exports.sendHelpMenu = sendHelpMenu