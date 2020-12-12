const rp = require('request-promise')

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getDiscordGatewayResponse = async () => {
  return rp('https://discordapp.com/api/v7/gateway', {
    method: 'HEAD',
    resolveWithFullResponse: true, // Include headers (and other stuff) in response
    simple: false // Will resolve even if http code is not 2XX
  })
}

// Resolves whenever Discord allows to make requests
exports.waitForDiscordGateway = async () => {
  // curl -I https://discordapp.com/api/v7/gateway
  await getDiscordGatewayResponse()
    .then(async res => {
      const status = res.statusCode

      if (status !== 200) { // Probably 429 Too Many Requests (Glitch.com Discord bans https://support.glitch.com/t/discord-ban-mega-thread-the-second-discord-bot-something-took-too-long-to-do)
        const retryAfter = Number(res.headers['retry-after']) * 1000
        console.warn(`Discord gateway not ok (${status}), resolving after ${retryAfter}ms (${Math.ceil(retryAfter / 3600000)}h)`)
        await wait(retryAfter)
      }
    })
}

exports.getDiscordGatewayResponse = getDiscordGatewayResponse;