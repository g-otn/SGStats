const Discord = require('discord.js')
const rp = require('request-promise')
const steam = require('steamidconvert')(process.env.STEAMWEBAPI_KEY)
const syntaxInput = require('../data/commands').list.steaminfo.syntax[1]

function sendMessage(msg, steamInfo) {

}

async function getSteamData(steamID64) {

}

function sendSteamInfo(msg, input) {
    // Data validation
    if (!input) {
        msg.channel.send(
            new Discord.RichEmbed()
            .setTitle('Missing input')
            .setDescription('You must type an input!\n' + syntaxInput + '\nType ``' + process.env.PREFIX + 'help steaminfo`` for more information.')
            .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_giggle.png?v=1561883974179')
            .setColor('RED')
        )
        return
    }
    
    input = input.trim()


}

exports.sendSteamInfo = sendSteamInfo