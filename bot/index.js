const Discord = require('discord.js')
const bot = new Discord.Client()
const commands = require('./commands')
const servers = require('./data/servers.json')
const thumbs = require('./data/thumbnails.json')

bot.on("ready", () => {
    console.log(bot.user.tag + " is online with prefix '" + process.env.PREFIX + "'")
    bot.user.setPresence({ game: { name: process.env.PREFIX + 'help' } })
    setInterval(() => { commands.forums.checkForums(bot) }, 600000)
})

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
            if (msg.author.id == process.env.FORUMS_CHECK_ADMIN_ID)
                commands.forums.checkForums(bot, args[0], args[1])
            break
        case 'help':
            commands.help.sendHelpMenu(msg, args[0])
            break
        case 'hue':
            commands.hue.sendTestMessage(msg)
            break
        case 'j':
        case 'join':
            commands.join.sendJoinLink(msg, args[0])
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
            commands.online2.sendOnline(msg, args[0])
            break
        case 'on2':
        case 'online2':
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
        // case "scp":
        // case "scpsl":
        //     commands.kigenSCPSL.sendSCPSLServerInfo(msg, servers['scp'].ip)
        //     break
        case 'stats':
            commands.stats.sendPlayerStats(msg, args[0], args.slice(1).join(' '))
            break
        case 'steam':
        case 'steaminfo':
            commands.steaminfo.sendSteamInfo(msg, args.join(' '))
            break
        default:
            let serverKeys = Object.keys(servers)

            // server command
            if (commands.help.getAvailableServers('server', null).includes(cmd)) {
                commands.server.sendServerInfo(msg, cmd)
                break
            }

            // playerh and players command
            let serverNameInCommand = cmd.substr(0, cmd.length - 1)
            if (commands.help.getAvailableServers('playerh', null).includes(serverNameInCommand)) {
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