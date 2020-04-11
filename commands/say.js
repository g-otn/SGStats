/*
    Command: say
    Function: Sends custom message to a channel (dev only)
    Author: Skeke#2155
*/
const bot = require('../bot.js').bot //sends message

async function sendMessage(senderChannel, args) {
    var channel = args[0]
    var embed = Boolean(Number(args[1]))
    var text = args.slice(2)
    console.log('args: ' + args);
    console.log('senderChannel: ' + senderChannel)
    console.log('channel: ' + channel)
    console.log('embed: ' + embed + ' (' + args[1] + ')')
    console.log('text: ' + text)

    // No channel selected
    if (text == '' || text == undefined) {
        console.log('Sending say error')
        senderChannel = senderChannel.toString().replace().replace('<#', '').replace('>', '')
        bot.channels.get(senderChannel).send('Error while sending empty message.\nChannel: ' + channel + 'Embed: ' + '\nMessage: ' + text)

    } else if (embed) {
        console.log('Sending say embed')
        bot.channels.get(channel).send({'embed': {'description': text.toString()}})
        .catch(err => bot.channels.get(senderChannel).send('Error while sending message.\nChannel: ' + channel + 'Embed: ' + '\nMessage: ' + text + '\n' + err))
    } else {
        console.log('Sending say text')
        bot.channels.get(channel).send(text)
        .catch(err => bot.channels.get(senderChannel).send('Error while sending message.\nChannel: ' + channel + 'Embed: ' + '\nMessage: ' + text + '\n' + err))
    }
}

exports.sendMessage = sendMessage