const Discord = require('discord.js')
const bot = new Discord.Client()

bot.on("ready", () => console.log(bot.user.tag + " is online"))

bot.on("message", (msg) => {
    if (msg.author.bot || !msg.content.startsWith(process.env.PREFIX))
        return;

    let cmd = msg.content.substring(0, msg.content.indexOf(' '))
    let args = msg.content.indexOf(' ').split(' ').slice(1)
    console.log('cmd:', cmd)
    console.log('args:', args)

    switch (cmd) {
        case 'forums':
            // require('./commands/forums')(bot, msg)
            break
        case 'help':
            break
        case 'hue':
            require('./commands/hue')(msg)
            break
        case 'lb':
        case 'leaderboard':
            break;
        case 'on':
        case 'online':
            break
        case 'pop':
        case 'population':
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
            break
        case 'serverh':
        case 'csh':
        case 'csgoh':
        case 'mch':
        case 'mcttth':
        case 'ph':
        case 'prophunth':
        case 'vah':
        case 'vanillah':
        case 'stats':
            break
        case 'steam':
        case 'steaminfo':
            break
        default:
    }
})

bot.login(process.env.TOKEN)