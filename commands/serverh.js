/*
    Command: serverh
    Function: Shows a graph of a player playtime of a SG server in a specific period of time
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

//Variables and functions to scrap Gamertracker base64 username
//variables
var errorcheck = false;
var rawlink, b64user, graphtype;
var scrapertarget,serverinfo, scanned, playersearch;

//function to separate the graphtype and the player name
exports.hourscmd_argsorganize = function(server, command_args, requesttype) {

    var args = require('../bot.js').args;

    //Example: !!moddedh week Skeke
    //server = ad_modded; args = ['week', 'Skeke'];
    console.log('args recieved: ' + args);
    graphtype = args[0]; // graphtype = week
    args = command_args.slice(1); // args = Skeke 
    args = args.join(' ');  // this is for names with spaces, it will join the array with a space
    playersearch = 'https://www.gametracker.com/server_info/' + server + '/top_players/?query=' + args;
    serverinfo = "https://www.gametracker.com/server_info/" + server;
    console.log('args (name): ' + args);
    console.log('graphtype: ' + graphtype);
    exports.args = args;
}

//function that selects the type of graph
exports.graphtypeselector = function(msg, args) {
    switch (graphtype) {
        case 'day':
            graphtype = '1d';
            errorcheck = false; //Unlocks the function to send images in case someone blocked it in a previous command
            break;
        case 'week':
            graphtype = '1w';
            errorcheck = false;
            break;
        case 'month':
            graphtype = '1m';
            errorcheck = false; 
            break;
        case '':
        case ' ':
        case undefined: //No graph type
            errorcheck = true; //Blocks the function to send the image since with the typing error a broken link/image will be generated   
            msg.channel.send({embed: {
                "description": "You have to select a graph type and a player username. Type ``!!help serverh`` for more information.",
                "color": 0x0000ff,
                "thumbnail": {
                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                }
            }});
            console.log('!! Image not sent because of wrong graph type !!\n----------\n');
            break;
        default: //incorrect graph type
            errorcheck = true;  
            msg.channel.send({embed: {
                "description": "'" + graphtype + "' is not a valid graphtype. Please use ``day``, ``week`` or ``month``. Type ``!!help serverh`` for more information.",
                "color": 0x0000ff,
                "thumbnail": {
                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk1.png?1518561202682"
                }
            }});
            console.log('!! Image not sent because of wrong graph type !!\n----------\n');
            break;
    }
    if (errorcheck === false) {
        switch (args) {
            case '':
            case ' ':
            case undefined:
                errorcheck = true;
                msg.channel.send({embed: {
                    "description": "You have to type a player username! Type ``!!help serverh`` for more information.",
                    "color": 0x0000ff,
                    "thumbnail": {
                        "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
                    }
                }});
                console.log('!! Image not sent because of no player name !!\n----------\n');
            break;
        }
    }
    exports.errorcheck = errorcheck;
}

//function to scrap the gamertracker base64 username'
exports.scrapGT = function(server_address, requesttype, args) {

    //Update message parameters for this execution
    const msg = require('../bot.js').msg;

    if (requesttype == 'autoreq') {
        const checkdata = require('./check.js').checkdata;
        const servertype = require('./check.js').servertype;
        server_address = servertype[0];
        playersearch = 'https://www.gametracker.com/server_info/' + servertype[0] + '/top_players/?query=' + checkdata[1];
        scrapertarget = "https://www.gametracker.com/player/" + checkdata[1] + "/" + servertype[0] + "/";
        serverinfo = "https://www.gametracker.com/server_info/" + servertype[0];
        graphtype = '1w';
        console.log('server_address: ' + server_address);
        console.log('scrapertarget: ' + scrapertarget);
        console.log('graphtype: ' + graphtype);
    }
    console.log("Search URL: " + playersearch);
    request(playersearch, options, function(error, response, html) {
        var noplayercheck = false;
        if (requesttype !== 'autoreq') {
            var $ = cheerio.load(html);
            noplayercheck = $('.table_lst').children().children().first().children().text().trim();
            if (noplayercheck !== 'No results found.') {
                noplayercheck = false;
                console.log('noplayercheck: ' + noplayercheck);
                var player = $('.table_lst').children().children().eq(1).children().children('a').text().trim();
                scrapertarget = "https://www.gametracker.com/player/" + player + "/" + server_address + "/";
            } else { //If it can't access
                msg.channel.send({embed: { 
                    "description": "Player '" + args + "' doesn't play on this server, doesn't exist or has special characters on its name. HTTP Code "  + response.statusCode, 
                    "color": 0x0000ff,	
                    "thumbnail": { 
                        "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                    }
                }});
                console.log('Website access error. HTTP Code ' + response.statusCode);
                console.log('!! Image not sent because of website error !!');
                console.log('----------\n');
            }			
        }
        if (noplayercheck === false) { //Prevents from trying to get a player that doesn't exist
            //I have to put this request inside the other or this one finishes first o.O
            //This request just scraps the 'last scanned: x minutes ago' thing
            request(serverinfo, options, function (error, response, html) {
                var $ = cheerio.load(html);
                scanned = $('#last_scanned').text().trim();
                //This request gets what we want (the info to make the graph URL)
                console.log("Player profile URL: " + scrapertarget);
                request(scrapertarget, options, function (error, response, html) {
                    console.log('Scraper started');
                    if (!error && response.statusCode == 200) {
                        console.log('Website access successful. HTTP Code ' + response.statusCode);
                        //console.log(html); Shows the entire page html, just to see if it's connected
                        var $ = cheerio.load(html);
                        rawlink = $('img#graph_player_time').attr('src'); //What we want (the link to the graph)
                        console.log('Raw scraped link: ' + rawlink);
                        function sleep3(ms) {
                            return new Promise(resolve2 => setTimeout(resolve2, ms));
                        }
                        async function waitscrap() {
                            await sleep3(1500); //waits for scrap of raw link
                            //separate the scraped raw link and get the base64 username
                            rawlink = rawlink.trim().split('nameb64=').slice(1,2).join('');
                            b64user = rawlink.trim().split('&host=').slice(0,1);
                            console.log('Base64 Username: ' + b64user);
                            var finalimage = 'https://cache.gametracker.com/images/graphs/player_time.php?nameb64=' + b64user + '&host=' + server_address + '&start=-' + graphtype + "&request=0" + requestnumber;
                            if (requesttype == 'autoreq') {
                                exports.output = finalimage; //checkdata[6]
                                console.log('---End of serverh function');
                            } else {
                                //(finnally) send the image
                                console.log('errorcheck: ' + errorcheck);
                                console.log('Graph type: ' + graphtype);
                                console.log('Image to send: ' + finalimage);
                                //Fix to links that are broken when sent to discord if the player has space in its name
                                scrapertarget = scrapertarget.split("https://www.gametracker.com/player/").slice(1,2).join();
                                scrapertarget = scrapertarget.split("/" + server_address + "/").slice(0,1).join();
                                scrapertarget = scrapertarget.split(" ").join("%20");
                                scrapertarget = "https://www.gametracker.com/player/" + scrapertarget + "/" + server_address + "/";
                                //Sends the message
                                msg.channel.send({embed: {
                                    "description": "Showing [" + player + "](" + scrapertarget + ")'s playtime:",
                                    "color": 0xFFBF52,
                                    "footer": {
                                        "text": scanned + " via GT"
                                    },
                                    "image": {
                                        "url": finalimage
                                    }
                                }});
                                console.log('----------\n');
                            }
                            //Cleans global variables (not reseted by functions)
                            errorcheck = false;
                            scrapertarget = '', serverinfo = '', scanned = '', playersearch = '';
                            rawlink = '', b64user = '', graphtype = '';
                        }
                        waitscrap();
                    } else {
                        if (requesttype !== 'autoreq') {
                            msg.channel.send({embed: { 
                                "description": "Player '" + args + "' doesn't play on this server, doesn't exist or has special characters on its name.", 
                                "color": 0x0000ff,	
                                "thumbnail": { 
                                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                                }
                            }});
                            console.log('!! Image not sent because of player name !!');
                            console.log('----------\n');
                        } else { 
                            exports.output = 'notfound';
                            console.log('---End of serverh function (not found)');
                        }
                    }
                });
            });
        } 
    });
}