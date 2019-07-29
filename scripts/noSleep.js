// Script made for use in Glitch.com
// Pings Glitch.com projects so they don't sleep (and the bot goes offline)
if (process.env.GLITCH_NO_SLEEP == 'false')
    return

const rp = require('request-promise')
const url = [
    'https://sgstats.glitch.me/',
    'https://bot-ping-machine.glitch.me/',
]
let which = 0

function access() {
    console.log(`Requesting '${url[which]}' (${which + 1}/${url.length})`)
    const reqStartTime = new Date().getTime();
    rp(url[which])
        .then(() => {
            console.log('Acessed ' + url[which] + ' (' + (new Date().getTime() - reqStartTime) + 'ms)')
            which++
            if (which == url.length) which = 0
            setTimeout(access, 20000)
        })
        .catch(err => { console.log('Error: ' + err.statusCode + ' (' + (new Date().getTime() - reqStartTime) + 'ms)')})
}

console.log('Glitch no sleep script started')
access()