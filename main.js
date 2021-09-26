
if (Number(process.version.slice(1).split(".")[0]) < 16) throw new Error("Node 16.x or higher is required. Current version: " + process.version);

// Load environment variables
require('dotenv').config()

// Express server
require('./server')

// Discord bot
require('./bot')
