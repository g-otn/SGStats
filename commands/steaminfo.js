/*
    Command: steaminfo
    Function: Shows info from steam of a player
    Author: Skeke#2155
*/
//Scrap modules
const request = require('request');
const cheerio = require('cheerio');
//Anti-HTTP Code 403 (Forbidden)
const options = { 
    headers: {'user-agent': 'node.js'}
};

exports.steaminfo = async function(msg, input, requesttype)  {
    console.log('Request type: ' + requesttype);
    input = input + "";
    console.log('input: ' + input);
    if ((input !== "" && requesttype !== 'autoreq') || requesttype == 'autoreq') {
        var steamid, name, profilelink, profilestate, steamid64, customURL; //scraped in steamidfinder
        var profileicon, gmodh, privatecheck; //scraped from steam
        var customID, gameslist; //made with scraped values
        var idfinderlink = 'https://steamidfinder.com/lookup/' + input;
        console.log('URL to scrap: ' + idfinderlink);
        request(idfinderlink, options, await function (error, response, html) {
            console.log('Scraper started');
            if (!error && response.statusCode == 200) {
                console.log('Website access successful. (' + response.statusCode + ')');
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
                                        "text": "Searched via steamidfinder.com and steamcommunity.com",
                                        'icon_url': 'https://i.imgur.com/WQA9KyN.png'
                                    },
                                    "thumbnail": {
                                        "url": profileicon
                                    }
                                }});
                                console.log('----------\n');
                                break;
                            case 'autoreq':
                                /*
                                    Check function wanted data
                                */
                                //checkdata.push(name, profilelink, profileicon, gmodh, profilestate);
                                exports.output = {
                                    'd1': name, //checkdata[1]
                                    'd2': profilelink, //checkdata[2]
                                    'd3': profileicon, //checkdata[3]
                                    'd4': gmodh, //checkdata[4]
                                    'd5': profilestate //checkdata[5]
                                };
                                console.log('---End of steaminfo function');
                                break;
                            default:
                                console.log('Unknown request type (steaminfo function): ' + requesttype);
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
                    }

                }
            } else {
                if (requesttype == "main") {
                    msg.channel.send({embed: { 
                        "description": "Could not access the website. (" + response.statusCode + ')', 
                        "color": 0x0000ff,	
                        "thumbnail": { 
                            "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                        }
                    }});
                    console.log('Website access error. (' + response.statusCode + ')');
                    console.log('!! Steam info not sent because of website error !!');
                    console.log('----------\n');
                } else { 
                    console.log('steaminfo command could not access the website');
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