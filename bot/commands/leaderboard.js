const Discord = require('discord.js')
const encodeUrl = require('encodeurl')
const rp = require('request-promise')
const cheerio = require('cheerio')
const servers = require('../data/servers.json')
const thumbs = require('../data/thumbnails.json')
const getAvailableServers = require('./help').getAvailableServers
const searchPlayer = require('./player').searchPlayer

async function getLeaderboard(server, displayValue, player) {
    let options = { headers: { 'User-Agent': 'Request-Promise' } }
    let leaderboard = { players: [] }

    // Gets player info (rank)
    await searchPlayer(null, server, null, player)
        .then(foundPlayer => leaderboard.foundPlayer = foundPlayer)

    // If player is not found or rank is too low (very low ranks require too many requests)
    if (!leaderboard.foundPlayer.rank || leaderboard.foundPlayer.rank > 25000)
        return leaderboard

    // Requests leadboard pages until it finds the table which contains the player
    for (let notFoundIndex = 0; !leaderboard.players.some(player => player.name == leaderboard.foundPlayer.name); notFoundIndex++) {
        leaderboard.players = [] // Resets the player every loop so the new rows can be stored

        // Generates URI based on ip, player rank and notFoundIndex
        options.uri = `https://www.gametracker.com/server_info/${server.ip}/top_players/?searchpge=${1 + Math.floor((leaderboard.foundPlayer.rank - 1) / 25) + notFoundIndex}&searchipp=25`

        await rp(options)
            .then(html => {
                let $ = cheerio.load(html)
                let playerRows = $('.table_lst tr').slice(1)

                // Marks correct column to scrap
                switch (displayValue) {
                    case 's':
                        displayValue = 3
                        break
                    case 't':
                        displayValue = 4
                        break
                    case 'm':
                        displayValue = 5
                }

                // Scraps info from each row
                for (let i = 0; i < playerRows.length - 1 /* removes last row with column names */; i++) {
                    let playerRow = playerRows.eq(i).children()
                    let value = playerRow.eq(displayValue).text().trim()
                    leaderboard.players.push({
                        rank: playerRow.eq(0).text().trim(),
                        name: playerRow.eq(1).text().trim(),
                        value: displayValue != 4 ? value : (value.split('.')[1] ? `${value.split('.')[0]}h ${Math.floor(Number(value.split('.')[1]) * 0.6)}min` : value),
                        profile: 'https://www.gametracker.com' + playerRow.eq(1).children().eq(0).attr('href')
                    })
                }
            })
    }

    leaderboard.uri = options.uri
    return leaderboard
}

exports.sendLeaderboard = (msg, server, displayValue, player) => {
    // Data validation
    if (!server) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing server')
                .setDescription('You must choose a server!\n**Servers:** ' + getAvailableServers('online').join(', ') + '\nType ``' + process.env.PREFIX + 'help online`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }
    server = server.toLowerCase()
    if (!servers[server] || !servers[server].gamertrackerID) {
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Invalid server')
                .setDescription('\"' + server + '\" is not a valid server!\n**Servers:** ' + getAvailableServers('leaderboard').join(', ') + '\nType ``' + process.env.PREFIX + 'help leaderboard`` for more information.')
                .setThumbnail(thumbs.confused)
                .setColor('RED')
        )
        return
    }
    if (!displayValue) {
        // displayValue is optional, so only player name needs to be input, if player name is inserted and sorting method is ommited, part of player name is inside displayValue (args[0])
        msg.channel.send(
            new Discord.RichEmbed()
                .setTitle('Missing player')
                .setDescription('You must type a player name!\nType ``' + process.env.PREFIX + 'help leaderboard`` for more information.')
                .setThumbnail(thumbs.giggle)
                .setColor('RED')
        )
        return
    }

    // Data parsing
    if (!displayValue.match(/^(score)$|^(time)$|^(min)$|^s$|^t$|^m$/i)) {
        // Invalid sorting method, displayValue interpreted as player name (or start of it)
        player = displayValue + (player ? ' ' + player : '')
        displayValue = 's' // Default sorting method: by score
    } else
        displayValue = displayValue[0].toLowerCase()

    getLeaderboard(servers[server], displayValue, player)
        .then(leaderboard => {
            if (leaderboard.players.length > 0)
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setDescription(`Showing [${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip})'s [leaderboard](${leaderboard.uri}) around [${leaderboard.foundPlayer.name}](${leaderboard.foundPlayer.profile}):`)
                        .addField('Rank and name', leaderboard.players.map(player => player.name == leaderboard.foundPlayer.name ? `__**${player.rank} - ${player.name}**__` : `**${player.rank}** - ${player.name}`).join('\n'), true)
                        .addField(displayValue == 's' ? 'Score' : (displayValue == 't' ? 'Time played' : 'Score/min'), leaderboard.players.map(player => player.name == leaderboard.foundPlayer.name ? `__**${player.value}**__` : player.value).join('\n'), true)
                        .setColor('BLUE')
                )
            else if (leaderboard.foundPlayer && leaderboard.foundPlayer.rank > 25000)
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setTitle('Rank too low')
                        .setDescription(`[${leaderboard.foundPlayer.name}](https://www.gametracker.com/server_info/${servers[server].ip}/top_players/?query=${encodeUrl(player)})'s rank on [${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip}) was too low (${leaderboard.foundPlayer.rank}) it must be at least 25000.`)
                        .setThumbnail(thumbs.sad)
                        .setColor('RED')
                )
            else
                msg.channel.send(
                    new Discord.RichEmbed()
                        .setTitle('Player not found')
                        .setDescription(`No player with the name of [${player}](https://www.gametracker.com/server_info/${servers[server].ip}/top_players/?query=${encodeUrl(player)}) was found on [${servers[server].name}](https://www.gametracker.com/server_info/${servers[server].ip}).`)
                        .setThumbnail(thumbs.sad)
                        .setColor('RED')
                )
        })
        .catch((err) => {
            console.log(err)
            msg.channel.send(
                new Discord.RichEmbed()
                    .setTitle('Error')
                    .setDescription('Something happened while trying to gather the leaderboard.')
                    .setThumbnail(thumbs.sad)
                    .setColor('DARK_RED')
            )
        })
}

exports.getLeaderboard = getLeaderboard