const Discord = require('discord.js')
const pkg = require('../../package.json')
const info = require('../data/commands_info.json')

async function sendHelpMenu(msg, command) {
    let helpmsg = new Discord.RichEmbed()
    .setFooter('SGStats v' + pkg.version + ' by ' + pkg.author, 'https://cdn.discordapp.com/avatars/310491216393404416/97be88722638646a0be55b1fcb65bf7c.png?size=32')

    if (command && info[command]) { // Command exists
        
    } else {                        // Unknown or no command
        helpmsg
        .setTitle('SGStats Commands')
        .setDescription('Use ``' + process.env.PREFIX + 'help <command>`` for help on a specific command')
        .setColor('BLUE')
        msg.channel.send(helpmsg)
    }
}

exports.sendHelpMenu = sendHelpMenu