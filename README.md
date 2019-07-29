# SGStats
SGStats is a Discord scraper bot specifically made for the [Smithtainment gaming network](https://forums.smithtainment.com/).
It is partially hard-coded to get information about their game servers and forums.

Along with the Discord bot, this Node.js application also runs a server which serves pages with the changelog and some redirect links directly to the Steam game servers.
You can check the live version of the bot with the updated changelog on [Glitch.com](https://sgstats.glitch.me/).

## Scraped data
Some of the data gathered for the network members includes:
- [gametracker.com](https://www.gametracker.com) data and generated images
- [Smithtainment Forums](https://forums.smithtainment.com/) specific posts
- Steam user basic information through [Steam Web API](https://steamcommunity.com/dev)

These data are gathered through commands in a Discord server channel, to see which commands are available and what each one does, use the ``help`` command to the bot.

## Built with
- Core of the bot
  - discord.js
- Scraping
  - request-promise
  - cheerio
- Data parsing and formatting
  - encodeurl
  - js-base64
  - steamidconvert
  - timeago.js
- Server side
  - express
  - pug
- Others
  - dotenv

## Installing
Before runnning the bot, install its dependencies and set up the enviroment variables

#### Dependencies
```console
npm i
```

#### Environment Variables
Create a ``.env`` file in the project's root. These variables are needed throughout the code:
```ini
# Server
BASEURI                       # The protocol + hostname of the server (Ex: http://localhost)
PORT                          # The server port

# Bot
PREFIX                        # The prefix character for commands
TOKEN                         # The Discord bot app token
STEAMWEBAPI_KEY               # The Steam Web API key
DEBUG_CHANNEL                 # The Discord channel to send startup and specific error messages
FORUMS_CHECK_MESSAGE_CHANNEL  # The Discord server channel to send the forums sections logs
FORUMS_CHECK_LOGGING          # true/false, toggles logging at bot/commands/forums.js

# Scripts
GLITCH_NO_SLEEP               # true/false, toggles noSleep script for Glitch.com
```

#### Running
```console
node main.js
```
