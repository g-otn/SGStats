const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const fs = require('fs')
const servers = require('../data/servers.json')
const forumsSections = require('../data/forumsSections.json')
const thumbs = require('../data/thumbnails.json')
const getSteamInfo = require('./steaminfo').getSteamInfo
const getPlayerStats = require('./stats').getPlayerStats

async function checkFID(fid, checkRepeated = true, checkOld = true) {
    let checkInfo = {} // Will contain found threadInfo, steamInfo and gamertrackerInfo

    // Requests section and gets first normal thread link
    await rp('http://forums.guccittt.site.nfoservers.com/forumdisplay.php?fid=' + fid)
        .then(html => {
            let $ = cheerio.load(html)
            let threadHref = $('.forumdisplay_regular .threadbit_title div:nth-child(1) a[href^="showthread"]').attr('href')
            // TODO: Ignore Moved threads
            checkInfo.threadInfo = {
                tid: threadHref ? threadHref.match(/\d+/)[0] : threadHref
            }
        })

    // No thread check
    if (!checkInfo.threadInfo.tid) {
        console.log('No thread found')
        return
    }

    let repeatedThreads
    
    // Repeated thread check
    if (checkRepeated) {
        repeatedThreads = require('../data/repeatedThreads.json')
        if (repeatedThreads.some(tid => tid == checkInfo.threadInfo.tid)) {
            console.log('Repeated thread (' + tid + ')')
            return
        } else {
            repeatedThreads.push(checkInfo.threadInfo.tid)
            // Deletes cache so file can be required again with new written data
            delete require.cache[require.resolve('../data/repeatedThreads.json')]
            fs.writeFileSync('./bot/data/repeatedThreads.json', JSON.stringify(repeatedThreads))
        }
    }

    // Requests thread and gets threadInfo and SteamID (if available)
    await rp('http://forums.guccittt.site.nfoservers.com/showthread.php?tid=' + checkInfo.threadInfo.tid)
        .then(html => {
            let $ = cheerio.load(html)
            checkInfo.threadInfo.title = $('title').text()
            
            let post = $('#posts > div:first-of-type') // Filters HTML to the first post only
            
            let author = post.find('.post_author') // no permission / no post: author.length = 0
            checkInfo.threadInfo.author = {
                name: author.find('.author_information .largetext').text(),
                avatar: author.find('.postbit_avatar img').attr('src'),
                profile: author.find('.postbit_avatar a').attr('href'),
            }

            checkInfo.threadInfo.postDate = post.find('.post_date').text()

            let postBody = post.find('.post_body').text().trim()
            checkInfo.threadInfo.steamIDinThread = postBody.match(/STEAM_[0-5]:[01]:\d{1,15}/) ? postBody.match(/STEAM_[0-5]:[01]:\d{1,15}/)[0] : null
            checkInfo.threadInfo.preview = postBody.split(' ').slice(0, 50).join(' ')
        })
    
    // Old thread check
    if (checkOld) {
        if (!checkInfo.threadInfo.postDate.contains('minute')) {
            console.log('Old thread (' + checkInfo.threadInfo.postDate + ')')
            return
        }
    }

    // Gets Steam info if SteamID was found
    if (checkInfo.threadInfo.steamIDinThread) {
        
    }

    console.log(JSON.stringify(checkInfo.threadInfo, null, '  '))
    return checkInfo
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
            await checkFID(section.fid, false, false)
                .then(checkInfo => sendMessage(bot, sectionGroup, s, checkInfo))
        }
        console.log('\n\n')
    }
    console.log('== Forums checking end')
}

checkForums()