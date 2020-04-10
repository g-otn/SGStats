/*
    Command: playerhours
    Function: Shows a player total hours in a specific SG server.
    Author: Skeke#2155
*/
//Scrap modules
const request = require('request');
const cheerio = require('cheerio');
//Required by scrapper to connect or else gives HTTP code 403 (Forbidden)
const options = { 
    headers: {'user-agent': 'node.js'}
};

//Server Addresses
const anime = "70.42.74.129:27015";
const modded = "192.223.31.40:27015";
const prophunt = "192.99.239.40:27015";
const pure_mc = "206.221.183.139:25575"; 
const starwars = "70.42.74.160:27015";
const vanilla = "192.223.24.186:27015";

//A ID gamertracker generates and uses
const animeid = "5704089";
const moddedid = "5086005";
const prophuntid = "5709398";
const pure_mcid = "5865486";
const starwarsid = "5493690";
const vanillaid = "5052174";

exports.playerhours = function(args, requesttype, checkserver, checkplayer) {

    //Update message parameters for this execution
    const msg = require('../bot.js').msg;

    var server, player, playername, searchlink, serverlink, noplayercheck, playerlink, servername;
    var scanned, hours;
    var errorcheck = false;
    var errorcheck2 = false;
    if (requesttype !== 'autoreq') {
        server = args[0];
        args = args.join(' ');
        console.log('args: ' + args);
        player = args.split(server).join(' ').trim(); 
        console.log('Server: ' + server);
        console.log('Player: ' + player);
        switch (server) {
            case 'an':
            case 'anime':
                server = anime;
                servername = 'Anime TTT';
                break;
            case 'md':
            case 'modded':
                server = modded;
                servername = 'MC TTT';
                break;
            case 'ph':
            case 'prophunt':
                server = prophunt;
                servername = 'PropHunt';
                break;
            case 'mc':
            case 'pmc':
            case 'puremc':
            case 'minecraft':
                errorcheck = true;
                break;
            case 'sw':
            case 'starwars':
                server = starwars;
                servername = 'Star Wars TTT';
                break;
            case 'va':
            case 'vanilla':
                server = vanilla;
                servername = 'Vanilla TTT';
                break;
            default:
                errorcheck = true;
        }
        if ((player === undefined || player == "" || player == " ") && errorcheck !== true) { errorcheck2 = true;}
    } else { //Check function
        server = checkserver;
        player = checkplayer;
        console.log('Server: ' + server);
        console.log('Player: ' + player);
    }
    player = player.split(' ').join('+');
    console.log('errorcheck: ' + errorcheck);
    if (errorcheck !== true && errorcheck2 !== true) {
        serverlink = "https://www.gametracker.com/server_info/" + server;
        searchlink = 'https://www.gametracker.com/server_info/' + server + '/top_players/?query=' + player;
        console.log('URLs to scrap: \nserverlink: ' + serverlink + '\nsearchlink: ' + searchlink);
        request(serverlink, options, function(error, response, html) {
            var $ = cheerio.load(html);
            scanned = $('#last_scanned').text().trim();
            request(searchlink, options, function(error, response, html) {
                if (!error && response.statusCode == 200) {
                    console.log('Website access successful. HTTP Code ' + response.statusCode);
                    var $ = cheerio.load(html);
                    noplayercheck = $('.table_lst').children().children().first().children().text().trim();
                    //console.log('noplayercheck: ' + noplayercheck);
                    if (noplayercheck !== 'No results found.') {
                        noplayercheck = false;
                        console.log('noplayercheck: ' + noplayercheck);
                        player = $('.table_lst').children().children().eq(1).children().children('a').text().trim();
                        hours = $('.table_lst').children().children().eq(1).children().eq(4).text().split('.').slice(0,1).join().trim();
                        console.log('player: ' + player);
                        console.log('hours: ' + hours);
                        if (requesttype !== 'autoreq') {
                            //If the player name has spaces
                            playername = player;
                            player = player.split(" ").join("%20");
                            playerlink = "https://www.gametracker.com/player/" + player + "/" + server + "/";
                            searchlink = searchlink.split(" ").join("%20");
                            //Sends the message
                            msg.channel.send({embed: {
                                "description": "[" + playername + "](" + playerlink + ")'s hours on [" + servername + "](" + serverlink + "): **" + hours + "**\nFor players with similar names, click [here](" + searchlink + ").",
                                "color": 0xFFBF52,
                                "footer": {
                                    "text": scanned + " via GT"
                                },
                            }});
                            console.log('----------\n');
                        } else {
                            /*
                                Check function wanted data
                            */
                            exports.output = {
                                'd1': hours, //checkdata[7]
                                'd2': player, //checkdata[8]
                                'd3': searchlink //checkdata[9]
                            }
                            console.log('---End of playerhours function');
                        }
                    } else {
                        if (requesttype !== 'autoreq') {
                            msg.channel.send({embed: { 
                                "description": "Player '" + player + "' doesn't play on this server or doesn't exist.", 
                                "color": 0x0000ff,	
                                "thumbnail": { 
                                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                                }
                            }});
                            console.log('Player not found!');
                            console.log('----------\n');
                        } else { 
                            exports.output = {
                                'd1': 'not found\nPlayer not found in GT!'
                            }
                            console.log('---End of playerhours function');
                        }
                    }
                } else {
                    if (requesttype !== 'autoreq') {
                        msg.channel.send({embed: { 
                            "description": "Couldn't access the website. HTTP code " + response.statusCode, 
                            "color": 0x0000ff,	
                            "thumbnail": { 
                                "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                            }
                        }});
                    }
                    console.log('Website access error. HTTP Code ' + response.statusCode);
                    console.log('!! Info not sent because of website error !!');
                    console.log('----------\n');
                }
            });
        });
    } else {
        if (errorcheck2 === false) {
            switch (server) {
                case 'mc':
                case 'pmc':
                case 'puremc':
                case 'minecraft':
                    msg.channel.send({embed: { 
                        "description": "Gamertracker does not support player hours of Minecraft servers.", 
                        "color": 0x0000ff,	
                        "thumbnail": { 
                            "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk4.png?1518561202898"
                        }
                    }});
                    break;
                case undefined:
                case "":
                case " ":
                    msg.channel.send({embed: { 
                        "description": "You have to select a server! Type ``!!help playerhours`` for more information.", 
                        "color": 0x0000ff,	
                        "thumbnail": { 
                            "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                        }
                    }});
                    break;
                default:
                    msg.channel.send({embed: { 
                        "description": "'" + server + "' is not a known server. Please use 'anime', 'modded', 'prophunt', 'starwars' or 'vanilla'.", 
                        "color": 0x0000ff,	
                        "thumbnail": { 
                            "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk1.png?1518561202682"
                        }
                    }});
            }
            console.log('!! Info not sent because of wrong/missing server name !!');
        } else {
            msg.channel.send({embed: { 
                "description": "You have to type a player name! Type ``!!help playerhours`` for more information.", 
                "color": 0x0000ff,	
                "thumbnail": { 
                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                }
            }});
        }
        console.log('----------\n');
    }
}