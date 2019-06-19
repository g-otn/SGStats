const Discord = require('discord.js')
const bot = new Discord.Client()
const prefix = require("./config.json").prefix

bot.on("ready", () => {
    console.clear()
    console.log("SGStats is online")
})

bot.on("message", (message) => {
    if (message.author.bot || !message.content.startsWith(prefix))
        return;
    
    let cmd = message.content.split(' ')[0].substring(1, cmd.length)
    let args = message.content.split(' ').slice(1)

    switch (cmd) {
        case 'forums':
            // require('./commands/forums')(bot, msg)
            break
        case 'help':
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