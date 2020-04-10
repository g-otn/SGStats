/*
    Command: help
    Function: Sends instructions about other commands
    Author: Skeke#2155
*/
//Bot info
const prefix = require('../config/prefix.json');
const botinfo = require('../package.json');

exports.help = function(command) {

    //Update message parameters for this execution
    const msg = require('../bot.js').msg;

 
    console.log('Command to help: ' + command);
    var desc, syntax, ex, notes, notes_srv, notes_per, thumb;
    var thumbSt = "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2FkSt.png?1518565783409";
    var thumbGT = "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2FkGT.png?1518565784303";
    var defaultcheck = false;
    var commandlist = [
        , //idk why but without this it sends without the first value
        "online",
        "population",
        "playerhours",
        "server",
        "serverh",
        "steaminfo",
        "hue"
        ];
    commandlist = commandlist.join('\n');
    notes_srv = "Servers: 'anime', 'modded', 'prophunt', 'puremc', 'starwars' or 'vanilla'";
    notes_per = "Period: 'day', 'week' or 'month'";
    notes = " ";
    switch (command) {
        case 'server':
            desc = "Shows info about a specific server";
            syntax = "<server>";
            notes = notes_srv;
            ex = "modded\n" + prefix.prefix + "vanilla\n" + prefix.prefix + "ph";
            thumb = thumbGT;
            break;
        case 'serverh':
            desc = "Shows a graph of a player playtime of a SG server in a specific period of time.";
            syntax = "<server>h <period> <playername>";
            notes = notes_srv;
            ex = "moddedh week Skeke";
            thumb = thumbGT;
            break;
        case 'steaminfo':
            desc = "Shows info from steam of a player";
            syntax = "steaminfo <input>";
            notes = "Input: SteamID, SteamID64, SteamID3 or customURL";
            ex = "steaminfo STEAM_1:0:12345678\n" + prefix.prefix + "steaminfo 7656119876543210";
            thumb = thumbSt;
            break;
        case 'online':
            desc = "Shows online players from a SG server along with a population graph of that server in the last 24h.";
            syntax = "online <server>";
            notes = notes_srv;
            ex = "online modded\n" + prefix.prefix + "online minecraft";
            thumb = thumbGT;
            break;
        case 'population':
            desc = "Shows a graph of population of a SG server during a specific time period.";
            syntax = "population <server> <period>";
            notes = notes_srv + '\n' + notes_per + '. Default: day';
            ex = "population vanilla month\n" + prefix.prefix + "population md week";
            thumb = thumbGT;
            break;
        case 'playerhours':
            desc = "Shows a player total hours in a specific SG server.";
            syntax = "playerhours <server> <player>";
            notes = notes_srv.split("'puremc', ").join('');
            ex = "playerhours modded Skeke\n" + prefix.prefix + "playerhours va Skeke";
            thumb = thumbGT;
            break;
        case 'hue':
            defaultcheck = true;
            msg.channel.send({embed: {
                "description": "huehuehuehueeuhehuehehu",
                "color": 0x0000ff,
                "footer": {
                    "text": "This is a hue command"
                },
                "image": {
                    "url": "https://img.ibxk.com.br/2013/8/materias/1649968641515049.jpg"
                }
            }});
            break;
        case '':
        case ' ':
        default:
            defaultcheck = true;
            msg.channel.send({embed: {
                "description": '**Showing ' + botinfo.name + ' commands** \nType ``' + prefix.prefix + 'help <command>`` for specific info.\n```' + commandlist + "```\n[Changelog](https://sgstats-changelog.glitch.me/)",
                "color": 0x0000ff,
                "footer": {
                    "text": botinfo.name + " v" + botinfo.version + " by Skeke#2155, special thanks Hades#0666"
                },
                "thumbnail": {
                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk11.png?1521343591170"
                }
            }});
            break;
    }
    notes = "\n" + notes;
    if (defaultcheck !== true) {
        msg.channel.send({embed: {
            "title": 'The ' + command + ' command',
            "description": desc,
            "color": 0x0000ff,
            "footer": {
                "text": botinfo.name + " v" + botinfo.version + " by Skeke#2155, special thanks Hades#0666"
            },
            "thumbnail": {
                "url": thumb
            },
            "fields": [
                {
                    "name": "Syntax",
                    "value": "``" + prefix.prefix + syntax + "``" + notes,
                },
                {
                    "name": "Examples",
                    "value": "``" + prefix.prefix + ex + "``",
                }
            ]
        }});
    }
    console.log('----------\n');
}