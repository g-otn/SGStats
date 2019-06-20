const Discord = require('discord.js')
const bot = new Discord.Client()

bot.on("ready", () => console.log(bot.user.tag + " is online"))

bot.on("message", (msg) => {
    if (msg.author.bot || !msg.content.startsWith(process.env.PREFIX))
        return;

    let cmd = msg.content.split(' ')[0].substring(process.env.PREFIX.length)
    let args = msg.content.split(' ').slice(1)
    console.log('cmd:', cmd)
    console.log('args:', args)

    switch (cmd) {
        case 'forums':
            // require('./commands/forums')(bot, msg)
            break
        case 'help':
            require('./commands/help')(msg, args[0])
            break
        case 'hue':
            require('./commands/hue')(msg)
            break
        case 'lb':
        case 'leaderboard':
            require('./commands/leaderboard')(msg, args)
            break;
        case 'on':
        case 'online':
            require('./commands/online')(msg, args[0])
            break
        case 'pop':
        case 'population':
            require('./commands/population')(msg, args)
            break
        case 'server':
        case 'cs':
        case 'csgo':
        case 'mc':
        case 'mcttt':
        case 'ph':
        case 'prophunt':
        case 'va':
        case 'vanilla':
            require('./commands/server')(msg, cmd, args)
            break
        case 'serverh':
        case 'csh':
        case 'csgoh':
        case 'mch':
        case 'mcttth':
        case 'phh':
        case 'prophunth':
        case 'vah':
        case 'vanillah':
            require('./commands/serverh')(msg, cmd, args)
            break
        case 'stats':
            require('./commands/stats')(msg, args)
            break
        case 'steam':
        case 'steaminfo':
            require('./commands/steaminfo')(msg, args[0])
            break
        default:
    }
})

bot.login(process.env.TOKEN)