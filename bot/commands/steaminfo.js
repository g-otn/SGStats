const Discord = require('discord.js')
const rp = require('request-promise')
const steam = require('steamidconvert')(process.env.STEAMWEBAPI_KEY)
const timeago = require('timeago.js')
const commands = require('../data/commands')

async function getSteamInfo(steamID64) {
    let steamInfo
    let options = {
        qs: {
            key: process.env.STEAMWEBAPI_KEY,
            steamids: steamID64,
            format: 'json'
        },
        json: true
    }

    // Get user basic info
    options.uri = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/'
    await rp(options)
        .then(res => {
            if (res.response && res.response.players.length !== 0)
                steamInfo = res.response.players[0]
        })
        .catch(err => steamInfo = { err: err })

    if (steamInfo.err) return steamInfo // Prevent from trying to get gmod hours if there's not basic info

    // Get gmod hours
    options.uri = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`
    options.qs.steamids = undefined
    options.qs.steamid = steamID64
    await rp(options)
        .then(res => {
            if (res.response && res.response.games) {
                let gmod = res.response.games.find(game => {
                    return game.appid == 4000 // Garry's Mod app id
                })
                if (gmod)
                    steamInfo.gmodHours = Math.round(gmod.playtime_forever / 60)
            }
        })
        .catch(err => steamInfo.gmodHours = `Error (${err.statusCode})`)

    return steamInfo
}

function sendMessage(msg, steamInfo) {
    console.log(steamInfo)
    console.log(steam.convertToText(steamInfo.steamid))
    console.log('\na\n')
    if (steamInfo.err)
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Error')
                .setDescription('Something happened while gathering the steamInfo\n' + steamInfo.err)
                .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_sad.png?v=1561883974814')
                .setColor('DARK_RED')
        )
    else
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle(steamInfo.personaname + '\'s info')
                .setDescription(
                    '**Display name:** ' + steamInfo.personaname

                    + '\n**Name:** ' + (steamInfo.communityvisibilitystate == 3 ? (steamInfo.realname ? steamInfo.realname : '(not set)') : '(unknown)')

                    + '\n**SteamID:** ``' + steam.convertToText(steamInfo.steamid) + '``'

                    + '\n**SteamID64:** ``' + steamInfo.steamid + '``'
                    + '\n**CustomURL:** ' + (steamInfo.profileurl.match(/\/id\//) ? `[${steamInfo.profileurl.match(/\/id\/(\w+)/)[1]}](${steamInfo.profileurl})` : '(not set)')

                    + `\n**Profile:** [${steamInfo.communityvisibilitystate !== 3 ? 'private' : 'public'}](${steamInfo.profileurl})`

                    + '\n\n**Garry\'s Mod hours:** ' + (steamInfo.gmodHours ? `${steamInfo.gmodHours}` : '(unknown)')

                    + '\n**Playing:** ' + (steamInfo.gameextrainfo ? (steamInfo.gameserverip ? `[${steamInfo.gameextrainfo}](steam://connect/${steamInfo.gameserverip}/)` : steamInfo.gameextrainfo) : '(unknown)')

                    + '\n\n**Last time online:** ' + (steamInfo.lastlogoff ? '\n' + new Date(steamInfo.lastlogoff * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ` (${timeago.format(new Date(steamInfo.lastlogoff * 1000))})` : '(unknown)')

                    + '\n**Created:** ' + (steamInfo.timecreated ? '\n' + new Date(steamInfo.timecreated * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ` (${timeago.format(new Date(steamInfo.timecreated * 1000))})` : '(unknown)')
                )
                .setThumbnail(steamInfo.avatarmedium)
                .setColor('GREY')
        )
}

function sendSteamInfo(msg, input) {
    // Data validation
    if (!input) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing input')
                .setDescription('You must type an input!\n' + commands.list.steaminfo.syntax[1] + '\nType ``' + process.env.PREFIX + 'help steaminfo`` for more information.')
                .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_giggle.png?v=1561883974179')
                .setColor('RED')
        )
        return
    }

    input = input.trim()

    if (input.match(/STEAM_[0-5]:[01]:\d+/)) { // SteamID
        getSteamInfo(steam.convertTo64(input.match(/STEAM_[0-5]:[01]:\d+/)[0]))
            .then(steamInfo => sendMessage(msg, steamInfo))
    } else if (input.match(/7656119\d{10}/)) { // SteamID64 
        getSteamInfo(input.match(/7656119\d{10}/)[0])
            .then(steamInfo => sendMessage(msg, steamInfo))
    } else {                                     // CustomURL        
        steam.convertVanity(input, (err, res) => {
            if (err) { // Invalid CustomURL
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setTitle('User not found')
                        .setURL(`https://steamcommunity.com/id/${input}`)
                        .setDescription(`No steam user with the custom URL of \"${input}\" was found.`)
                        .setThumbnail('https://cdn.glitch.com/bcfe2b58-fec3-47dd-9035-1ff2cfe59574%2Fk_sad.png?v=1561883974814')
                        .setColor('DARK_RED')
                )
                return
            }
            getSteamInfo(res)
                .then(steamInfo => sendMessage(msg, steamInfo))
        })
    }
}

exports.getSteamInfo = getSteamInfo
exports.sendSteamInfo = sendSteamInfo