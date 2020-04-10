//Auto ping so Glitch doesn't sleep (DEACTIVATED WHEN NOT ON HOST)
/*const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);*/
//===========================================================================
const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const botinfo = require('./package.json');
const request = require('request');
const cheerio = require('cheerio');

    /* Bot made by Skeke#2155 in Jan 2018 | Special thanks: Hades#6871 */

//Console bot iniciation confirmation
bot.on("ready", () => {
    console.clear();
    console.log(botinfo.name + ' v' + botinfo.version + ' started. \nAuthor: ' + botinfo.author);
    console.log('Prefix: ' + config.prefix);
    console.log('============================\n');
});

//Detect messages
bot.on("message", (msg) => {
    //Ignore the message if it doesn't start with the prefix or it's from a bot
    if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
    
    //Log in the console about the command
    console.log('Command by ' + msg.author.username+'#'+msg.author.discriminator + ' in #' + msg.channel.name + ': ' + msg.content);



    //Separate the prefix from the rest ('!hue br 123' -> 'hue br 123')
    var p_cmd_arg = msg + ''; //Transforms the command into a string
    var cmd_arg = p_cmd_arg.replace(config.prefix, ''); //Replaces the prefix for nothing ('');
    var cmd_arg = cmd_arg.toString();
    //Separation between command (w/o prefix) and arguments  
    //Separate arguments (['hue', 'br', '123'] -> ['br', '123'])
    var args = cmd_arg.trim().split(' ').slice(1);
    //Separate command (['hue', 'br', '123'] -> ['hue'])
    var cmd = cmd_arg.trim().split(' ').slice(0,1);
    var cmd = cmd.toString();
    console.log('Command: ' + cmd);
    console.log('Arguments: ' + args);



    //Server Addresses
    const anime = "70.42.74.129:27015";
    const modded = "192.223.31.40:27015";    
    const roleplay = "70.42.74.160:27015";
    const vanilla = "192.223.24.186:27015";

    //A ID gamertracker generates and uses
    const animeid = "5704089";
    const moddedid = "5086005";
    const roleplayid = "5493690";
    const vanillaid = "5052174";
    //cmd = ['hue'];
    //args = ['br, '123']


	/*Everytime you click to show the graph, a new number is generated, but the scraper can't click, 
	so this number is never scraped and all the graph commands may be sent with delayed hours/days.
	This is an attempt to make the URL 'request' parameter work by generating a random number with the
	same number of digits that the original has. */
	//To deactivate this system hide the first line (the math line) and remove the // from the second line (the "")
	var requestnumber = Math.floor(Math.random() * 9999999999999990);
	//var requestnumber = "";


    //Variables and functions to scrap Gamertracker base64 username
    //variables
    var errorcheck;
    var rawlink, b64user, GTid, graphtype;
    var scrapertarget, url, serverinfo, scanned;
    /*idk what this is but if I don't do this gamertracker does not let 
    me connect to the website (HTTP code 403 (forbidden))*/
    var options = { 
        headers: {'user-agent': 'node.js'}
      }
    //function to separate the graphtype and the player name
    function hourscmd_argsorganize(server, command_args) { 
        //Example: !!moddedh week Skeke
        //server = ad_modded; args = ['week', 'Skeke'];
        graphtype = args[0]; // graphtype = week
        args = command_args.slice(1); // args = Skeke 
        args = args.join(' ');  // this is for names with spaces, it will join the array with a space
        scrapertarget = "https://www.gametracker.com/player/" + args + "/" + server + "/";
        serverinfo = "https://www.gametracker.com/server_info/" + server;
        console.log("URL to scrap: " + scrapertarget);    
    }
    //function to scrap the gamertracker base64 username'
    function scrapGT(server_address) {
    	//This first request just scraps the 'last scanned: x minutes ago' thing
    	request(serverinfo, options, function (error, response, html) {
    		var $ = cheerio.load(html);
    		scanned = $('#last_scanned').text();
    		scanned = scanned.trim();
            //I have to put this request inside the other or this one finishes first o.O
            //This request gets what we want (the info to make the graph URL)
            request(scrapertarget, options, function (error, response, html) {
            	console.log('Scraper started');
            	if (!error && response.statusCode == 200) {
                	console.log('Website access successful. HTTP Code ' + response.statusCode);
                	//console.log(html); Shows the entire page html, just to see if it's connected
                	var $ = cheerio.load(html);
                	rawlink = $('img#graph_player_time').attr('src'); //What we want (the link to the graph)
                	console.log('Raw scraped link: ' + rawlink);

                	extract_nameb64(server_address);

            	} else { //If it can't access
                	msg.channel.send("Player '" + args + "' doesn't play on this server, doesn't exist or has special characters on its name. HTTP Code "  + response.statusCode);
                	console.log('Website access error. HTTP Code ' + response.statusCode);
                	console.log('!! Image not sent because of website error !!');
            		console.log('----------\n');
            	}
        	});
        });
    }
    //function to separate the scraped raw link and get the base64 username
    function extract_nameb64(server_address) {
    	if (rawlink !== undefined) {
    		rawlink = rawlink.trim().split('nameb64=').slice(1,2).join('');
        	b64user = rawlink.trim().split('&host=').slice(0,1);
        	console.log('Base64 Username: ' + b64user);
        	//Fix that sends the correct 'request' image (not working because the loaded html doesn't have this)
        	/*rawlink = rawlink.trim().split('&request=').slice(1,2).join();
        	console.log('GT Request number: ' + rawlink);*/
        	
        	sendimage(server_address, rawlink);

    	} else {
    		msg.channel.send("Player '" + args + "' doesn't play on this server, doesn't exist or has special characters on its name.");
    		console.log('!! Image not sent because of player name !!');
    		console.log('----------\n');
    	}
    }
    //function that selects the type of graph
    function graphtypeselector() {
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
		    default: //If does not match with one of those 3 above
		    	errorcheck = true; //Blocks the function to send the image since with the typing error a broken link/image will be generated   
		        break;
		}
    }
    //function to (finnally) send the image
    function sendimage(ip) {
    	console.log('errorcheck: ' + errorcheck);
    	console.log('Graph type: ' + graphtype);
    	var finalimage = 'https://cache.gametracker.com/images/graphs/player_time.php?nameb64=' + b64user + '&host=' + ip + '&start=-' + graphtype + "&request=0" + requestnumber;
    	console.log('Image to send: ' + finalimage);
    	//Fix to links that are broken when sent to discord if the player has space in its name
    	scrapertarget = scrapertarget.split("https://www.gametracker.com/player/").slice(1,2).join();
    	scrapertarget = scrapertarget.split("/" + ip + "/").slice(0,1).join();
    	scrapertarget = scrapertarget.split(" ").join("%20");
		scrapertarget = "https://www.gametracker.com/player/" + scrapertarget + "/" + ip + "/";
		//Sends the message
    	msg.channel.send({embed: {
		  	"description": "Showing [" + args + "](" + scrapertarget + ")'s playtime:",
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



    function steaminfo(input)  {
        var steamid, name, profilelink, profilestate, steamid64, customURL; //scraped in steamidfinder
        var profileicon, gmodh, privatecheck; //scraped from steam
        var customID, gameslist; //made with scraped values
    	var idfinderlink = 'https://steamidfinder.com/lookup/' + input;
    	console.log('URL to scrap: ' + idfinderlink);
    	request(idfinderlink, options, function (error, response, html) {
            console.log('Scraper started');
            if (!error && response.statusCode == 200) {
                console.log('Website access successful. HTTP Code: ' + response.statusCode);
                var $ = cheerio.load(html);
                //gathers the steamid (if it's found)
                steamid = $('title').text();
                steamid = steamid.split(' ').slice(0,1).join();
                console.log('Steam ID: ' + steamid)
                if (steamid !== 'Steam') {
                    //gathers the name
                    name = $('title').text();
                    name = name.split('(').slice(1,2).join();
                    name = name.split(')').slice(0,1).join();
                    //if (name.indexOf(' ') > -1) { name = name.split(' ').join('%20');}
                    console.log('Name: ' + name);
                    //Gathers the steam profile link
                    profilelink = $('code').children('a').text();
                    profilelink = profilelink.trim().split('http://steamcommunity.com/profiles/').slice(1,2).join();
                    profilelink = 'http://steamcommunity.com/profiles/' + profilelink;
                    console.log('Profile link: ' + profilelink);
                    //Gathers the steam profile state (public or private) //%20
                    profilestate = $('code').children('a').last().parent().next().next().text();
                    console.log('Profile state: ' + profilestate);
                    //Gathers the steamid64 (who knows if you might need it)
                    steamid64 = $('code').children('a').first().parent().prev().prev().text();
                    console.log('SteamID64: ' + steamid64)
                    gameslist = "https://steamcommunity.com/profiles/" + steamid64 + "/games/?tab=all";
                    //Gathers customURL (for gmod hours which uses custom URL)
                    customURL = $('code').children('a').first().attr('href');
                    console.log('Custom URL: ' + customURL);
                    customID = customURL.split('http://steamcommunity.com/id/').slice(1,2).join();
                    if (profilelink == customURL) { customID = name;}
                    console.log('Player custom ID: ' + customID);
                    //Gathers the avatar icon from the steam profile
                    request(profilelink, options, function(error, response, html) {
                        var $ = cheerio.load(html);
                        profileicon = $('.playerAvatarAutoSizeInner').children().attr('src');
                        profileicon = profileicon.trim();
                        profileicon = profileicon + "";
                        console.log(profileicon);
                        //double-check if the profile is private (sometimes steamidfinder gets it wrong)
                        privatecheck = $('body').hasClass('private_profile');
                        console.log('privatecheck: ' + privatecheck);
                        if (profilestate !== 'not set') {
                            if (privatecheck == true) { profilestate = 'private';}
                        }
                        //Gathers Garry's Mod hours
                        if (profilestate == 'public' && profilestate !== 'private' && profilestate !== 'not set') { //This doesn't work if the profile is private nor if Garry's mod isn't in the profile main page
                            var recentgamesl = $('div.game_name').children('a').length; //Check for how many recent games there are in the page
                            var i;
                            for (i = 0; i <= recentgamesl; i++) {
                                gmodh = $('div.game_name').children('a').eq(i).text(); 
                                if (gmodh == "Garry's Mod") { break;} //Check which scraped game of the recent games is Garry's mod
                            }
                            console.log('i: ' + i);
                            gmodh = $('div.game_name').children('a').eq(i).parent().prev().text();
                            gmodh = gmodh.trim().split(' ').slice(0,1).join();
                            console.log("Gmod hours: " + gmodh);
                        } else {
                        	gmodh = 'unknown';
                            customID = name;
                            console.log("Gmod hours private");
                        }
                        //Again I need to put this inside otherwise it tries to send the message before the request above finishes
                        msg.channel.send({embed: {
                            "description": "'"+input+"' info: \n\nName: **"+name+"** ("+customID+")\nProfile: ["+profilestate+"]("+profilelink+")\nSteamID: `"+steamid+"`\nSteamID64: `"+steamid64+"`\nGmod hours: "+gmodh+" [(check)]("+gameslist+")",
                            "color": 0x293956,
                            "footer": {
                                "text": "Searched via steamidfinder.com | Use SteamIDs for more accurate searches!"
                            },
                            "thumbnail": {
                                "url": profileicon
                            }
                        }});
                        console.log('----------\n');
                    });
                } else {
                    msg.channel.send('The website could not find the user.');
					console.log('!! User not found !!');
					console.log('----------\n');
                }
            } else {
                console.log('Website access error. HTTP Code: ' + response.statusCode + '\n');
                console.log('!! Steam info not sent because of website error !!');
                console.log('----------\n');
            }
        });
    }



	//Function to check online players and population troughtout the day
	    function onlineplayers(server) {
	        var errorcheck2, gtserverlink, tablecount, noplayercheck, scrapedplayer, scrapedtime, playerlist, timelist, /*finaltable,*/serverid;
			errorcheck2 = false;
	        switch (server) {
	            case 'anime':
	                server = anime;
	                serverid = animeid;
	                break;
	            case 'modded':
	                server = modded;
	                serverid = moddedid;
	                break;
	            case 'roleplay':
	                server = roleplay;
	                serverid = roleplayid;
	                break;
	            case 'vanilla':
	                server = vanilla;
	                serverid = vanillaid;
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
	                    console.log('Website access successful. HTTP Code: ' + response.statusCode);
	                    var $ = cheerio.load(html);
	                    var scanned = $('#last_scanned').text();
	                    scanned = scanned.trim();
	                    var finder1 = $('div.blocknewhdr').length;
	                    console.log('finder1 length: ' + finder1);
	                    var i;
	                    for (i = 0; i <= finder1; i++) {
	                        tablecount = $('div.blocknewhdr').eq(i).text();
	                        tablecount = tablecount.trim();
	                        if (tablecount == "ONLINE PLAYERS") { break;}
	                    }
	                    console.log("Found 'ONLINE PLAYERS' text at: " + i);
	                    tablecount = $('div.blocknewhdr').eq(i).next().next().children().children().length;
	                    console.log('number of <tr> found: ' + tablecount);
	                    noplayercheck = $('div.blocknewhdr').eq(i).next().next().children().children().first().text();
	                    noplayercheck = noplayercheck.trim();
	                    if (noplayercheck == 'No players Online') {
	                        noplayercheck = true;
							console.log('noplayercheck: ' + noplayercheck);
							msg.channel.send({embed: {
	                            "description": 'There are no players online.\n\n Server population throughout the day:',
	                            "color": 0xFFBF52,
	                            "footer": {
	                                "text": scanned + " via GT"
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
	                            scrapedplayer = $('div.blocknewhdr').eq(i).next().next().children().children().eq(finder2).children().children('a').text();
	                            scrapedplayer = scrapedplayer.trim() + '';
	                            console.log(scrapedplayer);
	                            scrapedtime = $('div.blocknewhdr').eq(i).next().next().children().children().eq(finder2).children().eq(3).text();
	                            scrapedtime = scrapedtime.trim();
	                            if (scrapedplayer !== '') { 
	                                playerlist[finder3] = scrapedplayer;
	                                timelist[finder3] = scrapedtime;
	                                timelist[finder3] = timelist[finder3].split(':')
	                                console.log('timelist[finder3] length:' + timelist[finder3].length);
	                                if (timelist[finder3].length == 3) { timelist[finder3] = timelist[finder3].slice(0,2).join('h') + 'min';}
	                                else { timelist[finder3] = timelist[finder3].slice(0,1).join() + 'min';}
	                                console.log('Player #' + finder2 + ': ' + scrapedplayer + '\nPlaytime: ' + scrapedtime);
	                            } else {
									playerlist.slice(finder3-1, finder3+1);
									finder3--;
	                                console.log('Player #' + finder2 + ' in blank, ignored.');
	                            }
	                        }
	                        console.log('Playerlist: ' + playerlist);
							console.log('Timelist:' + timelist);
							playerlist = playerlist.join('\n');
							timelist = timelist.join("\n");
	                        /*var i3;
	                        finaltable = '';
	                        for (i3 = 0; i3 <= playerlist.length - 1; i3++) {
	                            if (timelist[i3] && playerlist[i3] !== undefined) { //This removes those ghost players that gametracker creates for some reason
									finaltable = finaltable + timelist[i3] + ' - **' + playerlist[i3] + '**\n';
									
	                            }
	                        }
	                        console.log(finaltable);*/
							console.log('Graph link: ' + populationgraph + '\nlink not stable because of request parameter. Graph may be send 12h delayed.');
	                        msg.channel.send({embed: {
	                            "description": 'Showing [server](' + gtserverlink + ') online players and population throughout the day:',
	                            "color": 0xFFBF52,
	                            "footer": {
	                                "text": scanned + " via GT"
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
						msg.channel.send("Couldn't access the website. HTTP code " + response.statusCode);
						console.log('Website access error. HTTP Code: ' + response.statusCode + '\n');
						console.log('!! Info not sent because of website error !!');
						console.log('----------\n');
					}
	            });
	        } else {
	            msg.channel.send("'" + server + "' is not a known server. please use 'anime', 'modded', 'roleplay' or 'vanilla'.");
	            console.log('!! Info not sent because of wrong server name !!');
	            console.log('----------\n');
	        }
	    }



	//Function to send population graph
	function populationgraph(server, graphtype) {
	    var serverid;
	    var errorcheck = false;
	    console.log('Server: ' + server);
	    switch (server) {
	        case 'anime':
	            server = anime;
	            serverid = animeid;
	            break;
	        case 'modded':
	            server = modded;
	            serverid = moddedid;
	            break;
	        case 'roleplay':
	            server = roleplay;
	            serverid = roleplayid;
	            break;
	        case 'vanilla':
	            server = vanilla;
	            serverid = vanillaid;
	            break;
	        default:
	            errorcheck = true;
	    }
	    console.log('errorcheck #1: ' + errorcheck);
	    if (errorcheck !== true) {
	        switch (graphtype) {
	            case 'day':
	                graphtype = '1d';
	                break;
	            case 'week':
	                graphtype = '1w';
	                break;
	            case 'month':
	                graphtype = '1m';
	                break;
	            case undefined:
	                graphtype = '1d';
	                break;
	            default:
	                errorcheck = true;
	        }
	        console.log('Graphtype: ' + graphtype)
	        console.log('errorcheck #2: ' + errorcheck);
	        if (errorcheck !== true) {
	            var serverlink = "https://www.gametracker.com/server_info/" + server;
	            console.log('URL to scrap: ' + serverlink);
	            request(serverlink, options, function(error, response, html) {
	                if (!error && response.statusCode == 200) {
	                    console.log('Website access successful. HTTP Code ' + response.statusCode);
	                    var $ = cheerio.load(html);
	                    var scanned = $('#last_scanned').text();
	                    scanned = scanned.trim();
	                } else {
	                    console.log('Website access error. HTTP Code ' + response.statusCode + '\n');
	                    console.log('!! Graph not sent because of website error !!');
	                    console.log('----------\n');
	                }
	                var populationgraph = 'https://cache.gametracker.com/images/graphs/server_players.php?GSID=' + serverid + '&start=-' + graphtype + '&request=0' + requestnumber;
	                console.log('graph link: ' + populationgraph + '\nlink not stable because of request parameter. Graph may be send 12h delayed.');
	                msg.channel.send({embed: {
	                    "description": 'Showing [server](' + serverlink + ') population:',
	                    "color": 0xFFBF52,
	                    "footer": {
	                        "text": scanned + " via GT"
	                    },
	                    "image": {
	                        "url": populationgraph
	                    }
	                }});
	                console.log('----------\n');
	            });
	        } else {
	            msg.channel.send("'" + graphtype + "' is not a known type of graph. Please use 'day', 'week' or 'month'.");
	            console.log('!! Info not sent because of wrong server name !!');
	            console.log('----------\n');
	        }
	    } else {
	        msg.channel.send("'" + server + "' is not a known server. Please use 'anime', 'modded', 'roleplay' or 'vanilla'.");
	        console.log('!! Info not sent because of wrong server name !!');
	        console.log('----------\n');
	    }
	}



	//Function to get player's gametracker hours in a server table_lst
	function playerhours(args) {
		var server, player, playername, searchlink, serverlink, errorcheck, noplayercheck, playerlink, servername;
		var scanned, hours;
		errorcheck = false;
		server = args[0];
		args = args.join(' ');
		console.log('args: ' + args);
		player = args.split(server).join(' ').trim(); 
		console.log('Server: ' + server);
		console.log('Player: ' + player);
		switch (server) {
			case 'anime':
				server = anime;
        servername = 'Anime TTT';
				break;
			case 'modded':
				server = modded;
        servername = 'MC TTT';
				break;
			case 'roleplay':
				server = roleplay;
        servername = 'DarkRP';
				break;
			case 'vanilla':
				server = vanilla;
        servername = 'Vanilla TTT';
				break;
			default:
				errorcheck = true;
		}
		console.log('errorcheck: ' + errorcheck);
	    if (errorcheck !== true) {
			serverlink = "https://www.gametracker.com/server_info/" + server;
			searchlink = 'https://www.gametracker.com/server_info/' + server + '/top_players/?query=' + player;
			console.log('URLs to scrap: \n' + serverlink + '\n' + searchlink);
			request(serverlink, options, function(error, response, html) {
				var $ = cheerio.load(html);
				scanned = $('#last_scanned').text();
				scanned = scanned.trim();
				request(searchlink, options, function(error, response, html) {
					if (!error && response.statusCode == 200) {
						console.log('Website access successful. HTTP Code ' + response.statusCode);
						var $ = cheerio.load(html);
						noplayercheck = $('.table_lst').children().children().first().children().text();
						noplayercheck = noplayercheck.trim();
						//console.log('noplayercheck: ' + noplayercheck);
						if (noplayercheck !== 'No results found.') {
							noplayercheck = false;
							console.log('noplayercheck: ' + noplayercheck);
							player = $('.table_lst').children().children().eq(1).children().children('a').text();
							player = player.trim();
							hours = $('.table_lst').children().children().eq(1).children().eq(4).text();
							hours = hours.split('.').slice(0,1).join().trim();
							console.log('player: ' + player);
							console.log('hours: ' + hours);
							//If the player name has spaces
							playername = player;
							player = player.split(" ").join("%20");
							playerlink = "https://www.gametracker.com/player/" + player + "/" + server + "/";
							
							//Sends the message
							msg.channel.send({embed: {
								"description": "[" + playername + "](" + playerlink + ")'s hours on [" + servername + "](" + serverlink + "): **" + hours + "**",
							  	"color": 0xFFBF52,
							  	"footer": {
								  	"text": scanned + " via GT"
							  	},
						  	}});
						  	console.log('----------\n');
						} else {
							msg.channel.send("Player doesn't play on this server or doesn't exist.");
							console.log('Player not found!');
							console.log('----------\n');
						}
					} else {
						msg.channel.send("Couldn't access the website. HTTP code " + response.statusCode);
						console.log('Website access error. HTTP Code ' + response.statusCode);
						console.log('!! Info not sent because of website error !!');
						console.log('----------\n');
					}
				});
			});
		} else {
	        msg.channel.send("'" + server + "' is not a known server. Please use 'anime', 'modded', 'roleplay' or 'vanilla'.");
	        console.log('!! Info not sent because of wrong server name !!');
	        console.log('----------\n');
		}
	}



	//Function to search for a player gamertracker hours and other info (broken because scraper can't find the text because it isn't between tags)
	/*function gtplayerinfo(server, playername) {
		var gtplayerlink, finder1, holder1, joined, last_seen, hours;
		console.log('Player: ' + playername);
		gtplayerlink = "https://www.gametracker.com/player/" + playername + "/" + server + "/";
		console.log('URL to scrap: ' + gtplayerlink);
		request(gtplayerlink, options, function(error, response, html) {
			if (!error && response.statusCode == 200) {
				console.log('Website access successful. HTTP Code ' + response.statusCode);
				var $ = cheerio.load(html);
				finder1 = $('.item_color_title') //Shows what it found
				console.log('finder1 test:\n' + finder1);
				finder1 = $('.item_color_title').length;
				console.log('finder1 length: ' + finder1);
				if (finder1 !== 0) {
					var i;
					for (i = 0; i <= finder1 - 1; i++) {
						joined = $('span.item_color_title').eq(i).text();
						joined = joined.trim();
						console.log('Joined finder #' + (i + 1) + ': ' + joined);
						if (joined == 'Last Seen:') { break;}
					}
					console.log(joined);
					joined = $('span.item_color_title').eq(i).next().text(); //Not working because the text can't be scraped
					console.log(joined);
				} else {
					msg.channel.send("Player '" + playername + "' doesn't exist, doesn't play on a Garry's Mod server or has special characters on its name. HTTP code " + response.statusCode);
					console.log('!! Info not sent because of player name error (?) !!');
					console.log('----------\n');
				}
			} else {
				msg.channel.send("Player '" + playername + "' doesn't exist, doesn't play on a Garry's Mod server or has special characters on its name. HTTP code " + response.statusCode);
				console.log('Website access error. HTTP Code ' + response.statusCode + '\n');
				console.log('!! Info not sent because of website error !!');
				console.log('----------\n');
			}
		});
	}*/



	//help command
	function help(command) {
		var desc, syntax, ex, notes;
		var defaultcheck = false;
		var commandlist = [
			, //idk why but without this it sends without the first value "serverh"
      "server (soon)",
			"serverh",
			"steaminfo",
			"online",
			"population",
			"playerhours",
			"hue"
		]
		commandlist = commandlist.join('\n');
		console.log('Command to help: ' + command);
		notes = " ";
		switch (command) {
      case 'server':
        desc = "Shows info about a specific server (not yet implemented)";
        syntax = "<server>";
        notes = "Servers: 'anime', 'modded', 'roleplay' or 'vanilla'"
        ex = config.prefix + "modded; " + config.prefix + "vanilla";
        break;
			case 'serverh':
				desc = "Shows a graph of a player playtime of a Smithtainment server in a specific period of time.";
				syntax = "<server>h <period> <playername>";
				notes = "Servers: 'anime', 'modded', 'roleplay' or 'vanilla'\nPeriod: 'day', 'week' or 'month'"
				ex = "moddedh week Skeke";
				break;
			case 'steaminfo':
				desc = "Shows info from steam of a player";
				syntax = "steaminfo <input>";
				notes = "Input: SteamID, SteamID64, SteamID3 or customURL"
				ex = "steaminfo STEAM_1:0:70936906";
				break;
			case 'online':
				desc = "Shows online players from a Smithtainment server along with a population graph of that server in the last 24h.";
				syntax = "online <server>";
				notes = "Servers: 'anime', 'modded', 'roleplay' or 'vanilla'"
				ex = "online modded";
				break;
			case 'population':
				desc = "Shows a graph of population of a Smithtainment server during a specific time period.";
				syntax = "population <server> <period>";
				notes = "Servers: 'anime', 'modded', 'roleplay' or 'vanilla'\nPeriod: 'day', 'week' or 'month'"
				ex = "population vanilla month";
				break;
			case 'playerhours':
				desc = "Shows a player total hours in a specific Smithtainment server.";
				syntax = "playerhours <server> <player>";
				notes = "Servers: 'anime', 'modded', 'roleplay' or 'vanilla'"
				ex = "playerhours Skeke";
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
					"description": '**Showing SmitainmentGTStats commands** \n*Type ' + config.prefix + 'help <command> for specific info.* \n```' + commandlist + "```",
					"color": 0x0000ff,
					"footer": {
						"text": "SmithtainmentStats v" + botinfo.version + " by Skeke#2155, special thanks Hades#6871"
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
					"text": "SmithtainmentStats v" + botinfo.version + " by Skeke#2155, special thanks Hades#6871"
				},
				"fields": [
					{
						"name": "Syntax",
						"value": "``" + config.prefix + syntax + "``" + notes,
					},
					{
						"name": "Example",
						"value": "``" + config.prefix + ex + "``",
					}
				  ]
			}});
		}
    console.log('----------\n');
	}






	//Commands
  switch (cmd) {
    case 'animeh':
      hourscmd_argsorganize(anime, args);
      graphtypeselector();
      if (errorcheck !== true) {
    	  scrapGT(anime);
      } else {
    	  msg.channel.send("'" + graphtype + "' is not a valid graphtype. Please use 'day', 'week' or 'month'.");
        console.log('!! Image not sent because of wrong graph type !!\n----------\n');
    	}
      break;
    case 'moddedh':
      hourscmd_argsorganize(modded, args);
      graphtypeselector();
      if (errorcheck !== true) {
    	  scrapGT(modded);
      } else {
    	  msg.channel.send("'" + graphtype + "' is not a valid graphtype. Please use 'day', 'week' or 'month'.");
        console.log('!! Image not sent because of wrong graph type !!\n----------\n');
    	}
      break;
    case 'roleplayh':
      hourscmd_argsorganize(roleplay, args);
      graphtypeselector();
      if (errorcheck !== true) {
    	  scrapGT(roleplay);
      } else {
    		msg.channel.send("'" + graphtype + "' is not a valid graphtype. Please use 'day', 'week' or 'month'.");
        console.log('!! Image not sent because of wrong graph type !!\n----------\n');
    	}
      break;
    case 'vanillah':
      hourscmd_argsorganize(vanilla, args);
      graphtypeselector();
      if (errorcheck !== true) {
    	  scrapGT(vanilla);
      } else {
        msg.channel.send("'" + graphtype + "' is not a valid graphtype. Please use 'day', 'week' or 'month'.");
        console.log('!! Image not sent because of wrong graph type !!\n----------\n');
    	}
      break;
    case 'steaminfo':
      args = args.join(' ');
      steaminfo(args);
      break;
    case 'online':
      args = args.join('').trim();
      onlineplayers(args);
      break;
    case 'population':
      populationgraph(args[0], args[1]);
			break;
		case 'playerhours':
			playerhours(args);
			break;
    	case 'hue':
      msg.channel.send('br');
      break;   
    case 'help':
			args = args.join(' ').trim();
			help(args);
      break;
    case 'serverh':
      msg.channel.send('Please select a server. Use ``' + config.prefix + 'help serverh`` for more information.');
    //Commands of the python bot that this bot will ignore
    case 'anime':
      msg.channel.send('command coming soon');
      break;
    case 'modded':
      msg.channel.send('command coming soon');
      break;
    case 'roleplay':
      msg.channel.send('command coming soon');
      break;
    case 'vanilla':
      msg.channel.send('command coming soon');
      break;
    default:
      msg.channel.send("'" + cmd + "' is not a known command.")
      console.log('!! Invalid command !!');
      console.log('----------\n');
  }
});

//Makes the bot go online I guess
bot.login(config.token);