const Discord = require('discord.js')
const rp = require('request-promise')
const steam = require('steamidconvert')(process.env.STEAMWEBAPI_KEY)
const timeago = require('timeago.js')
const commands = require('../data/commands')
const thumbs = require('../data/thumbnails.json')

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
        .catch(err => { throw err })

    if (!steamInfo)
        return // Prevent from getting gmod hours if there's no basic info (player not found)

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

function sendMessage(msg, steamInfo, err) {
    let input = msg.content.split(' ').slice(1).join(' ')
    
    if (err) {
        err = err.err.toString()
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Error')
                .setDescription('Something happened while getting ' + input + '\'s Steam information.\nPlease ping or open and add <@310491216393404416> to a support ticket if this continues __after some time__. Error:\n```js\n' + (err.length > 250 ? err.substr(0, 250) + ' [...]' : err) + '\n```')
                .setThumbnail(thumbs.sad)
                .setColor('DARK_RED')
        )
    }
    else if (!steamInfo)
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('User not found')
                .setDescription(`No Steam user with the SteamID, SteamID64 or CustomURL of \"${input}\" was found.`)
                .setThumbnail(thumbs.sad)
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

                    + `\n**Profile:** [${steamInfo.communityvisibilitystate !== 3 ? 'private' : 'public'}](https://steamcommunity.com/profiles/${steamInfo.steamid}/)`

                    + '\n\n**Garry\'s Mod hours:** ' + (steamInfo.gmodHours ? `${steamInfo.gmodHours}` : '(unknown)')

                    + '\n**Playing:** ' + (steamInfo.gameextrainfo ? (steamInfo.gameserverip ? `[${steamInfo.gameextrainfo}](steam://connect/${steamInfo.gameserverip}/)` : steamInfo.gameextrainfo) : '(unknown)')

                    + '\n\n**Last time online:** ' + (steamInfo.lastlogoff ? '\n' + new Date(steamInfo.lastlogoff * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ` (${timeago.format(new Date(steamInfo.lastlogoff * 1000))})` : '(unknown)')

                    + '\n**Created:** ' + (steamInfo.timecreated ? '\n' + new Date(steamInfo.timecreated * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ` (${timeago.format(new Date(steamInfo.timecreated * 1000))})` : '(unknown)')
                )
                .setThumbnail(steamInfo.avatarmedium)
                .setColor('GREY')
        )
}

exports.sendSteamInfo = (msg, input) => {
    // Data validation
    if (!input) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing input')
                .setDescription('You must type an input!\n' + commands.list.steaminfo.syntax[1] + '\nType ``' + process.env.PREFIX + 'help steaminfo`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }

    input = input.trim()

    if (input.match(/[0-5]:[01]:\d{1,15}/)) { // SteamID
        getSteamInfo(steam.convertTo64(input.match(/[0-5]:[01]:\d{1,15}/)[0]))
            .then(steamInfo => sendMessage(msg, steamInfo))
            .catch(err => sendMessage(msg, null, { err: err }))
    } else if (input.match(/7656119\d{10}/)) {      // SteamID64
        getSteamInfo(input.match(/7656119\d{10}/)[0])
            .then(steamInfo => sendMessage(msg, steamInfo))
            .catch(err => sendMessage(msg, null, { err: err }))
    } else {                                          // CustomURL
        steam.convertVanity(input, (err, res) => {
            if (err) // Invalid CustomURL
                sendMessage(msg, null) // No error but no steamInfo (user not found)
            else
                getSteamInfo(res)
                    .then(steamInfo => sendMessage(msg, steamInfo))
                    .catch(err => sendMessage(msg, null, { err: err }))
        })
    }
}

exports.getSteamInfo = getSteamInfo