const Discord = require('discord.js')
const rp = require('request-promise')
const cheerio = require('cheerio')
const servers = require('../data/servers.json')
const forumsSections = require('../data/forumsSections.json')
const thumbs = require('../data/thumbnails.json')

async function checkFID(fid, checkOld = false, checkRepeated = false) {
    let checkInfo = {} // Will contain found threadInfo, steamInfo and gamertrackerInfo

    // Looks for new posts
    await rp('http://forums.guccittt.site.nfoservers.com/forumdisplay.php?fid=' + fid)
    .then(html => {
        let $ = cheerio.load(html)
        let threadHref = $('.forumdisplay_regular .threadbit_title div:nth-child(1) a[href^="showthread"]').attr('href')
        checkInfo.threadInfo = {
            tid: threadHref ? threadHref.match(/\d+/)[0] : threadHref
        }
        //require('fs').writeFile('forumstest' + fid + '.html', html, () => { 'saved ' + fid })
    })

    console.log('\t\t' + checkInfo.threadInfo.tid)
    return checkInfo
}

function sendMessage(bot, sectionGroup, sectionIndex, c) {
    //console.log('\t\tchecked ' + sectionGroup.sections[sectionIndex].name)
}

async function checkForums(bot) {
    for (let g = 0; g < forumsSections.length; g++) {
        let sectionGroup = forumsSections[g]
        console.log('\n\nChecking group ' + (sectionGroup.name ? sectionGroup.name : servers[sectionGroup.serverKey].name) + ' (' + sectionGroup.sections.length + ' sections)')
        for (let s = 0; s < sectionGroup.sections.length; s++) {
            let section = sectionGroup.sections[s]
            console.log(`\tChecking section ${section.fid}: ${section.name}`)
            // Checking every section at the same time (not using await) is not necessary since there's no need to check all of them this quick, it also doesn't many resources at once
            await checkFID(section.fid) 
                .then(checkInfo => sendMessage(bot, sectionGroup, s, checkInfo))
        }
    }
}

checkForums()