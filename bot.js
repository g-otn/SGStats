/*const autoping = require('./autoping.js');
autoping.autopingfunction();*/
//===========================================================================
const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const botinfo = require('./package.json');
const request = require('request');
const cheerio = require('cheerio');

/* Bot made by Skeke#2155 in Jan 2018 | Special thanks: Hades#0666 */

//Console bot iniciation confirmation
bot.on("ready", () => {
	console.clear();
	bot.channels.get("413088508819800064").send('SmithtainmentStats has started.');
	bot.user.setPresence({ status: 'online', game: { name: config.prefix + 'help' } });
	bot.user.setUsername("SmithtainmentStats");
	console.log(botinfo.name + ' v' + botinfo.version + ' started. \nAuthor: ' + botinfo.author);
	console.log('Prefix: ' + config.prefix);
	console.log('============================\n');
});



//Detect messages
bot.on("message", (msg) => {
	//Ignore the message if it doesn't start with the prefix or it's from a bot
	if (msg.content !== 'SmithtainmentStats has started.') {
		if (!msg.content.startsWith(config.prefix) || msg.author.bot) return;
	}
	if (msg.content == 'SmithtainmentStats has started.' && msg.author.bot) {
		msg.content = '!!check start';
		//msg.content = '!!checkbypass 48';
	}

    if (msg.content)
    //Log in the console about the command
    console.log('=> Command by ' + msg.author.username+'#'+msg.author.discriminator + ' in #' + msg.channel.name + ': ' + msg.content);



    //Separate the prefix from the rest ('!hue br 123' -> 'hue br 123')
    var p_cmd_arg = msg + ''; //Transforms the command into a string
    var cmd_arg = p_cmd_arg.replace(config.prefix, ''); //Replaces the prefix for nothing ('');
    cmd_arg = cmd_arg.toString();
    //Separation between command (w/o prefix) and arguments  
    //Separate arguments (['hue', 'br', '123'] -> ['br', '123'])
    var args = cmd_arg.trim().split(' ').slice(1);
    //Separate command (['hue', 'br', '123'] -> ['hue'])
    var cmd = cmd_arg.trim().split(' ').slice(0,1);
    cmd = cmd.toString();
    console.log('=> Command: ' + cmd);
    console.log('=> Arguments: ' + args);
    //Output of the operations above:
    //cmd = ['hue'];
    //args = ['br, '123']

	//Forums Portal
	const portallink = "http://forums.smithtainment.com/portal.php";

    //Server Addresses
    const anime = "70.42.74.129:27015";
    const modded = "192.223.31.40:27015";
    const prophunt = "192.99.239.40:27015";   
    const starwars = "70.42.74.160:27015";
    const vanilla = "192.223.24.186:27015";

    //A ID gamertracker generates and uses
    const animeid = "5704089";
    const moddedid = "5086005";
    const prophuntid = "5709398";
	const starwarsid = "5493690";
    const vanillaid = "5052174";
    
	//Roles ID of each server
	const M_gl = '<@&387409444109025280>';
	const M_an = '<@&387409402250002434>';
	const M_mc = '<@&387409235249594368>';
	const M_ph = '<@&421155441519755284>';
	const M_sw = '';
	const M_va = '<@&387409354204250122>';



	/*Everytime you click to show the graph, a new number is generated, but the scraper can't click, 
	so this number is never scraped and all the graph commands may be sent with delayed hours/days.
	This is an attempt to make the URL 'request' parameter work by generating a random number with the
	same number of digits that the original has. */
	//To deactivate this system hide the first line (the Math line) and remove the // from the second line (the "")
	var requestnumber = Math.floor(Math.random() * 9999999999999990);
	//var requestnumber = "";
	
	/*idk what this is but if I don't do this gamertracker does not let 
    me connect to the website (HTTP code 403 (forbidden))*/
    var options = { 
    	headers: {'user-agent': 'node.js'}
    };






    //Variables and functions to scrap Gamertracker base64 username
    //variables
    var errorcheck;
    var rawlink, b64user, graphtype;
    var scrapertarget, url, serverinfo, scanned, playersearch;
    //function to separate the graphtype and the player name
    function hourscmd_argsorganize(server, command_args, requesttype) { 
        //Example: !!moddedh week Skeke
        //server = ad_modded; args = ['week', 'Skeke'];
        graphtype = args[0]; // graphtype = week
        args = command_args.slice(1); // args = Skeke 
        args = args.join(' ');  // this is for names with spaces, it will join the array with a space
        playersearch = 'https://www.gametracker.com/server_info/' + server + '/top_players/?query=' + args;
        serverinfo = "https://www.gametracker.com/server_info/" + server;
    }
    //function to scrap the gamertracker base64 username'
    function scrapGT(server_address, requesttype) {
		if (requesttype == 'autoreq') {
			server_address = servertype[0];
			playersearch = 'https://www.gametracker.com/server_info/' + servertype[0] + '/top_players/?query=' + args;
			scrapertarget = "https://www.gametracker.com/player/" + checkdata[1] + "/" + servertype[0] + "/";
			serverinfo = "https://www.gametracker.com/server_info/" + servertype[0];
			graphtype = '1w';
			console.log('server_address: ' + server_address);
			console.log('scrapertarget: ' + scrapertarget);
			console.log('graphtype: ' + graphtype);
		}
		console.log("Search URL: " + playersearch);
		request(playersearch, options, function(error, response, html) {
			if (requesttype !== 'autoreq') {
				var $ = cheerio.load(html);
				var noplayercheck = $('.table_lst').children().children().first().children().text().trim();
				if (noplayercheck !== 'No results found.') {
					noplayercheck = false;
					console.log('noplayercheck: ' + noplayercheck);
					var player = $('.table_lst').children().children().eq(1).children().children('a').text().trim();
					var hours = $('.table_lst').children().children().eq(1).children().eq(4).text().split('.').slice(0,1).join().trim();
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
						//separate the scraped raw link and get the base64 username
						rawlink = rawlink.trim().split('nameb64=').slice(1,2).join('');
						b64user = rawlink.trim().split('&host=').slice(0,1);
						console.log('Base64 Username: ' + b64user);
						var finalimage = 'https://cache.gametracker.com/images/graphs/player_time.php?nameb64=' + b64user + '&host=' + server_address + '&start=-' + graphtype + "&request=0" + requestnumber;
						if (requesttype == 'autoreq') {
							checkdata[6] = finalimage;
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
							checkdata[6] = 'notfound';
							console.log('---End of serverh function (not found)');
						}
					}
	        	});
	        });
		});
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
	}






	function steaminfo(input, requesttype)  {
		console.log('Request type: ' + requesttype);
		input = input + "";
		console.log('input: ' + input);
		if ((input !== "" && requesttype !== 'autoreq') || requesttype == 'autoreq') {
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
	                console.log('Steam ID: ' + steamid);
	                if (steamid !== 'Steam') {
	                    //gathers the name
	                    name = $('title').text();
	                    name = name.split('(').slice(1,2).join();
	                    name = name.split(')').slice(0,1).join();
	                    //if (name.indexOf(' ') > -1) { name = name.split(' ').join('%20');}
	                    console.log('Name: ' + name);
	                    //Gathers the steam profile link
	                    profilelink = $('code').children('a').text().trim().split('http://steamcommunity.com/profiles/').slice(1,2).join();
	                    profilelink = 'http://steamcommunity.com/profiles/' + profilelink;
	                    console.log('Profile link: ' + profilelink);
	                    //Gathers the steam profile state (public or private) //%20
	                    profilestate = $('code').children('a').last().parent().next().next().text();
	                    console.log('Profile state: ' + profilestate);
	                    //Gathers the steamid64 (who knows if you might need it)
	                    steamid64 = $('code').children('a').first().parent().prev().prev().text();
	                    console.log('SteamID64: ' + steamid64);
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
	                    	profileicon = $('.playerAvatarAutoSizeInner').children().attr('src').trim() + "";
	                    	//console.log(profileicon);
	                        //double-check if the profile is private (sometimes steamidfinder gets it wrong)
	                        privatecheck = $('body').hasClass('private_profile');
	                        console.log('privatecheck: ' + privatecheck);
	                        if (profilestate !== 'not set') {
	                        	if (privatecheck === true) { profilestate = 'private';}
	                        }
	                        //Gathers Garry's Mod hours
	                        if (profilestate == 'public' && profilestate !== 'private' && profilestate !== 'not set') { //This doesn't work if the profile is private nor if Garry's mod isn't in the profile main page
	                            var recentgamesl = $('div.game_name').children('a').length; //Check for how many recent games there are in the page
	                        var i;
	                        for (i = 0; i <= recentgamesl; i++) {
	                        	gmodh = $('div.game_name').children('a').eq(i).text(); 
	                                if (gmodh == "Garry's Mod") { break;} //Check which scraped game of the recent games is Garry's mod
	                            }
	                            //console.log('i: ' + i);
	                            gmodh = $('div.game_name').children('a').eq(i).parent().prev().text();
	                            gmodh = gmodh.trim().split(' ').slice(0,1).join();
	                            console.log("Gmod hours: " + gmodh);
	                        } else {
	                        	gmodh = 'unknown';
	                        	customID = name;
	                        	console.log("Gmod hours private");
							}
							if (gmodh == "") {
								gmodh = 'not found';
								console.log('gmod tab not found in main profile page.');
							}
	                        //Again I need to put this inside otherwise it tries to send the message before the request above finishes
							switch (requesttype) {
								case 'main':
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
									break;
								case 'autoreq':
									checkdata.push(name, profilelink, profileicon, gmodh, profilestate);
									//console.log('\n'+checkdata+'\n');
									console.log('---End of steaminfo function');
									break;
							}
	                    });
	                } else {
						if (requesttype == "main") {
							msg.channel.send({embed: { 
								"description": "The website could not find the user.", 
								"color": 0x0000ff,	
								"thumbnail": { 
									"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
								}
							}});
							console.log('!! User not found !!');
							console.log('----------\n');
						} else { 
							console.log('steaminfo command could not find the user');
							checkdata[0] = 'notfound';
						}

	                }
	            } else {
					if (requesttype == "main") {
						msg.channel.send({embed: { 
							"description": "Could not access the website. HTTP Code: " + response.statusCode, 
							"color": 0x0000ff,	
							"thumbnail": { 
								"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
							}
						}});
						console.log('Website access error. HTTP Code: ' + response.statusCode + '\n');
						console.log('!! Steam info not sent because of website error !!');
						console.log('----------\n');
					} else { 
						console.log('steaminfo command could not access the website');
						checkdata[0] = 'notfound';
					}
	            }
	        });
		} else {
			msg.channel.send({embed: {
				"description": "You have to insert a input! Type ``!!help steaminfo`` for more information.",
				"color": 0x0000ff,
				"thumbnail": {
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
				}
				}});
				console.log('!! Info not sent because of no input !!\n----------\n');
		}

	}






	//Function to check online players and population troughtout the day
	function onlineplayers(server) {
		var errorcheck2, gtserverlink, tablecount, noplayercheck, scrapedplayer, scrapedtime, playerlist, timelist, /*finaltable,*/serverid, servername;
		errorcheck2 = false;
		switch (server) {
			case 'an':
			case 'anime':
				server = anime;
				serverid = animeid;
				servername = 'Anime TTT';
				break;
			case 'mc':
			case 'modded':
				server = modded;
				serverid = moddedid;
				servername = 'MC TTT';
				break;
			case 'ph':
			case 'prophunt':
				server = prophunt;
				serverid = prophuntid;
				servername = 'PropHunt';
				break;
			case 'sw':
			case 'starw':
			case 'starwars':
				server = starwars;
				serverid = starwarsid;
				servername = 'Star Wars TTT';    
				break;
			case 'va':
			case 'vanilla':
				server = vanilla;
				serverid = vanillaid;
				servername = 'Vanilla TTT';
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
							scrapedplayer = $('div.blocknewhdr').eq(i).next().next().children().children().eq(finder2).children().children('a').text().trim() + '';
							console.log(scrapedplayer);
							scrapedtime = $('div.blocknewhdr').eq(i).next().next().children().children().eq(finder2).children().eq(3).text().trim();
							if (scrapedplayer !== '') { 
								playerlist[finder3] = scrapedplayer;
								timelist[finder3] = scrapedtime;
								timelist[finder3] = timelist[finder3].split(':');
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
							"description": 'Showing ['+ servername +'](' + gtserverlink + ') online players and population throughout the day:',
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
					msg.channel.send({embed: { 
						"description": "Couldn't access the website. HTTP code " + response.statusCode, 
						"color": 0x0000ff,	
						"thumbnail": { 
							"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
						}
					}});
					console.log('Website access error. HTTP Code: ' + response.statusCode + '\n');
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
						"description": "'" + server + "' is not a known server. please use 'anime', 'modded', 'prophunt', 'starwars' or 'vanilla'.", 
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






	//Function to send population graph
	function populationgraph(server, graphtype) {
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
			case 'modded':
				server = modded;
				serverid = moddedid;
				servername = "MC TTT";
				break;
			case 'ph':
			case 'prophunt':
				server = prophunt;
				serverid = prophuntid;
				servername = 'PropHunt';
				break;
			case 'sw':
			case 'starw':
			case 'starwars':
				server = starwars;
				serverid = starwarsid;
				servername = "Star Wars TTT";
				break;
			case 'va':
			case 'vanilla':
				server = vanilla;
				serverid = vanillaid;
				servername = "Vanilla TTT";
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
				case "":
				case " ":
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
						console.log('Website access successful. HTTP Code ' + response.statusCode);
						var $ = cheerio.load(html);
						var scanned = $('#last_scanned').text().trim();
					} else {
						console.log('Website access error. HTTP Code ' + response.statusCode + '\n');
						console.log('!! Graph not sent because of website error !!');
						console.log('----------\n');
					}
					var populationgraph = 'https://cache.gametracker.com/images/graphs/server_players.php?GSID=' + serverid + '&start=-' + graphtype + '&request=0' + requestnumber;
					console.log('graph link: ' + populationgraph + '\nlink not stable because of request parameter. Graph may be send 12h delayed.');
					msg.channel.send({embed: {
						"description": 'Showing [' + servername + '](' + serverlink + ') population:',
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
						"description": "'" + server + "' is not a known server. Please use 'anime', 'modded', 'prophunt', 'starwars' or 'vanilla'.", 
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






	//Function to get player's gametracker hours in a server table_lst
	function playerhours(args, requesttype, checkserver, checkplayer) {
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
				case 'mc':
				case 'modded':
					server = modded;
					servername = 'MC TTT';
					break;
				case 'ph':
				case 'prophunt':
					server = prophunt;
					servername = 'PropHunt';
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
			if ((player == undefined || player == "" || player == " ") && errorcheck !== true) { errorcheck2 = true;}
		} else { //Check function
			server = checkserver;
			player = checkplayer;
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
								checkdata[9] = searchlink;
								checkdata[8] = player;
								checkdata[7] = hours; //Check function wanted data
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
							} else { checkdata[7] = 'not found\nPlayer not found in GT!';}
							console.log('Player not found!');
							console.log('----------\n');
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






	//help command
	function help(command) {
		console.log('Command to help: ' + command);
		var desc, syntax, ex, notes, notes_srv, notes_per, thumb;
		var thumbSt = "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2FkSt.png?1518565783409";
		var thumbGT = "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2FkGT.png?1518565784303";
		var defaultcheck = false;
		var commandlist = [
			, //idk why but without this it sends without the first value
			"server",
			"serverh",
			"steaminfo",
			"online",
			"population",
			"playerhours",
			"hue"
			];
		commandlist = commandlist.join('\n');
		notes_srv = "Servers: 'anime', 'prophunt', 'modded', 'starwars' or 'vanilla'";
		notes_per = "Period: 'day', 'week' or 'month'";
		notes = " ";
		switch (command) {
			case 'server':
				desc = "Shows info about a specific server";
				syntax = "<server>";
				notes = notes_srv;
				ex = config.prefix + "modded; " + config.prefix + "vanilla";
				thumb = thumbGT;
				break;
			case 'serverh':
				desc = "Shows a graph of a player playtime of a Smithtainment server in a specific period of time.";
				syntax = "<server>h <period> <playername>";
				notes = notes_srv;
				ex = "moddedh week Skeke";
				thumb = thumbGT;
				break;
			case 'steaminfo':
				desc = "Shows info from steam of a player";
				syntax = "steaminfo <input>";
				notes = "Input: SteamID, SteamID64, SteamID3 or customURL";
				ex = "steaminfo STEAM_1:0:70936906";
				thumb = thumbSt;
				break;
			case 'online':
				desc = "Shows online players from a Smithtainment server along with a population graph of that server in the last 24h.";
				syntax = "online <server>";
				notes = notes_srv;
				ex = "online modded";
				thumb = thumbGT;
				break;
			case 'population':
				desc = "Shows a graph of population of a Smithtainment server during a specific time period.";
				syntax = "population <server> <period>";
				notes = notes_srv + '\n' + notes_per;
				ex = "population vanilla month";
				thumb = thumbGT;
				break;
			case 'playerhours':
				desc = "Shows a player total hours in a specific Smithtainment server.";
				syntax = "playerhours <server> <player>";
				notes = notes_srv;
				ex = "playerhours Skeke";
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
					"description": '**Showing SmitainmentStats commands** \nType ``' + config.prefix + 'help <command>`` for specific info.\n```' + commandlist + "```\n[Changelog](https://discordbot-smithtainmentstats-changelog.glitch.me/)",
					"color": 0x0000ff,
					"footer": {
						"text": "SmithtainmentStats v" + botinfo.version + " by Skeke#2155, special thanks Hades#0666"
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
					"text": "SmithtainmentStats v" + botinfo.version + " by Skeke#2155, special thanks Hades#0666"
				},
				"thumbnail": {
					"url": thumb
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






	//function from Hades old bot that shows server info
	function server_fun(server, name2) {
		var serverlink = "https://www.gametracker.com/server_info/" + server;
		var name, status, players, map, mapimg, scanned;
		request(serverlink, options, function(error, response, html) {
			if (!error && response.statusCode == 200) {
				console.log('Website access successful. HTTP Code ' + response.statusCode);
				var $ = cheerio.load(html);
				scanned = $('#last_scanned').text().trim();
				console.log('Scanned: ' + scanned);
				name = $('.item_color_title').eq(0).next().children().text().trim();
				console.log('Name: ' + name);
				status = $('.item_color_success').text().trim();
				console.log('Status: ' + status);
				players = $('#HTML_num_players').text().trim() + "/" + $('#HTML_max_players').text().trim();
				console.log('Players: ' + players);
				map = $('#HTML_curr_map').text().trim();
				console.log('Map: ' + map);
				mapimg = "https:" + $('#HTML_map_ss_img').children().attr('src').trim();
				console.log('Map img: ' + mapimg);
				msg.channel.send({embed: {
					"title": name2 + ' info',
					"description": "Name: ``" + name + "``\nStatus: ``" + status + "``\nPlayers: ``" + players + "``\nMap: ``" + map + "``",
					"url": serverlink,
					"color": 0xFFBF52,
					"footer": {
					  "text": scanned + " via GT"
					},
					"thumbnail": {
					  "url": mapimg
					}
				}});
			} else { //If it can't access
			msg.channel.send({embed: {
				"description": "Couldn't access website. HTTP Code "  + response.statusCode,
				"color": 0x0000ff,
				"thumbnail": {
				  "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
				}
			}});
			console.log('Website access error. HTTP Code ' + response.statusCode);
			console.log('!! Image not sent because of website error !!');
			console.log('----------\n');
			}
		});
	}




	var checkbypass = false;
	function bypasscheck(fid) {
		console.log('Starting check command with time bypass...\n')
		checkbypass = true;
		check(fid);
	}
	var interval;
	function autocheckstop() { //Stop checker
		clearInterval(interval);
		breaker = false;
		console.log('Auto checker stopped. breaker: ' + breaker);
	} 
	function autocheckstart() { //Runs checker
		interval = setInterval(function() { check('auto');}, 600000); //60000 = 1min; 600000 = 10min;
		breaker = true;
		console.log('Auto checker started. breaker: ' + breaker);
	} 
	//Makes possible for the automatic async function test() to wait itself to finish to loop itself
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	function sleep2(ms) {
		return new Promise(resolve2 => setTimeout(resolve2, ms));
	}
	//Auto check for new applications and appeals
	//Variables and functions that scrap and send thread info
	var postname, postauthor, postlink, postdate, seclink;
	var selector, forbreaker;
	var servertype = [];
	var checkdata = [1];
	const sectionlist = [
		241,213, //Global
		257,258,259,260,261,281, //Suggestions
		262,263,264,265,266,282, //Bug Reports
		130,132,133,134, //Anime
		51,53,48,59,66, //Modded
		270,271,272,283, //PropHunt
		87,93 //Vanilla
		//34,36,40,41 //Star Wars TTT
	];
	const sectiontype = [
		'Appeal','Application', //Global
		'Suggestion','Suggestion','Suggestion','Suggestion','Suggestion','Suggestion', //Suggestions
		'Bug Report','Bug Report','Bug Report','Bug Report','Bug Report','Bug Report', //Bug Reports
		'Application','Report','Ban Appeal','Warn Appeal', //Anime
		'Report','Donor Support Thread','Application','Ban Appeal','Warn Appeal', //Modded
		'Application','Ban Appeal','Warn Appeal','Report', //PropHunt
		'Application','Ban Appeal' //Vanilla
		//'Report','Application','Ban Appeal','Warn Appeal' //Star Wars TTT
	];
	const sectionfrom = [
		'Forums/Network Appeals','Forum Moderator Applications',
		'MC TTT', 'Vanilla TTT', 'Anime TTT', 'Star Wars TTT', 'Forums','PropHunt',
		'MC TTT', 'Vanilla TTT', 'Anime TTT', 'Star Wars TTT', 'Forums','PropHunt',
		'Anime TTT','Anime TTT','Anime TTT','Anime TTT',
		'MC TTT','MC TTT','MC TTT','MC TTT','MC TTT',
		'PropHunt','PropHunt','PropHunt','PropHunt',
		'Vanila TTT','Vanila TTT'
		//'Star Wars TTT','Star Wars TTT','Star Wars TTT','Star Wars TTT'
	];
	const sectionmention = [
		M_gl,M_gl,
		M_mc,M_va,M_an,M_sw,M_gl,M_ph,
		M_mc,M_va,M_an,M_sw,M_gl,M_ph,
		M_an,M_an,M_an,M_an,
		M_mc,M_mc,M_mc,M_mc,M_mc,
		M_ph,M_ph,M_ph,M_ph,
		M_va,M_va
		//M_sw,M_sw,M_sw,M_sw
	];
	/*
	Info to send
	Basic info: All Threads
	Steam info: All Threads
	GT info: All Threads
	GT graph: Only Applications
	*/
	async function check(fid) {
		checkdata = [];
		//Checks for manual test (with fid)
		var i;
		var fidcheck = false;
		for (i = 0; i < sectionlist.length; i++) { 
			if (fid == sectionlist[i]) {
				fidcheck = true;
				console.log('fidcheck: ' + fidcheck);
			}
		}
		//loop for each forums section
		for (selector = 0; selector < sectionlist.length; selector++) {
			if (fid == 'portal') { break;}
			console.log("--Starting forums search #" + selector);
			//condition below is function to select a specific section and set vars for testing
			if (fidcheck === true) { //Checks if fid is a number
				forbreaker = true;
				console.log('forbreaker: ' + forbreaker);
				seclink = "http://forums.smithtainment.com/forumdisplay.php?fid=" + fid;
				for (i = 0; i < sectionlist.length; i++) { 
					if (fid == sectionlist[i]) {
						selector = i;
					}
				}
			} else {
				seclink = "http://forums.smithtainment.com/forumdisplay.php?fid=" + sectionlist[selector];
			}
			console.log('fid: ' + fid);
			console.log('selector: ' + selector);
			console.log('sectionlist: ' + sectionlist[selector]);
			console.log('sectiontype: ' + sectiontype[selector]);
			console.log('sectionfrom: ' + sectionfrom[selector]);
			console.log('Forum link: ' + seclink);
			var poststeamid;
			request(seclink, options, function(error, response, html) {
				var $ = cheerio.load(html); 
				//Selects the post from the forum. eq(2) for first thread, eq(8) for second (lines below)
				postname = $('.forumdisplay_regular').eq(2).children().children('span').children('span').eq(0).children('a').text();
				postlink = $('.forumdisplay_regular').eq(2).children().children('span').children('span').eq(0).attr('id');
				postauthor = $('.forumdisplay_regular').eq(2).children().children('div').children().text();
				console.log("Thread name: " + postname);
				console.log("Thread link: " + postlink);
				console.log("Thread author: " + postauthor);
				//If there is a post
				if (postname !==  undefined && postlink !== undefined && postauthor !== undefined) {
					postname = postname.trim();
					postlink = postlink.trim().split('tid_').join("").trim();
					postauthor = postauthor.trim();
					console.log('Repeated Threads: ' + repeatedthreads.join(', '));
				} else {
					console.log('No thread found.');
					console.log('--End of loop #' + selector + '\n');
				}
			});
			//Waits the scraper and function to end to start again to prevent rewrite of variables in the wrong time
			await sleep(3500); //Waits for the first scrap to search for post
			if (postname !==  undefined && postlink !== undefined && postauthor !== undefined) {
				//Checks if thread has already been seen or if there is a thread
				if (repeatedthreads.join(' ').includes(postlink) === false) { //".indexOf(postlink) == -1" instead of ".includes(postlink) == false" also works
					console.log('New thread, adding to repeatedthreads');
					repeatedthreads.push(postlink); //Marks thread as already seen
					console.log('Repeated threads from now: ' + repeatedthreads);
					checkdata[0] = 'notappl'; //replaces undefined
					servertype[1] = 'Server'; //replaces undefined
					switch (sectionlist[selector]) {
						//Anime
						case 130:
							checkdata[0] = 'appl';
						case 132:
						case 133:
						case 134:
							servertype = [anime,'Anime TTT'];
							break;
						//Modded
						case 48: 
							checkdata[0] = 'appl';
						case 51:
						case 53:
						case 59:
						case 66:
							servertype = [modded,'MC TTT'];
							break;
						//PropHunt
						case 270:
							checkdata[0] = 'appl';
						case 271:
						case 272:
						case 283:
							servertype = [prophunt,'PropHunt'];
							break;
						//Vanilla
						case 87: 
							checkdata[0] = 'appl';
						case 93:
							servertype = [vanilla,'Vanilla TTT'];
							break;
						//Star Wars TTT
						case 36: 
							servertype = [starwars,'Star Wars TTT'];
							checkdata[0] = 'appl';
							break;
						//Threads that don't need Steam/GT info
						case 213: //Forums Moderator Applications
						case 257: //Suggestions
						case 258:
						case 259:
						case 260:
						case 261:
						case 281:
						case 262: //Bug Reports
						case 263:
						case 264:
						case 265:
						case 266:
						case 282:
							checkdata[0] = 'notneeded';
					}
					console.log('servertype: '+servertype);
					//checkdata[0] tells if it's an application or if info is found to send
					console.log('checkdata[0]: ' + checkdata[0]);
					postlink = "http://forums.smithtainment.com/showthread.php?tid=" + postlink;
					console.log("Thread link: " + postlink);
					//Goes to the post
					request(postlink, options, function(error, response, html) {
						var $ = cheerio.load(html);
						//Scraps date and SteamID if the author wrote it
						postdate = $('.post_date').first().text().trim();
						console.log('Post date: ' + postdate);
						async function reqwait() {
							console.log('waiting for scrap of post date...');
							await sleep2(3000); //Waits for the request to finish
							//Checks if thread is recent (<1h) to avoid spamming when bot starts
							if (postdate.includes('minute') === true || checkbypass == true) { //Change condition to "... == true" to work proprely
								if (checkdata[0] == 'notneeded') { 
									checksender();
									return;
								}
								console.log('New recent thread found.');
								//Tries to get SteamID from post text
								console.log('Trying to scrap SteamID...');
								poststeamid = $('.post_body').first().text().trim(); //Gets the all the text from the thread
								poststeamid = poststeamid.split('STEAM_').slice(1,2).join(''); //Gets the SteamID and everything after
								poststeamid = poststeamid.split('').slice(0,14).join('').trim(); //Removes everything after the first 14 characters (because SteamIDs without the starting 'STEAM_' are(?) 13 characters long)
								poststeamid = poststeamid.split(' ').slice(0,1).join(''); //Removes anything after the space after the SteamID
								poststeamid = poststeamid.split('\n').slice(0,1).join(''); //Removes anything after a line break after the SteamID
								poststeamid = poststeamid.split('.').slice(0,1).join('').trim(); //Removes anything after a dot after the SteamID
								poststeamid = 'STEAM_' + poststeamid; //Adds the removed 'STEAM_'
								//If SteamID is not found
								if (poststeamid === undefined || poststeamid === 'STEAM_') {
									//Tries to get SteamID64 from post text
									console.log('Failed to scrap SteamID, trying SteamID64...');
									poststeamid = $('.post_body').first().text().trim();
									poststeamid = poststeamid.split('765611').slice(1,2).join(''); //Gets the SteamID64 and everything after
									poststeamid = poststeamid.split('').slice(0,12).join('').trim(); //Removes everything after the first 12 characters (because SteamID64s without the starting '765611' are(?) 11 characters long)
									poststeamid = poststeamid.split(' ').slice(0,1).join(''); //Removes anything after the space after the SteamID64
									poststeamid = poststeamid.split('\n').slice(0,1).join(''); //Removes anything after a line break after the SteamID64
									poststeamid = poststeamid.split('.').slice(0,1).join('').trim(); //Removes anything after a dot after the SteamID
									poststeamid = '765611' + poststeamid;
								}
								console.log('SteamID/64 written in post: ' + poststeamid);
								//Checks if the author wrote a SteamID or not (even if it's broken)
								if (poststeamid !== undefined && poststeamid !== '765611' && poststeamid !== 'STEAM_' && poststeamid !== "" && poststeamid !== " " && sectionlist[selector] !== 241) {
									console.log('SteamID/64 written in post found');
									console.log('final input to send to the function: ' + poststeamid + '\n---Starting steaminfo function...');
									steaminfo(poststeamid, 'autoreq', postlink);
								} else {
									console.log('SteamID/64 in thread not found, skipping steaminfo function');
									checkdata[0] = 'notfound';
									checksender();
								}
							} else {
								console.log('New thread found, but not recent.');
								console.log('--End of loop #' + selector + '\n');
							}
						}
						reqwait(); //Calls next function (that continues)
					});
				} else {
					console.log('Thread found, but not new.');
					console.log('--End of loop #' + selector + '\n');
				}

				await sleep(4000);

				//If a new post is found
				if (postlink !== undefined && (postdate.includes('minute') === true || checkbypass == true)) { //change second condition to '... == true'
					await sleep(3250);
					if (poststeamid !== undefined && poststeamid !== '765611' && poststeamid !== 'STEAM_' && poststeamid !== "" && poststeamid !== " " && sectionlist[selector] !== 241) {
						await sleep(5250);
						if (checkdata[0] == 'appl') {
							console.log('---Starting serverh function');
							scrapGT(null,'autoreq');
							await sleep(5500);
							console.log('---Starting playerhours function');
							playerhours(null, 'autoreq', servertype[0], checkdata[1]);
							await sleep(5500);
							checksender();
						} else {
							console.log('---Starting playerhours function');
							playerhours(null, 'autoreq', servertype[0], checkdata[1]);
							await sleep(5750);
							checksender();
							await sleep(500);
						}
					}
				} else { await sleep(500);}
			}
			if (forbreaker === true) { break;}
		}
		await sleep(500);
		checkdata = [];
		if (forbreaker === false || fid === undefined) {
			console.log('End of automatic forums checking');
			console.log('----------\n');	
		}

		//Forums Portal Check
		if (fid == 'auto' || fid == 'start' || fid == 'portal') {
			console.log('Starting forums portal check...');
			checkdata[0] = 'portal';
			//Checkdata: [0type, 1date, 2title, 3image, 4text, 5tables (html <ul>)]
			request(portallink, options, function(error, response, html) {
				var $ = cheerio.load(html);
				checkdata[1] = $('.portaldate').first().text().trim(); //Post date
				checkdata[2] = $('.portalhead').first().text().trim(); //Title
				console.log('Post date: ' + checkdata[1] + '\nTitle: ' + checkdata[2]);
				if ((checkdata[1].includes('minute') === true && repeatedtitles.join(' ').includes(checkdata[2]) === false) || checkbypass == true) {
					checkdata[3] = $('.mycode_img').attr('src'); //Image
					console.log('Checkdata:\n' + checkdata.join('\n '));		
				} else {
					console.log('No news found.');
				}
			});
			await sleep(3500);
			if ((checkdata[1].includes('minute') == true && repeatedtitles.join(' ').includes(checkdata[2]) == false) || checkbypass == true) { 
				repeatedtitles.push(checkdata[2]);
				console.log('Repeated titles: ' + repeatedtitles);
				checksender();
			}
			await sleep(500);
		}

		if (fid == 'start') {
			console.log('----------');
			console.log('First automatic bot command, starting autocheck');
			autocheckstart();
			console.log('----------\n');
		}
		checkbypass = false;
	}
	//Collects the data from the checking and steaminfo function and send it
	function checksender() {
		console.log('checkdata[0]: ' + checkdata[0]);
		var i;
		for (i=1;i<10;i++) { //Transforms undefined into 'not found' to stop some erros
			if (checkdata[i] === undefined) { checkdata[i] = 'not found';}
		}
		//if (isNaN(checkdata[]) == false) { checkdata[]].split(" ").join("%20");}
		if (checkdata[0] !== 'portal') {
			console.log("Data recevied: \n1 name: " + checkdata[1] + '\n2 profile link: ' + checkdata[2] + '\n3 profile image: ' + checkdata[3].substring(0, 35) + '...\n4 gmod hours: '+ checkdata[4] +'\n5 profile state: ' + checkdata[5] + '\n6 graph: ' + checkdata[6] + '\n7 gt hours: ' + checkdata[7] + '\n8 gt name: ' + checkdata[8] + '\n9 gt link: ' + checkdata[9] + '\n servertype: ' + servertype);
		}
		//Checkdata -> [name, profilelink, profileicon, gmodh, profilestate, steamid, graph, gthours]
		//spam_spam_spam -> "409458470610403338"
		//announcements staff -> "409456414654726156"
		//announcements public -> "348548140087115776"
		//test -> "403969093595693066"
		//test private -> "413088508819800064"
		const target = "403969093595693066";
		const target2 = ["413088508819800064","413088508819800064"];
		
		switch (checkdata[0]) {
			case "notfound": //ANY TYPE
			case "notneeded": //FORUMS APP, SUGGESTIONS AND BUG REPORTS
				console.log('Steam info failed (' + checkdata[0] + '). Sending without...\n');
				//NO STEAM INFO / NO GT INFO / NO GT GRAPH
				bot.channels.get(target).send({embed: {
					"title": "New " + sectiontype[selector] + "!",
					"description": "__" + postauthor + "__ posted " + postdate + " a(n) [" + sectiontype[selector] + "](" + postlink + ") in the [" + sectionfrom[selector] + "](" + seclink + ")! " + sectionmention[selector],
					"color": 0x0000ff,
					"footer": {
						"text": "Info from player not found or not needed."
					}
				}});
				break;
			case "notappl": //NOT APPLICATION
				console.log('Steam info recieved (' + checkdata[0] + '). Sending message...\n');
				if (checkdata[4] === undefined || checkdata[4] == "" || checkdata[4] == 'notfound') { checkdata[4] == 'unknown';}
				if (checkdata[6] == 'notfound' || checkdata[6] == 'not found') {
					//STEAM INFO / GT INFO / NO GT GRAPH
					bot.channels.get(target).send({embed: {
						"title": "New " + sectiontype[selector] + "!",
						"description": "__" + postauthor + "__ posted *" + postdate + "* a [" + sectiontype[selector] + "](" + postlink + ") for the [" + sectionfrom[selector] + "](" + seclink + ")! " + sectionmention[selector],
						"color": 0x0000ff,
						"footer": {
							"text": "Info may be wrong depending of SteamID written and multiple/similar names." 
						},
						"thumbnail": {
							"url": checkdata[3]
						},
						"fields": [
							{
								"name": "Steam info",
								"value": "Steam name: " + checkdata[1] + "\nProfile state: [" + checkdata[5] + "](" + checkdata[2] + ") \nGarry's Mod hours: " + checkdata[4],
								"inline": true
							},
							{
								"name": "Gamertracker info",
								"value": 'Name: [' + checkdata[8] + '](https://www.gametracker.com/player/' + checkdata[1].split(" ").join("%20") + '/' + servertype[0] + '/)\n' + servertype[1] + " hours: " + checkdata[7],
								"inline": true
							}
						]
					}});
				}
				break;
			case "appl": //APPLICATION
				console.log('Steam info recieved (' + checkdata[0] + '). Sending message...\n');
				if (checkdata[4] === undefined || checkdata[4] == "" || checkdata[4] == 'notfound') { checkdata[4] == 'unknown';}
				if (checkdata[6] !== undefined && checkdata[6] !== "notfound" && checkdata[6] !== "not found") {
					//STEAM INFO / GT INFO / GT GRAPH
					bot.channels.get(target).send({embed: {
						"title": "New " + sectiontype[selector] + "!",
						"description": "__" + postauthor + "__ posted *" + postdate + "* an [" + sectiontype[selector] + "](" + postlink + ") for the [" + sectionfrom[selector] + "](" + seclink + ")! " + sectionmention[selector],
						"color": 0x0000ff,
						"footer": {
							"text": "Info may be wrong depending of SteamID written and multiple/similar names." 
						},
						"thumbnail": {
							"url": checkdata[3]
						},
						"image": {
							"url": checkdata[6]
						},
						"fields": [
							{
								"name": "Steam info",
								"value": "Steam name: " + checkdata[1] + "\nProfile state: [" + checkdata[5] + "](" + checkdata[2] + ") \nGarry's Mod hours: " + checkdata[4],
								"inline": true
							},
							{
								"name": "Gamertracker info",
								"value": 'Name: [' + checkdata[8] + '](https://www.gametracker.com/player/' + checkdata[1].split(" ").join("%20") + '/' + servertype[0] + '/)\n' + servertype[1] + " hours: " + checkdata[7],
								"inline": true
							},
							{
								"name": servertype[1] + " Activity",
								"value": 'Showing last 7 days activity of ' + checkdata[8] + '. Similar names [here](' + checkdata[9].split(" ").join("%20") + ')',
							}
						]
					}});
				} else {
					bot.channels.get(target).send({embed: {
						//STEAM INFO / GT INFO / NO GT GRAPH
						"title": "New " + sectiontype[selector] + "!",
						"description": "__" + postauthor + "__ posted *" + postdate + "* an [" + sectiontype[selector] + "](" + postlink + ") for the [" + sectionfrom[selector] + "](" + seclink + ")! " + sectionmention[selector],
						"color": 0x0000ff,
						"footer": {
							"text": "Info may be wrong depending of SteamID written and multiple/similar names." 
						},
						"thumbnail": {
							"url": checkdata[3]
						},
						"fields": [
							{
								"name": "Steam info",
								"value": "Steam name: " + checkdata[1] + "\nProfile state: [" + checkdata[5] + "](" + checkdata[2] + ") \nGarry's Mod hours: " + checkdata[4],
								"inline": true
							},
							{
								"name": "Gamertracker info",
								"value": 'Name: [' + checkdata[8] + '](https://www.gametracker.com/player/' + checkdata[1].split(" ").join("%20") + '/' + servertype[0] + '/)\n' + servertype[1] + " hours: " + checkdata[7],
								"inline": true
							},
							{
								"name": servertype[1] + " Activity",
								"value": 'Activity not found because either the player does not play on the server or it has special characters in its name.',
							}
						]
					}});
				}
				break;
			case "portal": //PORTAL NEWS
				console.log('Data recieved:\n1 postdate: ' + checkdata[1] + '\n2 title: ' + checkdata[2] + '\n3 image: ' + checkdata[3]);
				console.log('Sending news...');
				if (checkdata[3] !== undefined && checkdata[3] !== "not found") {
					//THUMBNAIL
					for (var i = 0; i < 2; i++) {
						bot.channels.get(target2[i]).send("@everyone");
						bot.channels.get(target2[i]).send({embed: {
							"title": checkdata[2],
							"url": portallink,
							"color": 0x0000ff,
							"footer": {
								"text": checkdata[1].split(':').join(' ')
							},
							"thumbnail": {
								"url": checkdata[3]
							}
						}});
					}
				} else {
					//NO THUMBNAIL
					for (var i = 0; i < 2; i++) {
						bot.channels.get(target2[i]).send("@everyone");
						bot.channels.get(target2[i]).send({embed: {
							"title": checkdata[2],
							"url": portallink,
							"color": 0x0000ff,
							"footer": {
								"text": checkdata[1].split(':').join(' ')
							}
						}});
					}
				}
				break;
		}
		checkdata = [];
		if (forbreaker === true) {
			checkbypass = false;
			console.log('----------\n');
		}
	}













	//Commands
	switch (cmd) {
		case 'serverh':
			msg.channel.send({embed: { 
				"description": "You have to select a server! Use ``" + config.prefix + "help serverh`` for more information.", 
				"color": 0x0000ff,	
				"thumbnail": { 
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk9.png?1518563848991"
				}
			}});
			break;
		case 'anh':
		case 'animeh':
			hourscmd_argsorganize(anime, args);
			graphtypeselector();
			if (errorcheck !== true) { scrapGT(anime);}
			break;
		case 'mch':
		case 'moddedh':
			hourscmd_argsorganize(modded, args);
			graphtypeselector();
			if (errorcheck !== true) { scrapGT(modded);} 
			break;
		case 'proph':
		case 'prophunth':
			hourscmd_argsorganize(prophunt, args);
			graphtypeselector();
			if (errorcheck !== true) { scrapGT(prophunt);} 
			break;
		case 'swh':
		case 'starwh':
		case 'starwarsh':
			hourscmd_argsorganize(starwars, args);
			graphtypeselector();
			if (errorcheck !== true) { scrapGT(starwars);}
			break;
		case 'vah':
		case 'vanillah':
			hourscmd_argsorganize(vanilla, args);
			graphtypeselector();
			if (errorcheck !== true) { scrapGT(vanilla);} 
			break;
		case 'steaminfo':
			args = args.join(' ');
			steaminfo(args, "main");
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
		case 'server':
			msg.channel.send({embed: { 
				"description": "You have to select a server! Use ``" + config.prefix + "help server`` for more information.", 
				"color": 0x0000ff,	
				"thumbnail": { 
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk9.png?1518563848991"
				}
			}});
			break;
		case 'an':
		case 'anime':
			server_fun(anime, 'Anime TTT');
			break;
		case 'mc':
		case 'modded':
			server_fun(modded, 'MC TTT');
			break;
		case 'ph':
		case 'prophunt':
			server_fun(prophunt, 'PropHunt');
			break;
		case 'sw':
		case 'starw':
		case 'starwars':
			server_fun(starwars, 'Star Wars TTT');
			break;
		case 'va':
		case 'vanilla':
			server_fun(vanilla, 'Vanilla TTT');
	    	break;
		case 'help':
			args = args.join(' ').trim();
			help(args);
			break;
		case 'hue':
			msg.channel.send('br');
			console.log('----------\n');
			break;
		case 'check':
			check(args);
			break;
		case 'checkbypass':
			bypasscheck(args);
			break;
		case 'startauto':
			console.log('breaker: ' + breaker);
			if (breaker === false) {	
				autocheckstart();
				msg.channel.send({embed: { 
					"description": "Forums auto checker is now running.", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk8.png?1518561204876"
					}
				}});
			} else {
				msg.channel.send({embed: { 
					"description": "Forums auto checker is already running!", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk4.png?1518561202898"
					}
				}});
			}
			break;
		case 'stopauto':
			console.log('breaker: ' + breaker);
			if (breaker === true) {
				autocheckstop();
				msg.channel.send({embed: { 
					"description": "Forums auto checker is now disabled.", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk7.png?1518561202966"
					}
				}});
			} else {
				msg.channel.send({embed: { 
					"description": "Forums auto checker is already disabled!", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk4.png?1518561202898"
					}
				}});
			}			
			break;
		default:
			msg.channel.send({embed: { 
				"description": "'" + cmd + "' is not a known command.\nType ``" + config.prefix + "help`` for a list of commands.", 
				"color": 0x0000ff,	
				"thumbnail": { 
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk1.png?1518561202682"
				}
			}});
	    	console.log('!! Invalid command !!');
	    	console.log('----------\n');
	}
});
//Variables that can't be changed in every message
var repeatedthreads = ["hi"];
var repeatedtitles = [];
var breaker = false; //Prevents autocheck to run twice at the same time






//Makes the bot go online I guess
//bot.login(process.env.TOKEN);
bot.login(config.token);