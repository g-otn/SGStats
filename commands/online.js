/*
    Command: online
    Function: Shows online players from a SG server along with a population graph of that server in the last 24h
    Author: Skeke#2155
*/
//Generated number for URL
const requestnumber = require('../bot.js').req_num;
//Scrap modules
const request = require('request');
const cheerio = require('cheerio');
//Required by scrapper to connect or else gives http code 403 (Forbidden)
const options = { 
    headers: {'user-agent': 'node.js'}
};

//Server Addresses
const darkrp = "192.223.24.186:27015"
const deathrun = "70.42.74.160:27015"
const mcttt = "192.223.31.40:27015"
const prophunt = "192.99.239.40:27015"
const pure_mc = "206.221.183.139:25575" 

//A ID gamertracker generates and uses
const darkrpid = "5052174";
const mctttid = "5086005";
const deathrunid = "5493690"
const prophuntid = "5709398";
const pure_mcid = "5865486";

exports.onlineplayers = function(msg,server) {
    var errorcheck2, gtserverlink, tablecount, noplayercheck, scrapedplayer, scrapedtime, playerlist, timelist, /*finaltable,*/serverid, servername;
    errorcheck2 = false;
    switch (server) {
        case 'rp':
        case 'darkrp':
            server = darkrp;
            serverid = darkrpid;
            servername = 'DarkRP';
            break;
        case 'dr':
        case 'deathrun':
            server = deathrun
            serverid = deathrunid
            servername = 'Deathrun'
            break
        case 'mc':
        case 'mcttt':
        case 'mcmd':
            server = mcttt;
            serverid = mctttid;
            servername = 'MC TTT';
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
            errorcheck2 = true;
    }        
    var populationgraph = 'https://cache.gametracker.com/images/graphs/server_players.php?GSID=' + serverid + '&start=-1d&request=0' + requestnumber;
    console.log('errorcheck2: ' + errorcheck2);
    if (errorcheck2 !== true) {
        console.log('Selected server:' + server);
        gtserverlink = 'https://www.gametracker.com/server_info/' + server;
        console.log('URL to scrap: ' + gtserverlink);
        request(gtserverlink, options, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                console.log('Website access successful. (' + response.statusCode + ')');
                var $ = cheerio.load(html);
                var scanned = $('#last_scanned').text().trim();
                var finder1 = $('div.blocknewhdr').length;
                console.log('finder1 length: ' + finder1);
                var i;
                for (i = 0; i <= finder1; i++) {
                    tablecount = $('div.blocknewhdr').eq(i).text().trim();
                    if (tablecount == "ONLINE PLAYERS") { break;}
                }
                console.log("Found 'ONLINE PLAYERS' text at: " + i);
                tablecount = $('div.blocknewhdr').eq(i).next().next().children().children().length;
                console.log('number of <tr> found: ' + tablecount);
                noplayercheck = $('div.blocknewhdr').eq(i).next().next().children().children().first().text().trim();
                if (noplayercheck == 'No players Online') {
                    noplayercheck = true;
                    console.log('noplayercheck: ' + noplayercheck);
                    msg.channel.send({embed: {
                        "description": 'There are no players online.\n\n Server population throughout the day:',
                        "color": 0xFFBF52,
                        "footer": {
                            "text": scanned + " via GT",
                            'icon_url': 'https://www.gametracker.com/images/icons/icon16x16_gt.png'
                        },
                        "image": {
                            "url": populationgraph
                        }
                    }});
                    console.log('----------\n');
                } else {
                    noplayercheck = false;
                    console.log('noplayercheck: ' + noplayercheck);
                    tablecount = tablecount - 1;
                    console.log('Total online players: ' + tablecount);
                    //Next two lines transform the variables into arrays so they can store the incoming data
                    playerlist = [];
                    timelist = [];
                    var i2;
                    for (i2 = 0; i2 <= tablecount; i2++) {
                        var finder2 = i2 + 1;
                        var finder3 = i2; //This
                        if (finder2 == tablecount + 1) { break;}
                        scrapedplayer = $('div.blocknewhdr').eq(i).next().next().children().children().eq(finder2).children().children('a').text().trim() + '';
                        //console.log(scrapedplayer);
                        scrapedtime = $('div.blocknewhdr').eq(i).next().next().children().children().eq(finder2).children().eq(3).text().trim();
                        if (scrapedplayer !== '') { 
                            playerlist[finder3] = scrapedplayer;
                            timelist[finder3] = scrapedtime;
                            timelist[finder3] = timelist[finder3].split(':');
                            //console.log('timelist[finder3] length:' + timelist[finder3].length);
                            if (timelist[finder3].length == 3) { timelist[finder3] = timelist[finder3].slice(0,2).join('h') + 'min';}
                            else { timelist[finder3] = timelist[finder3].slice(0,1).join() + 'min';}
                            //console.log('Player #' + finder2 + ': ' + scrapedplayer + '\nPlaytime: ' + scrapedtime);
                        } else {
                            playerlist.slice(finder3-1, finder3+1);
                            finder3--;
                            //console.log('Player #' + finder2 + ' in blank, ignored.');
                        }
                    }
                    //console.log('Playerlist: ' + playerlist);
                    //console.log('Timelist:' + timelist);
                    playerlist = playerlist.join('\n');
                    timelist = timelist.join("\n");
                    console.log('Graph link: ' + populationgraph);
                    msg.channel.send({embed: {
                        "description": 'Showing ['+ servername +'](' + gtserverlink + ') online players and population throughout the day:',
                        "color": 0xFFBF52,
                        "footer": {
                            "text": scanned + " via gamertracker.com",
                            'icon_url': 'https://www.gametracker.com/images/icons/icon16x16_gt.png'
                        },
                        "fields": [
                            {
                                "name": "Player Name",
                                "value": playerlist,
                                "inline": true
                            },
                            {
                                "name": "Time Played",
                                "value": timelist,
                                "inline": true
                            }
                        ],
                        "image": {
                            "url": populationgraph
                        }
                    }});
                    console.log('----------\n');
                }
            } else {
                msg.channel.send({embed: { 
                    "description": "Couldn't access the website. (" + response.statusCode + ')', 
                    "color": 0x0000ff,	
                    "thumbnail": { 
                        "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                    }
                }});
                console.log('Website access error. (' + response.statusCode + ')');
                console.log('!! Info not sent because of website error !!');
                console.log('----------\n');
            }
        });
    } else {
        switch (server) {
            case "":
            case " ":
            case undefined:
                msg.channel.send({embed: { 
                    "description": "You have to select a server! Type ``!!help online`` for more information.", 
                    "color": 0x0000ff,	
                    "thumbnail": { 
                        "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                    }
                }});
                break;
            default:
                msg.channel.send({embed: { 
                    "description": "'" + server + "' is not a known server. please use 'darkrp', 'deathrun', 'mcttt' or 'prophunt'.", 
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