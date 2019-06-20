const Discord = require('discord.js')

module.exports = (msg, command) => {


    switch (command) {
        
        default: // unknown or undefined
        sendHelpMenu(msg)
        return
    }
}

function sendHelpMenu(msg) {
    let pkg = require('../../package.json')
    msg.channel.send(
        new Discord.RichEmbed()
        .setTitle('SGStats Commands')
        .setDescription(
            'Use ``' + process.env.PREFIX + 'help <command>`` for more help on a specific command'
        )
        .set
        .setColor('BLUE')
        .setFooter('SGStats v' + pkg.version + ' by ' + pkg.author,
            'https://cdn.discordapp.com/avatars/310491216393404416/97be88722638646a0be55b1fcb65bf7c.png?size=32'
        )
    )
}
