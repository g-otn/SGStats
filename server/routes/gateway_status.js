const express = require('express')
const app = module.exports = express()
const timeago = require('timeago.js')
const { getDiscordGatewayResponse } = require('../../scripts/discordGateway')

const minRequestIntervalSeconds = 300
let lastRequestDate = Number.MIN_SAFE_INTEGER, cachedGatewayResponse = {}

app.get('/discordGateway', async (req, res) => {
  // If last request was too long ago, cache new gateway response
  if (new Date() - lastRequestDate >= minRequestIntervalSeconds * 1000) {
    await getDiscordGatewayResponse()
      .then(gatewayRes => {
        lastRequestDate = Date.now()
        cachedGatewayResponse = {
          code: gatewayRes.statusCode,
          message: gatewayRes.statusMessage,
          retryAfter: Number(gatewayRes.headers['retry-after']) * 1000,
        }
        console.log('gateway response:', cachedGatewayResponse)
      })
  }

  res.send({
    lastCheck: timeago.format(lastRequestDate),
    ...cachedGatewayResponse
  })
})