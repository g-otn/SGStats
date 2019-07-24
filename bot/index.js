const Discord = require('discord.js')
const bot = new Discord.Client()
const commands = require('./commands')
const servers = require('./data/servers.json')
const thumbs = require('./data/thumbnails.json')

bot.on("ready", () => console.log(bot.user.tag + " is online"))

bot.on("message", (msg) => {
    if (msg.author.bot || !msg.content.startsWith(process.env.PREFIX)) return

    let cmd = msg.content.split(' ')[0].substring(process.env.PREFIX.length).toLowerCase()
    if (!cmd) return
    let args = msg.content.split(' ').slice(1)

    // Removes args first empty positions
    while (args.length > 0 && !args[0])
        args = args.slice(1)

    switch (cmd) {
        case 'forums':
            commands.forums.checkSection(bot, msg, args)
            break
        case 'help':
            commands.help.sendHelpMenu(msg, args[0])
            break
        case 'hue':
            commands.hue.sendTestMessage(msg)
            break
        case 'lb':
        case 'lead':
        case 'leaderboard':
            commands.leaderboard.sendLeaderboard(msg, args[0], args[1], args.slice(2).join(' '))
            break
        case 'pop':
            cmd = 'population' // Removes abbreviation
        case 'population':
        case 'map':
        case 'rank':
            commands.data.sendData(msg, cmd, args[0], args[1])
            break
        case 'on':
        case 'online':
            commands.online.sendOnline(msg, args[0])
            break
        case 'playerh':
            commands.help.sendHelpMenu(msg, 'playerh')
            break
        case 'players':
            commands.help.sendHelpMenu(msg, 'players')
            break
        case 'server':
            commands.help.sendHelpMenu(msg, 'server')
            break
        case 'stats':
            commands.stats.sendPlayerStats(msg, args[0], args.slice(1).join(' '))
            break
        case 'steam':
        case 'steaminfo':
            commands.steaminfo.sendSteamInfo(msg, args[0])
            break
        default:
            let serverKeys = Object.keys(servers)

            // server command
            if (serverKeys.some(serverName => serverName == cmd)) {
                commands.server.sendServerInfo(msg, servers[cmd])
                break
            }

            // playerh and players command
            let serverNameInCommand = cmd.substr(0, cmd.length - 1)
            if (serverKeys.some(serverName => serverName == serverNameInCommand)) {
                if (cmd[cmd.length - 1] == 'h')
                    commands.player.sendPlayerGraph(msg, cmd[cmd.length - 1], servers[serverNameInCommand], args[0], args.slice(1).join(' '))
                else if (cmd[cmd.length - 1] == 's')
                    commands.player.sendPlayerGraph(msg, cmd[cmd.length - 1], servers[serverNameInCommand], args[0], args.slice(1).join(' '))
                break
            }

            // Unknown command
            msg.channel.send(
                new Discord.RichEmbed()
                    .setTitle('Unknown command')
                    .setDescription('"' + cmd + '" is not a known command.\nType ``' + process.env.PREFIX + 'help`` for a list of commands.')
                    .setThumbnail(thumbs.confused)
                    .setColor('RED')
            )
    }
})

bot.login(process.env.TOKEN)