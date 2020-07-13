const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const steam = require('steamidconvert')(process.env.STEAMWEBAPI_KEY)
const fs = require('fs')
const timeago = require('timeago.js')
const servers = require('../data/servers.json')
const forumsSections = require('../data/forumsSections.json')
const getSteamInfo = require('./steaminfo').getSteamInfo
const getPlayerStats = require('./stats').getPlayerStats

function log(msg) {
    if (process.env.FORUMS_CHECK_LOGGING == 'true')
        console.log(msg)
}

async function checkSection(serverKey, section, checkRepeated, checkOld) {
    // Transforms strings into boolean
    checkRepeated = checkRepeated == 'false' ? false : true
    checkOld = checkOld == 'false' ? false : true

    let c = {} // Will contain found threadInfo, steamInfo and gametrackerInfo

    // Requests section and gets first normal thread link
    await rp('https://smithtainment.com/forums/forumdisplay.php?fid=' + section.fid)
        .then(html => {
            let $ = cheerio.load(html)
            let threadHref = $('.forumdisplay_regular div:nth-child(1) a[href^="showthread"]').attr('href')
            // TODO: Ignore Moved threads
            c.threadInfo = {
                tid: threadHref ? threadHref.match(/\d+/)[0] : threadHref
            }
        })

    // No thread check
    if (!c.threadInfo.tid) {
        log('- No thread found')
        return
    }
    log('Thread found (' + c.threadInfo.tid + ')')

    let repeatedThreads

    // Repeated thread check
    if (checkRepeated) {
        // Clones array from require (assigning the require directly results in some cache problems where all the not-repeated threads that failed OTHER checking still stays in repeatedThreads even after exiting the checkSection function scope)
        repeatedThreads = [...require('../data/repeatedThreads.json')]
        if (repeatedThreads.some(tid => tid == c.threadInfo.tid)) {
            log('- Repeated thread (' + c.threadInfo.tid + ')')
            return
        } else {
            repeatedThreads.push(c.threadInfo.tid)
            log('Not-repeated thread found (' + c.threadInfo.tid + ')')
        }
    }

    // Requests thread and gets threadInfo and SteamID (if available)
    await rp('https://smithtainment.com/forums/showthread.php?tid=' + c.threadInfo.tid)
        .then(html => {
            let $ = cheerio.load(html)
            c.threadInfo.title = $('title').text()

            let post = $('#posts > div:first-of-type') // Filters HTML to the first post only

            let author = post.find('.post_author')
            if (author.length == 0) // No permission or post not found
                return

            c.threadInfo.author = {
                name: author.find('.largetext').text().trim(),
                avatar: author.find('.author_avatar img').attr('src'),
                profile: author.find('.author_avatar a').attr('href'),
            }

            c.threadInfo.postDate = post.find('.post_date').text().trim()

            let postBody = post.find('.post_body').text().trim() // post text

            c.threadInfo.preview = postBody.split(' ')
            if (c.threadInfo.preview.length > 50)
                c.threadInfo.preview = c.threadInfo.preview.slice(0, 50).join(' ').replace('\n\n', '\n').substr(0, 1000) + ' [...]'
            else
                c.threadInfo.preview = c.threadInfo.preview.slice(0, 50).join(' ').replace('\n\n', '\n').substr(0, 1000)

            if (section.name !== 'General Discussion thread') {
                // Gets the SteamID/64 inside postBody and converts it to SteamID64
                if (postBody.match(/[0-5]:[01]:\d{1,15}/))
                    try {
                        c.threadInfo.steamID64inThread = steam.convertTo64(postBody.match(/[0-5]:[01]:\d{1,15}/)[0])
                    } catch (err) {
                        c.threadInfo.steamID64inThread = null
                        log('Error converting SteamID in postBody:\n' + err)
                    }
                else if (postBody.match(/7656119\d{10}/))
                    c.threadInfo.steamID64inThread = postBody.match(/7656119\d{10}/)[0]
                else
                    log('SteamID/64 not found in postBody')
            } else // No need for Steam/GT info in General Discussion threads
                log('steamInfo and gametrackerInfo not needed (General Disc.)')
        })

    // Invalid thread check (no thread / no permission)
    if (!c.threadInfo.author) {
        log('- Invalid thread (' + c.threadInfo.title + ')')
        return
    }

    // Old thread check
    console.log('CheckOld: ' + checkOld)
    if (checkOld) {
        if (!c.threadInfo.postDate.includes('minute')) {
            log('- Old thread (' + c.threadInfo.postDate + ')')
            return
        } else
            log('New thread (' + c.threadInfo.postDate + ')')
    }

    // Updates repeatedThreads.json
    if (checkRepeated) {
        // Deletes cache so file can be required again with new written data in the next call
        delete require.cache[require.resolve('../data/repeatedThreads.json')]
        console.log('Writing repeatedThreads.json with new tid (' + c.threadInfo.tid + ')')
        fs.writeFileSync('./bot/data/repeatedThreads.json', JSON.stringify(repeatedThreads))
        log('repeatedThreads.json updated (length: ' + repeatedThreads.length + ')')
    }

    // Gets Steam info if SteamID was found
    if (c.threadInfo.steamID64inThread) {
        await getSteamInfo(c.threadInfo.steamID64inThread)
            .then(steamInfo => {
                c.steamInfo = steamInfo
                log('steamInfo found (' + c.steamInfo.personaname + ')')
            })
            .catch(err => log('Error getting steamInfo (' + c.threadInfo.steamID64inThread + '):\n' + err))
    }

    // Gets GameTracker info
    if (c.steamInfo) {
        if (serverKey) // Section group has a server(Key) (not name)
            await getPlayerStats(servers[serverKey], c.steamInfo.personaname, 'h', 'w')
                .then(playerStats => c.gametrackerInfo = playerStats)
        else
            log('gametrackerInfo not needed (no serverKey)')
    } else if (section.name !== 'General Discussion thread') // steamInfo was neeeded
        log('steamInfo not found, unable to get gametrackerInfo')

    return c
}

function sendMessage(bot, sectionGroup, sectionIndex, c) {
    if (!c) // One of the checkSection checkings failed
        return // nothing to send

    log(`Sending message (steamInfo: ${c.steamInfo ? 'true' : 'false'}, gametrackerInfo: ${c.gametrackerInfo ? 'true' : 'false'})`)

    let channel = process.env.FORUMS_CHECK_MESSAGE_CHANNEL

    // Pings roles (pinging inside RichEmbed doesn't actually pings)
    bot.channels.get(channel).send(sectionGroup.rolesToPing.join(' '))

    /* RichEmbed structure rules:
        - All sections have threadInfo, but Applications don't have the Preview field
        - General Discussions don't have Steam or Gametracker info, all the other sections do (if found)
        - Only Applications have Activity field / Graph Image
        - If no steamInfo is found, Applications get the Preview field
    */

    // Adds threadInfo and color
    let richEmbed = new Discord.RichEmbed()
        .setAuthor(c.threadInfo.author.name, c.threadInfo.author.avatar, 'https://smithtainment.com/forums/' + c.threadInfo.author.profile)
        .setTitle(c.threadInfo.title)
        .setURL('https://smithtainment.com/forums/showthread.php?tid=' + c.threadInfo.tid)
        .setDescription(`New **[${sectionGroup.sections[sectionIndex].name}](${'https://smithtainment.com/forums/showthread.php?tid=' + c.threadInfo.tid})** on [${sectionGroup.name ? sectionGroup.name : servers[sectionGroup.serverKey].name}](${'https://smithtainment.com/forums/forumdisplay.php?fid=' + sectionGroup.sections[sectionIndex].fid})!`)
        .setFooter('Posted ' + c.threadInfo.postDate + ' by ' + c.threadInfo.author.name)
        .setColor(sectionGroup.sections[sectionIndex].color)
    if (sectionGroup.sections[sectionIndex].name !== 'Application')
        richEmbed
            .addField('Preview', '```\n' + c.threadInfo.preview + '\n```', false)

    // Adds steamInfo to RichEmbed
    if (c.steamInfo) {
        richEmbed
            .setThumbnail(c.steamInfo.avatarmedium)
            .addField('Steam info',
                '**Display name:** ' + c.steamInfo.personaname
                + '\n**Name:** ' + (c.steamInfo.communityvisibilitystate == 3 ? (c.steamInfo.realname ? c.steamInfo.realname : '(not set)') : '(unknown)')
                + '\n**SteamID:** ``' + steam.convertToText(c.steamInfo.steamid) + '``'
                + '\n**SteamID64:** ``' + c.steamInfo.steamid + '``'
                + `\n__**Profile:** [${c.steamInfo.communityvisibilitystate !== 3 ? 'private' : 'public'}](https://steamcommunity.com/profiles/${c.steamInfo.steamid}/)__`
                + '\n__**Garry\'s Mod hours:** ' + (c.steamInfo.gmodHours ? `${c.steamInfo.gmodHours}__` : '(unknown)__')
                + '\n**Last time online:** ' + (c.steamInfo.lastlogoff ? `${timeago.format(new Date(c.steamInfo.lastlogoff * 1000))}` : '(unknown)')
                + '\n**Created:** ' + (c.steamInfo.timecreated ? `${timeago.format(new Date(c.steamInfo.timecreated * 1000))}` : '(unknown)')
                , true)

        // Adds gametrackerInfo to RichEmbed
        if (c.gametrackerInfo && c.gametrackerInfo.name) {
            richEmbed
                .addField('Gametracker info',
                    `Name: [${c.gametrackerInfo.name}](${c.gametrackerInfo.profile})`
                    + '\n__**Time played:** ' + (c.gametrackerInfo.timePlayed.split('.')[1] ? `${c.gametrackerInfo.timePlayed.split('.')[0]}h ${Math.floor(Number(c.gametrackerInfo.timePlayed.split('.')[1]) * 0.6)}min__` : c.gametrackerInfo.timePlayed + '__')
                    + '\n**First joined:** ' + (!isNaN(new Date(c.gametrackerInfo.firstJoined)) ? timeago.format(new Date(c.gametrackerInfo.firstJoined)) + '\n(' + new Date(c.gametrackerInfo.firstJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ')' : c.gametrackerInfo.firstJoined)
                    + '\n**Last joined:** ' + (c.gametrackerInfo.lastJoined == 'Online Now' ? `**[Online Now](https://sgstats.glitch.me/redirect/${servers[sectionGroup.serverKey].ip})**` : (!isNaN(new Date(c.gametrackerInfo.lastJoined)) ? timeago.format(new Date(c.gametrackerInfo.lastJoined)) + '\n(' + new Date(c.gametrackerInfo.lastJoined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ')' : c.gametrackerInfo.lastJoined))
                    , true)
            if (sectionGroup.sections[sectionIndex].name == 'Application')
                richEmbed
                    .addField('Acitvity', 'Showing ' + c.gametrackerInfo.name + ' activity for the past 7 days:', false)
                    .setImage(c.gametrackerInfo.graphURL)
        }
    } else if (sectionGroup.sections[sectionIndex].name == 'Application')
        richEmbed
            .addField('Preview', '```\n' + c.threadInfo.preview + '\n```', false)

    bot.channels.get(channel).send(richEmbed)
}

exports.checkForums = async (bot, checkRepeated = true, checkOld = true) => {
    log('== Forums checking start (checkRepeated: ' + checkRepeated + ', checkOld: ' + checkOld + ')\n')
    for (let g = 0; g < forumsSections.length; g++) {
        let sectionGroup = forumsSections[g]
        log('= Group ' + (sectionGroup.name ? sectionGroup.name : servers[sectionGroup.serverKey].name) + ' (' + sectionGroup.sections.length + ' sections)')
        for (let s = 0; s < sectionGroup.sections.length; s++) {
            let section = sectionGroup.sections[s]
            log(`\n- Section ${section.fid}: ${section.name}`)
            // Checking every section at the same time (not using await) is not necessary since there's no need to check all of them this quick, it also doesn't many resources at once
            await checkSection(sectionGroup.serverKey, section, checkRepeated, checkOld)
                .then(checkInfo => sendMessage(bot, sectionGroup, s, checkInfo))
                .catch(err =>
                    // Sends error
                    bot.channels.get(process.env.DEBUG_CHANNEL).send(
                        new Discord.RichEmbed()
                            .setTitle('Forums check error')
                            .setDescription('Something happened while checking the forums. Stack trace:\n```js\n' + (err.stack.toString().length > 1900 ? err.stack.toString().substr(0, 1900) + ' [...]' : err.stack.toString()) + '\n```')
                            .addField('Values', 'section: ```json\n' + JSON.stringify(sectionGroup.sections[s], null, ' ') + '\n```\n s: ' + s + '\ncheckRepeated: ' + checkRepeated + '\ncheckOld: ' + checkOld, true)
                            .setTimestamp(new Date())
                            .setColor('DARK_RED')
                    )
                )
        }
        log('\n\n')
    }
    log('== Forums checking end')
}