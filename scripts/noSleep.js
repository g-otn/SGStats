// Script made for use in Glitch.com
// Pings Glitch.com projects so they don't sleep (and the bot goes offline)
if (process.env.GLITCH_NO_SLEEP == 'false')
    return

const rp = require('request-promise')
const delay = 30000
const url = [
    'https://sgstats.glitch.me/',
    'https://sgstats-2.glitch.me/',
    'https://bot-ping-machine.glitch.me/',
]
let which = 0

function access() {
    console.log(`Requesting '${url[which]}' (${which + 1}/${url.length})`)
    const reqStartTime = new Date().getTime();
    rp({
      uri: url[which],
      credentials: "omit",
      headers: {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:77.0) Gecko/20100101 Firefox/77.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
          "Upgrade-Insecure-Requests": "1",
      }
    })
        .then(() => {
            console.log('Acessed ' + url[which] + ' (' + (new Date().getTime() - reqStartTime) + 'ms)')
            which++
            if (which == url.length) which = 0
            setTimeout(access, delay)
        })
        .catch(err => { console.log('Error: ' + err.statusCode + ' (' + (new Date().getTime() - reqStartTime) + 'ms)')})
}

console.log('Glitch no sleep script started')
access()