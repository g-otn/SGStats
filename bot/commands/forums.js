const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const steam = require('steamidconvert')(process.env.STEAMWEBAPI_KEY)
const fs = require('fs')
const timeago = require('timeago.js')
const servers = require('../data/servers.json')
const forumsSections = require('../data/forumsSections.json')
const thumbs = require('../data/thumbnails.json')
const getSteamInfo = require('./steaminfo').getSteamInfo
const getPlayerStats = require('./stats').getPlayerStats

async function checkSection(serverKey, section, checkRepeated = true, checkOld = true) {
    let c = {} // Will contain found threadInfo, steamInfo and gametrackerInfo

    // Requests section and gets first normal thread link
    await rp('http://forums.guccittt.site.nfoservers.com/forumdisplay.php?fid=' + section.fid)
        .then(html => {
            let $ = cheerio.load(html)
            let threadHref = $('.forumdisplay_regular .threadbit_title div:nth-child(1) a[href^="showthread"]').attr('href')
            // TODO: Ignore Moved threads
            c.threadInfo = {
                tid: threadHref ? threadHref.match(/\d+/)[0] : threadHref
            }
        })

    // No thread check
    if (!c.threadInfo.tid) {
        console.log('- No thread found')
        return
    }
    console.log('Thread found (' + c.threadInfo.tid + ')')

    let repeatedThreads

    // Repeated thread check
    if (checkRepeated) {
        repeatedThreads = require('../data/repeatedThreads.json')
        if (repeatedThreads.some(tid => tid == c.threadInfo.tid)) {
            console.log('- Repeated thread (' + section.tid + ')')
            return
        } else {
            repeatedThreads.push(section.tid)
            console.log('Not repeated thread found (' + section.tid + ')')
        }
    }

    // Requests thread and gets threadInfo and SteamID (if available)
    await rp('http://forums.guccittt.site.nfoservers.com/showthread.php?tid=' + c.threadInfo.tid)
        .then(html => {
            let $ = cheerio.load(html)
            c.threadInfo.title = $('title').text()

            let post = $('#posts > div:first-of-type') // Filters HTML to the first post only

            let author = post.find('.post_author')
            if (author.length == 0) // No permission or post not found
                return

            c.threadInfo.author = {
                name: author.find('.author_information .largetext').text(),
                avatar: author.find('.postbit_avatar img').attr('src'),
                profile: author.find('.postbit_avatar a').attr('href'),
            }

            c.threadInfo.postDate = post.find('.post_date').text().trim()

            let postBody = post.find('.post_body').text().trim() // post text

            c.threadInfo.preview = postBody.split(' ').slice(0, 50).join(' ')

            if (section.name !== 'General Discussion thread') {
                // Gets the SteamID/64 inside postBody and converts it to SteamID64
                if (postBody.match(/STEAM_[0-5]:[01]:\d{1,15}/))
                    try {
                        c.threadInfo.steamID64inThread = steam.convertTo64(postBody.match(/STEAM_[0-5]:[01]:\d{1,15}/)[0])
                    } catch (err) {
                        c.threadInfo.steamID64inThread = null
                        console.log('Error converting SteamID in postBody:\n', err)
                    }
                else if (postBody.match(/7656119\d{10}/))
                    c.threadInfo.steamID64inThread = postBody.match(/7656119\d{10}/)[0]
                else
                    console.log('SteamID/64 not found in postBody')
            } else // No need for Steam/GT info in General Discussion threads
                console.log('steamInfo and gametrackerInfo not needed (' + section.name + ')')
        })

    // Invalid thread check (no thread / no permission)
    if (!c.threadInfo.author) {
        console.log('- Invalid thread (' + c.threadInfo.title + ')')
        return
    }

    // Old thread check
    if (checkOld) {
        if (!c.threadInfo.postDate.includes('minute')) {
            console.log('- Old thread (' + c.threadInfo.postDate + ')')
            return
        } else
            console.log('New thread (' + c.threadInfo.postDate + ')')
    }

    // Updates repeatedThreads.json
    if (checkRepeated) {
        // Deletes cache so file can be required again with new written data in the next call
        delete require.cache[require.resolve('../data/repeatedThreads.json')]
        fs.writeFileSync('./bot/data/repeatedThreads.json', JSON.stringify(repeatedThreads))
    }

    // Gets Steam info if SteamID was found
    if (c.threadInfo.steamID64inThread) {
        await getSteamInfo(c.threadInfo.steamID64inThread)
            .then(steamInfo => {
                c.steamInfo = steamInfo
                console.log('steamInfo found (' + c.steamInfo.personaname + ')')
            })
            .catch(err => console.log('Error getting steamInfo (' + c.threadInfo.steamID64inThread + '):\n', err))
    }

    // Gets GameTracker info
    if (c.steamInfo) {
        if (serverKey)
            await getPlayerStats(servers[serverKey], c.steamInfo.personaname, 'h', 'w')
                .then(playerStats => c.gamertrackerInfo = playerStats)
        else
            console.log('gametrackerInfo not needed (no serverKey)')
    } else if (section.name !== 'General Discussion thread') // steamInfo was neeeded
        console.log('steamInfo not found, unable to get gametrackerInfo')

    console.log(JSON.stringify(c, null, '\t'))
    return c
}

function sendMessage(bot, sectionGroup, sectionIndex, checkInfo) {
    //console.log('\t\tchecked ' + sectionGroup.sections[sectionIndex].name)
}

async function checkForums(bot) {
    console.log('== Forums checking start\n')
    for (let g = 0; g < forumsSections.length; g++) {
        let sectionGroup = forumsSections[g]
        console.log('= Group ' + (sectionGroup.name ? sectionGroup.name : servers[sectionGroup.serverKey].name) + ' (' + sectionGroup.sections.length + ' sections)')
        for (let s = 0; s < sectionGroup.sections.length; s++) {
            let section = sectionGroup.sections[s]
            console.log(`\n- Section ${section.fid}: ${section.name}`)
            // Checking every section at the same time (not using await) is not necessary since there's no need to check all of them this quick, it also doesn't many resources at once
            await checkSection(sectionGroup.serverKey, section, false, false)
                .then(checkInfo => sendMessage(bot, sectionGroup, s, checkInfo))
        }
        console.log('\n\n')
    }
    console.log('== Forums checking end')
}

checkForums()
//checkSection('mcttt', forumsSections.filter(sectionGroup => sectionGroup.sections.some(section => section.fid == 330))[0].sections.filter(section => section.fid == 330)[0], false, false)