/*
    Command: say
    Function: Sends custom message to a channel (dev only)
    Author: Skeke#2155
*/
const bot = require('../bot.js').bot //sends message

async function sendMessage(senderChannel, args) {
    var channel = args[0]
    var text = args.slice(1)
    
    if (text == "" || text == undefined) {
        senderChannel = senderChannel.toString().replace().replace("<#", "").replace(">", "")
        bot.channels.get(senderChannel).send(channel)
    } else {
        bot.channels.get(channel).send(text).catch(err => console.log(
            "Error while sending message.\nChannel:" + channel + "\nMessage:" + text + "\n" + err))
    }
}

exports.sendMessage = sendMessage