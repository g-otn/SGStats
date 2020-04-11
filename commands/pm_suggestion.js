/* Discord/bot/bot.on("message", ...) used for autocompletion REMOVE/COMMENT BEFORE RUNNING */
const Discord = require('discord.js');
const bot = new Discord.Client();
/*
    Command: suggestion
    Function: Sends a suggestion given to the player via the bot to the staff discord
    Author: Skeke#2155
*/
const awaitMsgOptions = {
    max: 1,
    time: 10000,
    errors: ['time']
}
var suggestion = {
    target,

}
var options
exports.startNewSuggestion = async (msg) => {
bot.on("message", (msg) => { // <-- REMOVER
    msg.author.send("Hello! You are now making a suggestion. Reply through here, no command is needed. The suggestion will be canceled if you take too long to answer between questions!\n\nFirst, please inform the server or the network area the suggestion is directed to (MCTTT, Prophunt, Discord, Forums, etc):")
    .then((sentMsg) => {
        sentMsg.channel.awaitMessages(response => response.content, )
        .then((answer) => {
            sentMsg.channel.send("teste:\n\n" + answer)
        }).catch(() => {
            sentMsg.channel.send("demorou")
        })
    })
//}) // <-- REMOVER
}