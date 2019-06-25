const Discord = require('discord.js')
const bot = new Discord.Client()
const commands = require('./commands')
const servers = require('./data/server_info.json')

bot.on("ready", () => console.log(bot.user.tag + " is online"))

bot.on("message", (msg) => {
    if (msg.author.bot || !msg.content.startsWith(process.env.PREFIX)) return

    let cmd = msg.content.split(' ')[0].substring(process.env.PREFIX.length)
    let args = msg.content.split(' ').slice(1)

    if (!cmd) return

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
        case 'leaderboard':
            commands.leaderboard.sendLeaderboard(msg, args)
            break
        case 'map':
            commands.data.sendData(msg, 2, args)
            break
        case 'on':
        case 'online':
            commands.online.sendOnline(msg, args[0])
            break
        case 'pop':
        case 'population':
            commands.data.sendData(msg, 1, args)
            break
        case 'rank':
            commands.data.sendData(msg, 3, args)
            break
        case 'stats':
            commands.stats.sendPlayerStatus(msg, args)
            break
        case 'steam':
        case 'steaminfo':
            commands.steaminfo.sendSteamInfo(msg, args[0])
            break
        default:
            // serverh and servers commands
            let serverNameInCommand = cmd.substr(0, cmd.length - 1)
            if (Object.keys(servers).some(serverName => serverName == serverNameInCommand)) {
                if (cmd[cmd.length - 1] == 'h') {
                    commands.player.sendPlayerGraph(msg, servers[serverNameInCommand], args[0], args.slice(1), 1)
                } else if (cmd[cmd.length - 1] == 's') {
                    commands.player.sendPlayerGraph(msg, servers[serverNameInCommand], args[0], args.slice(1), 2)
                }
                break
            }

            // Unknown command
            msg.channel.send('Unknown command, type ``' + process.env.PREFIX + 'help`` for a list of commands.')
    }
})

bot.login(process.env.TOKEN)