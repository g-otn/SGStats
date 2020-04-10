const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const botinfo = require('./package.json');

const request = require('request');
const cheerio = require('cheerio');

    /* Bot made by Skeke#2155 in Jan 2018 | Special thanks: Hades */

//Console bot iniciation confirmation
bot.on("ready", () => {
    console.clear();
    console.log(botinfo.name + ' v' + botinfo.version + ' started. \nAuthor: ' + config.author);
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
    //cmd = ['hue'];
    //args = ['br, '123']



    //Variables and functions to scrap Gamertracker base64 username
    //variables
    var errorcheck;
    var rawlink, b64user, GTid, graphtype;
    var scrapertarget, url, serverinfo, scanned;
    /*idk what this is but if I don't do this gamertracker does not let 
    me connect to the website (HTTP code: 403 (forbidden))*/
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
                	console.log('Website access successful. HTTP Code: ' + response.statusCode);
                	//console.log(html); Shows the entire page html, just to see if it's connected
                	var $ = cheerio.load(html);
                	rawlink = $('img#graph_player_time').attr('src'); //What we want (the link to the graph)
                	console.log('Raw scraped link: ' + rawlink);

                	extract_nameb64(server_address);

            	} else { //If it can't access
                	msg.channel.send("Player '" + args + "' doesn't play on this server, doesn't exist or has special characters on its name.");
                	console.log('Website access error. HTTP Code: ' + response.statusCode);
                	console.log('!! Image not sent because of website error !!');
            		console.log('----------\n');
            	}
        	});
        });
    }
    //function to separate the scraped raw link and get the base64 username
    function extract_nameb64(server_address) {
    	if (rawlink !== undefined) {
    		rawlink = rawlink.trim().split('nameb64=').slice(1,2);
        	rawlink = rawlink.join('');
        	b64user = rawlink.trim().split('&host=').slice(0,1);
        	console.log('Base64 Username: ' + b64user);
        	
        	sendimage(server_address);

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
		var finalimage = 'https://cache.gametracker.com/images/graphs/player_time.php?nameb64=' + b64user + '&host=' + ip + '&start=-' + graphtype + "&request=0";
    	console.log('Image to send: ' + finalimage);
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
                    console.log('Name: ' + name);
                    //Gathers the steam profile link
                    profilelink = $('code').children('a').text();
                    profilelink = profilelink.trim().split('http://steamcommunity.com/profiles/').slice(1,2).join();
                    profilelink = 'http://steamcommunity.com/profiles/' + profilelink;
                    console.log('Profile link: ' + profilelink);
                    //Gathers the steam profile state (public or private)
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
                    console.log('----------\n');
                }
            } else {
                console.log('Website access error. HTTP Code: ' + response.statusCode + '\n');
                console.log('!! Steam info not sent because of website error !!');
                console.log('----------\n');
            }
        });
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
            	console.log('!! Image not sent because of wrong graph type !!');
    		}
        	break;
        case 'moddedh':
            hourscmd_argsorganize(modded, args);
            graphtypeselector();
            if (errorcheck !== true) {
    			scrapGT(modded);
      		} else {
    			msg.channel.send("'" + graphtype + "' is not a valid graphtype. Please use 'day', 'week' or 'month'.");
            	console.log('!! Image not sent because of wrong graph type !!');
    		}
        	break;
        case 'roleplayh':
            hourscmd_argsorganize(roleplay, args);
            graphtypeselector();
            if (errorcheck !== true) {
    			scrapGT(roleplay);
      		} else {
    			msg.channel.send("'" + graphtype + "' is not a valid graphtype. Please use 'day', 'week' or 'month'.");
            	console.log('!! Image not sent because of wrong graph type !!');
    		}
        	break;
        case 'vanillah':
            hourscmd_argsorganize(vanilla, args);
            graphtypeselector();
            if (errorcheck !== true) {
    			scrapGT(vanilla);
      		} else {
    			msg.channel.send("'" + graphtype + "' is not a valid graphtype. Please use 'day', 'week' or 'month'.");
            	console.log('!! Image not sent because of wrong graph type !!');
    		}
        	break;
        case 'steaminfo':
            args = args.join(' ');
            steaminfo(args);
            break;
    	case 'hue':
            msg.channel.send('br');
            break;
        //Commands of the python bot that this bot will ignore
        case 'anime':
            break;
        case 'modded':
            break;
        case 'vanilla':
            break;
        default:
            msg.channel.send("'" + cmd + "' is not a known command.")
            console.log('!! Invalid command !!\n');
    }
});

//Makes the bot go online I guess
bot.login(config.token);