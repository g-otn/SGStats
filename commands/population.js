/*
    Command: population
    Function: Shows a graph of population of a SG server during a specific time period
    Author: Skeke#2155
*/
//Generated number for URL
const requestnumber = require('../bot.js').req_num;
//Scrap modules
const request = require('request');
const cheerio = require('cheerio');
//Anti-HTTP Code 403 (Forbidden)
const options = { 
    headers: {'user-agent': 'node.js'}
};

//Server Addresses
const anime = "70.42.74.129:27015";
const mcttt = "192.223.31.40:27015";
const modded = "192.223.24.186:27015";
const prophunt = "192.99.239.40:27015";
const pure_mc = "206.221.183.139:25575"; 

//A ID gamertracker generates and uses
const animeid = "5704089";
const mctttid = "5086005";
const moddedid = "5052174";
const prophuntid = "5709398";
const pure_mcid = "5865486";



exports.populationgraph = function(msg,server, graphtype) {
    var serverid, servername;
    var errorcheck = false;
    console.log('Server: ' + server);
    switch (server) {
        case 'an':
        case 'anime':
            server = anime;
            serverid = animeid;
            servername = "Anime TTT";
            break;
        case 'mc':
        case 'mcttt':
        case 'mcmd':
            server = mcttt;
            serverid = mctttid;
            servername = "MC TTT";
            break;
        case 'md':
        case 'modded':
        case 'mdttt':
            server = modded;
            serverid = moddedid;
            servername = "Modded TTT";
            break;
        case 'ph':
        case 'prophunt':
            server = prophunt;
            serverid = prophuntid;
            servername = 'PropHunt';
            break;
        case 'pmc':
        case 'puremc':
        case 'minecraft':
            server = pure_mc;
            serverid = pure_mcid;
            servername = 'Pure Vanilla Minecraft';
            break;
        default:
        errorcheck = true;
    }
    console.log('errorcheck #1: ' + errorcheck);
    if (errorcheck !== true) {
        switch (graphtype) {
            case 'd':
            case 'day':
                graphtype = '1d';
                break;
            case 'w':
            case 'week':
                graphtype = '1w';
                break;
            case 'm':
            case 'month':
                graphtype = '1m';
                break;
            case undefined:
            case "":
            case " ":
                graphtype = '1d';
                break;
            default:
                errorcheck = true;
        }
        console.log('Graphtype: ' + graphtype);
        console.log('errorcheck #2: ' + errorcheck);
        if (errorcheck !== true) {
            var serverlink = "https://www.gametracker.com/server_info/" + server;
            console.log('URL to scrap: ' + serverlink);
            request(serverlink, options, function(error, response, html) {
                if (!error && response.statusCode == 200) {
                    console.log('Website access successful. (' + response.statusCode + ')');
                    var $ = cheerio.load(html);
                    var scanned = $('#last_scanned').text().trim();
                } else {
                    console.log('Website access error. (' + response.statusCode + ')');
                    console.log('!! Graph not sent because of website error !!');
                    console.log('----------\n');
                }
                var populationgraph = 'https://cache.gametracker.com/images/graphs/server_players.php?GSID=' + serverid + '&start=-' + graphtype + '&request=0' + requestnumber;
                console.log('graph link: ' + populationgraph + '\nlink not stable because of request parameter. Graph may be send 12h delayed.');
                msg.channel.send({embed: {
                    "description": 'Showing [' + servername + '](' + serverlink + ') population:',
                    "color": 0xFFBF52,
                    "footer": {
                        "text": scanned + " via gametracker.com",
                        'icon_url': 'https://www.gametracker.com/images/icons/icon16x16_gt.png'
                    },
                    "image": {
                        "url": populationgraph
                    }
                }});
                console.log('----------\n');
            });
        } else {
            switch (graphtype) {
                case "":
                case " ":
                case undefined:
                    msg.channel.send({embed: { 
                        "description": "You have to select a graph type! Type ``!!help population`` for more information.", 
                        "color": 0x0000ff,	
                        "thumbnail": { 
                            "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                        }
                    }});
                    break;
                default:
                    msg.channel.send({embed: { 
                        "description": "'" + graphtype + "' is not a known type of graph. Please use 'day', 'week' or 'month'.", 
                        "color": 0x0000ff,	
                        "thumbnail": { 
                            "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk1.png?1518561202682"
                        }
                    }});
            }
            console.log('!! Info not sent because of wrong/missing graph type !!');
            console.log('----------\n');
        }
    } else {
        switch (server) {
            case "":
            case " ":
            case undefined:
                msg.channel.send({embed: { 
                    "description": "You have to select a server and a graph type! Type ``!!help population`` for more information.", 
                    "color": 0x0000ff,	
                    "thumbnail": { 
                        "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                    }
                }});
                break;
            default:
                msg.channel.send({embed: { 
                    "description": "'" + server + "' is not a known server. Please use 'anime', 'modded', 'prophunt' or 'vanilla'.", 
                    "color": 0x0000ff,	
                    "thumbnail": { 
                        "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk1.png?1518561202682"
                    }
                }});
        }
        console.log('!! Info not sent because of wrong/missing server name !!');
        console.log('----------\n');
    }
}