
if (Number(process.version.slice(1).split(".")[0]) < 16) throw new Error("Node 16.x or higher is required.");

// Load environment variables
require('dotenv').config()

// Express server
require('./server')

// Discord bot
require('./bot')

// Glitch.com no sleep script
//require('./scripts/noSleep')