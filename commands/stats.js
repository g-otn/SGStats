/*
    Command: stats
    Function: Shows a player rank, hours, score and score/min in specific SG server.
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
const mcttt = "192.223.31.40:27015";
const modded = "192.223.24.186:27015";
const prophunt = "192.99.239.40:27015";

exports.stats = async function(msg, args, requesttype, checkserver, checkplayer) {
    var server, player, playername, searchlink, serverlink, noplayercheck, playerlink, servername;
    var scanned, rank, score, hours, score_min;
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
            case 'mc':
            case 'mcttt':
            case 'mcmd':
                server = mcttt;
                servername = 'MC TTT';
                break;
            case 'md':
            case 'modded':
            case 'mdttt':
                server = modded;
                servername = 'Modded TTT';
                break;
            case 'pmc':
            case 'puremc':
            case 'minecraft':
                errorcheck = true;
                break;
            case 'ph':
            case 'prophunt':
                server = prophunt;
                servername = 'PropHunt';
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
                    console.log('Website access successful. (' + response.statusCode + ')');
                    var $ = cheerio.load(html);
                    noplayercheck = $('.table_lst').children().children().first().children().text().trim();
                    //console.log('noplayercheck: ' + noplayercheck);
                    if (noplayercheck !== 'No results found.') {
                        noplayercheck = false;
                        console.log('noplayercheck: ' + noplayercheck);
                        rank = $('.table_lst').children().children().eq(1).children().eq(0).text().trim();
                        player = $('.table_lst').children().children().eq(1).children().children('a').text().trim();
                        score = $('.table_lst').children().children().eq(1).children().eq(3).text().trim();
                        hours = $('.table_lst').children().children().eq(1).children().eq(4).text().split('.').slice(0,1).join().trim();
                        score_min = $('.table_lst').children().children().eq(1).children().eq(5).text().trim();
                        console.log('rank:', rank, 'player:', player, 'score:', score, 'hours:', hours, 'score/min:', score_min);
                        if (requesttype !== 'autoreq') {
                            //String cleaning (removes spaces and parethensis) and assembling
                            playername = player;
                            player = player.split(" ").join("%20").split("(").join("%28").split(")").join("%29");
                            playerlink = "https://www.gametracker.com/player/" + player + "/" + server + "/";
                            searchlink = searchlink.split(" ").join("%20").split("(").join("%28").split(")").join("%29");
                            //Sends the message
                            msg.channel.send({embed: {
                                "title": playername + "'s stats on " + servername,
                                "url": playerlink,
                                "description": "For players with similar names, click [here](" + searchlink + ").",
                                "color": 0xFFBF52,
                                "footer": {
                                    "text": scanned + " via gametracker.com",
                                    'icon_url': 'https://www.gametracker.com/images/icons/icon16x16_gt.png'
                                },
                                "fields": [
                                    {
                                        "name": "Rank",
                                        "value": rank,
                                        "inline": true
                                    },
                                    {
                                        "name": "Score",
                                        "value": score,
                                        "inline": true
                                    },
                                    {
                                        "name": "Hours",
                                        "value": hours,
                                        "inline": true
                                    },
                                    {
                                        "name": "Score/Min",
                                        "value": score_min,
                                        "inline": true
                                    }
                                ]
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
                            console.log('---End of stats function');
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
                            console.log('---End of stats function');
                        }
                    }
                } else {
                    if (requesttype !== 'autoreq') {
                        msg.channel.send({embed: { 
                            "description": "Couldn't access the website. (" + response.statusCode + ')', 
                            "color": 0x0000ff,	
                            "thumbnail": { 
                                "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                            }
                        }});
                    }
                    console.log('Website access error. (' + response.statusCode + ')');
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
                        "description": "You have to select a server! Type ``!!help stats`` for more information.", 
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
        } else {
            msg.channel.send({embed: { 
                "description": "You have to type a player name! Type ``!!help stats`` for more information.", 
                "color": 0x0000ff,	
                "thumbnail": { 
                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                }
            }});
        }
        console.log('----------\n');
    }
}