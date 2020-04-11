/*
    Command: check
    Function: Checks for new threads in the forums and inform staff
    Author: Skeke#2155
*/
//Discord module
var bot = require('../bot.js').bot; //sends message
//Scrap modules
const request = require('request');
const cheerio = require('cheerio');
//Required by scrapper to connect or else gives HTTP code 403 (Forbidden)
const options = { 
    headers: {'user-agent': 'node.js'}
};
//File writer module
const fs = require('fs');
//Commands used by the command
const ext_steaminfo = require('./steaminfo.js');
const ext_serverh = require('./serverh.js');
const ext_stats = require('./stats.js');

//File path for repeated threads list
const rep_path = '../config/check_repeated_th_list.json';
const rep_path2 = './config/check_repeated_th_list.json';

//Server Addresses
const anime = "70.42.74.129:27015";
const mcttt = "192.223.31.40:27015";
const modded = "192.223.24.186:27015";
const prophunt = "192.99.239.40:27015";
const pure_mc = "206.221.183.139:25575"; 

//Roles ID of each server
const M_gl = '<@&387409444109025280>'; // Global
const M_dev = '<@&385537151393202176>'; // Developers
const M_an = '<@&387409402250002434>'; // Anime
const M_mc = '<@&387409235249594368>'; // MC TTT
const M_md = '<@&387409354204250122>'; // Modded
const M_ph = '<@&421155441519755284>'; // Prophunt

//Makes possible for the automatic async function test() to wait itself to finish to loop itself
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function sleep2(ms) {
    return new Promise(resolve2 => setTimeout(resolve2, ms));
}
//Auto check for new applications and appeals
//Variables and functions that scrap and send thread info
var postname, postauthor, postlink, postdate = '', seclink;
var selector, forbreaker;
var servertype = [];
var checkdata = [1];
const sectionlist = [
    241,213, //Global
    '256&sortby=lastpost&order=desc','255&sortby=lastpost&order=desc','300&sortby=lastpost&order=desc', //Developer

    130,132,133,134, //Anime
    51,53,48,59,66, //MC TTT
    91,87,93,296, //Modded
    270,271,272,283, //PropHunt
    227,231,229,//Pure Vanilla Minecraft
]; 
const sectiontype = [
    'Appeal','Application', //Global
    'Bug Report','Suggestion','Question', // Developer

    'Application','Report','Ban Appeal','Warn Appeal', //Anime
    'Report','Donor Support Thread','Application','Ban Appeal','Warn Appeal', //MC TTT
    'Report','Application','Ban Appeal','Warn Appeal', //Modded
    'Application','Ban Appeal','Warn Appeal','Report', //PropHunt
    'Support Thread','Report','Ban Appeal', //Pure Vanilla Minecraft
];
const sectionfrom = [
    'Forums/Network Appeals','Forum Moderator Applications',
    'Developer Corner','Developer Corner','Developer Corner',

    'Anime TTT','Anime TTT','Anime TTT','Anime TTT',
    'MC TTT','MC TTT','MC TTT','MC TTT','MC TTT',
    'Modded TTT','Modded TTT','Modded TTT','Modded TTT',
    'PropHunt','PropHunt','PropHunt','PropHunt',
    'Pure Vanilla Minecraft','Pure Vanilla Minecraft','Pure Vanilla Minecraft',
];
const sectionmention = [
    M_gl,M_gl,
    M_dev,M_dev,M_dev,

    M_an,M_an,M_an,M_an,
    M_mc,M_mc,M_mc,M_mc,M_mc,
    M_md,M_md,M_md,M_md,
    M_ph,M_ph,M_ph,M_ph,
    "","",""
];
exports.check = async function(fid, checkbypass) {
    checkdata = [];
    console.log('time bypass: ' + checkbypass);
    //Checks for manual test (with fid)
    var i;
    var fidcheck = false;
    if (fid == 'start') {
        await sleep(2250); //Waits for the startauto command (organizes console)
    }
    //Checks if fid is a number from the list
    for (i = 0; i < sectionlist.length; i++) { 
        if (fid == sectionlist[i]) {
            fidcheck = true;
            forbreaker = true;
            console.log('fidcheck: ' + fidcheck);
            console.log('forbreaker: ' + forbreaker);
        }
    }
    //loop for each forums section
    for (selector = 0; selector < sectionlist.length; selector++) {
        console.log("==Forums search #" + (selector+1) + ' | fid: ' + fid + ' | bypass: ' + checkbypass);
        //condition below is function to select a specific section and set vars for testing
        if (fidcheck === true) { 
            seclink = "http://forums.smithtainment.com/forumdisplay.php?fid=" + fid;
            for (i = 0; i < sectionlist.length; i++) { 
                if (fid == sectionlist[i]) {
                    selector = i;
                }
            }
        } else {
            seclink = "http://forums.smithtainment.com/forumdisplay.php?fid=" + sectionlist[selector];
        }
        console.log('Section #' + selector + ' ID: ' + sectionlist[selector]);
        console.log('Type: ' + sectiontype[selector]);
        console.log('From: ' + sectionfrom[selector]);
        //console.log('Forum link: ' + seclink);
        var poststeamid;
        request(seclink, options, function(error, response, html) {
            var $ = cheerio.load(html); 
            //Selects the post info from the forums section. eq(2) for first thread, eq(8) for second
            var scrapRoot = $('.forumdisplay_regular').eq(2).children();
            if (sectiontype[selector] !== 'Bug Report') {
                //Any thread
                postname = scrapRoot.children('span').children('span').eq(0).children('a').text();
                postlink = scrapRoot.children('span').children('span').eq(0).attr('id');
                postauthor = scrapRoot.children('div').children().text();
            } else {
                //Bug reports (threads with TAGS)
                postname = scrapRoot.children('span').children('span').eq(1).children('a').text();
                postlink = scrapRoot.children('span').children('span').length > 1 ? 
                    scrapRoot.children('span').children('span').eq(1).attr('id')
                    : scrapRoot.children('span').children('span').eq(0).attr('id');
                postauthor = scrapRoot.children('div').children('a').text();
            }
            console.log("Thread name: " + postname);
            console.log("Thread link: " + postlink);
            console.log("Thread author: " + postauthor);
            //If there is a post
            if (postname !==  undefined && postlink !== undefined && postauthor !== undefined) {
                postname = postname.trim();
                postlink = postlink.trim().split('tid_').join("").trim();
                postauthor = postauthor.trim();
                console.log('Repeated Threads: ' + require(rep_path).repeated_th);
            } else {
                console.log('No thread found.');
                console.log('==End of forums search #' + (selector+1) + '\n');
            }
        });
        delete require.cache[require.resolve(rep_path)];
        var rep_th = require(rep_path).repeated_th;
        //Waits the scraper and function to end to start again to prevent rewrite of variables in the wrong time
        await sleep(4500); //Waits for the first scrap to search for post
        if (postname !== undefined && postlink !== undefined && postauthor !== undefined) {
            //Checks if thread has already been seen or if there is a thread
            if (rep_th.includes(postlink) === false || checkbypass === true) { 
                console.log('Thread found.');
                //Sets the thread type
                checkdata[0] = 'notappl'; //replaces undefined
                servertype[1] = 'Server'; //replaces undefined
                switch (sectionlist[selector]) {
                    //Anime
                    case 130:
                        checkdata[0] = 'appl';
                    case 133:
                    case 134:
                        servertype = [anime,'Anime TTT'];
                        break;
                    //MC TTT
                    case 48: 
                        checkdata[0] = 'appl';
                    case 53:
                    case 59:
                    case 66:
                        servertype = [modded,'MC TTT'];
                        break;
                    //Modded
                    case 87: 
                        checkdata[0] = 'appl';
                    case 91:
                    case 93:
                    case 296:
                        servertype = [modded,'Modded TTT'];
                        break;
                    //PropHunt
                    case 270:
                        checkdata[0] = 'appl';
                    case 271:
                    case 272:
                        servertype = [prophunt,'PropHunt'];
                        break;
                    //Pure Vanilla Minecraft
                    case 227:
                    case 229:
                        servertype = [pure_mc, 'Pure Vanilla Minecraft'];
                        break;
                    //Threads that don't need Steam/GT info
                    case '256&sortby=lastpost&order=desc':
                    case '255&sortby=lastpost&order=desc':
                    case '300&sortby=lastpost&order=desc':
                        checkdata[0] = 'notneeded'; //gets sent with thread preview
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
                        await sleep2(2000); //Waits for the request to finish
                        //Checks if thread is recent (<1h) to avoid spamming when bot starts
                        if (postdate.includes('minute') === true || checkbypass === true) { //Change condition to "... == true" to work proprely
                            console.log('New recent thread found.');
                            if (checkbypass === false) {
                                //Repeated thread file writer
                                console.log('Old repeated threads list: ' + rep_th);
                                var rep_th_file = "{\n	\"repeated_th\": \"" + rep_th + ',' + postlink.split('http://forums.smithtainment.com/showthread.php?tid=').join('') + "\"\n}";
                                fs.writeFile(rep_path2, rep_th_file, function (err) {
                                    if (err) throw err;
                                    delete require.cache[require.resolve(rep_path)];
                                    rep_th = require(rep_path).repeated_th;
                                    console.log('Repeated threads list updated with: ' + postlink.split('http://forums.smithtainment.com/showthread.php?tid=').join(''));
                                });
                                await sleep(500);
                                console.log('Repeated threads from now: ' + rep_th);
                            }

                            //Doesn't look for the SteamID and other stuff if it's not needed                         
                            if (checkdata[0] == 'notneeded') {
                                var thread_title = $('title').text().trim();
                                var text_preview = $('.post_body').first().text().trim();
                                text_preview = text_preview + '';
                                text_preview = text_preview.split(' ').slice(0,35); // Word count in preview
                                text_preview = text_preview.join(' ') + '';
                                text_preview = text_preview.split('\n').join(' ').trim() + ' [...]';
                                poststeamid = undefined;
                                checksender(thread_title, text_preview);
                                return;
                            }
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
                                console.log('Failed to find SteamID, trying SteamID64...');
                                poststeamid = $('.post_body').first().text().trim();
                                poststeamid = poststeamid.split('765611').slice(1,2).join(''); //Gets the SteamID64 and everything after
                                poststeamid = poststeamid.split('').slice(0,11).join('').trim(); //Removes everything after the first 11 characters (because SteamID64s without the starting '765611' are(?) 11 characters long)
                                poststeamid = poststeamid.split(' ').slice(0,1).join(''); //Removes anything after the space after the SteamID64
                                poststeamid = poststeamid.split('\n').slice(0,1).join(''); //Removes anything after a line break after the SteamID64
                                poststeamid = poststeamid.split('.').slice(0,1).join('').trim(); //Removes anything after a dot after the SteamID
                                poststeamid = '765611' + poststeamid;
                            }
                            console.log('SteamID/64 written in post: ' + poststeamid);
                            //Checks if the author wrote a SteamID or not (even if it's broken)
                            if (poststeamid !== undefined && poststeamid !== '765611' && poststeamid !== 'STEAM_' && poststeamid !== "" && poststeamid !== " " && sectionlist[selector] !== 241) {
                                console.log('SteamID/64 found');
                                console.log('---Starting steaminfo function...');
                                ext_steaminfo.steaminfo(null,poststeamid, 'autoreq', postlink);
                            } else {
                                console.log('SteamID/64 not found, skipping steaminfo function. Section: ' + sectionfrom[selector]);
                                checkdata[0] = 'notfound';
                                checksender();
                            }
                        } else {
                            console.log('New thread found, but not recent.');
                            console.log('==End of forums search #' + (selector+1) + '\n');
                        }
                    }
                    reqwait(); //Calls next function (that continues)
                });
            } else {
                console.log('Thread found, but not new.');
                console.log('==End of forums search #' + (selector+1) + '\n');
            }
            //This awaits for the confirmation of a new recent post or not
            await sleep(4500);
            //Next condition tests if a new post is found
            if (postlink !== undefined && (postdate.includes('minute') === true || checkbypass == true)) {
                await sleep(3250); //This awaits for the post SteamID/64
                //Next condition tests if the SteamID/64 was found, if not it will continue to send the message in the other part of the code
                if (poststeamid !== undefined && poststeamid !== '765611' && poststeamid !== 'STEAM_' && poststeamid !== "" && poststeamid !== " " && sectionlist[selector] !== 241) {
                    await sleep(5250); //This awaits for the steaminfo function
                    var out = require('./steaminfo.js').output;
                    checkdata.push(out.d1, out.d2, out.d3, out.d4, out.d5); //checkdata 1-5
                    //Checks post type and selects what data to get for sending
                    if (checkdata[0] == 'appl') {
                        console.log('---Starting serverh function');
                        exports.checkdata = checkdata;
                        exports.servertype = servertype;
                        ext_serverh.scrapGT(null, null, 'autoreq', null);
                        console.log('>>> Starting sleep for serverh (6,5s)');
                        await sleep(6500); //This awaits for the serverh function
                        console.log('>>> Sleep for serverh ended');
                        out = require('./serverh.js').output;
                        checkdata.push(out); //checkdata 6
                        console.log('---Starting stats function');
                        ext_stats.stats(null, null, 'autoreq', servertype[0], checkdata[1]);
                        console.log('>>> Starting sleep for stats (5,5s)');
                        await sleep(5500); //This awaits for the stats function
                        console.log('>>> Sleep for stats ended');
                        out = require('./stats.js').output;
                        checkdata.push(out.d1, out.d2, out.d3); //checkdata 7-9

                        checksender();
                    } else {
                        console.log('---Starting stats function');
                        ext_stats.stats(null, null, 'autoreq', servertype[0], checkdata[1]);
                        console.log('>>> Starting sleep for stats (5,75s)');
                        await sleep(5750);
                        console.log('>>> Sleep for stats ended');
                        out = require('./stats.js').output;
                        checkdata[6] = 'not found'; //checkdata 6
                        checkdata.push(out.d1, out.d2, out.d3); //checkdata 7-9

                        checksender();
                        await sleep(500);
                    }
                    out = 'empty';
                }
            } else { await sleep(500);}
        }
        if (forbreaker === true) {
            checkbypass = false;
            break;
        }
        postdate = '';
    }
    await sleep(500);
    checkdata = [];
    checkbypass = false;
    console.log('===End of checking. fid: ' + fid + '\n');
}



//Collects the data from the checking and steaminfo function and send it
function checksender(thread_title, text_preview) {
    bot = require('../bot.js').bot;
    //Checkdata -> [name, profilelink, profileicon, gmodh, profilestate, steamid, graph, gthours]
    console.log('checkdata[0]: ' + checkdata[0]);
    for (var i=1;i<10;i++) { //Transforms undefined into 'not found' to stop some erros
        if (checkdata[i] === undefined) { checkdata[i] = 'not found';}
    }
    if (text_preview === undefined) { //If data is needed, show in console what will be sent
        console.log("Data recevied:\nservertype:" + servertype + "\n1 name: " + checkdata[1] + '\n2 profile link: ' + checkdata[2] + '\n3 profile image: ' + checkdata[3].substring(0, 35) + '...\n4 gmod hours: '+ checkdata[4] +'\n5 profile state: ' + checkdata[5] + '\n6 graph: ' + checkdata[6] + '\n7 gt hours: ' + checkdata[7] + '\n8 gt name: ' + checkdata[8] + '\n9 gt link: ' + checkdata[9]);       
    } else { //If it's not, show the text preview, which threads that don't need data have
        console.log('Thread Title: ' + thread_title + '\nText preview : ' + text_preview.split(' ').slice(0,20).join(' ') + '...')
    }
    /*
        Channels
        bot-chat -> "491775954864046080" (REMINDER: TEST BOT IS NOT IN THE STAFF DISCORD)
        test -> "496868812478742529"
    */
    const target = "496868812478742529";
    //If spam_spam_spam is remade and channel ID changes, it'll search by name (fix ID asap)
    if (bot.channels.get(target) === undefined) {
        bot.channels.get("413088508819800064").send('target not found! ('+target+')');
    }
    if (sectiontype[selector] !== "Bug Report")
        bot.channels.get(target).send(sectionmention[selector])
    else {
        var extramention = sectionmention[selector] + " "
        console.log(thread_title.substring(1,thread_title.indexOf("]")))
        switch (thread_title.substring(1,thread_title.indexOf("]"))) {
            case "MCTTT":
                extramention += M_mc
                break
            case "MTTT":
                extramention += M_md
                break
            case "ATTT":
                extramention += M_an
                break
            case "PH":
                extramention += M_ph
        }
        bot.channels.get(target).send(extramention)
    }
    /*
        Thread types
        notneeded: Bug Reports and Suggestions. Steam and GT info is not needed
        notfound: Default if no steaminfo is found, and it's a thread that uses steam info and gt info
        notappl: Default. Sends Steam info and GT info if found
        appl: Application. Steam, GT and GT Graph is used.
    */
    switch (checkdata[0]) {
        case "notfound": //ANY TYPE
           //NO STEAM INFO / NO GT INFO / NO GT GRAPH
            bot.channels.get(target).send({embed: {
                "title": "New " + sectiontype[selector] + "!",
                "description": "__" + postauthor + "__ posted " + postdate + " a(n) [" + sectiontype[selector] + "](" + postlink + ") in the [" + sectionfrom[selector] + "](" + seclink + ")! ",
                "color": 0x0000ff,
                "footer": {
                    "text": "Info from player not found."
                }
            }});
            break;
        case "notneeded": //FORUMS APP, SUGGESTIONS AND BUG REPORTS
            //NO STEAM INFO / NO GT INFO / NO GT GRAPH
            bot.channels.get(target).send({embed: {
                "title": "New " + sectiontype[selector] + "!",
                "description": "__" + postauthor + "__ posted " + postdate + " a(n) [" + sectiontype[selector] + "](" + postlink + ") in the [" + sectionfrom[selector] + "](" + seclink + ")! ",
                "color": 0x0000ff,
                "footer": {
                    "text": "Info from player not needed."
                },
                "fields": [
                    {
                        "name": "Thread preview",
                        "value": "**" + thread_title + "**```" + text_preview + "```"
                    }
                ]
            }});
            break;
        case "notappl": //NOT APPLICATION
            console.log('Steam info recieved (' + checkdata[0] + '). Sending message...');
            if (checkdata[4] === undefined || checkdata[4] == "" || checkdata[4] == 'notfound') { checkdata[4] == 'unknown';}
            if (checkdata[6] == 'notfound' || checkdata[6] == 'not found') {
                //STEAM INFO / GT INFO / NO GT GRAPH
                bot.channels.get(target).send({embed: {
                    "title": "New " + sectiontype[selector] + "!",
                    "description": "__" + postauthor + "__ posted *" + postdate + "* a [" + sectiontype[selector] + "](" + postlink + ") for the [" + sectionfrom[selector] + "](" + seclink + ")! ",
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
            console.log('Steam info recieved (' + checkdata[0] + '). Sending message...');
            if (checkdata[4] === undefined || checkdata[4] == "" || checkdata[4] == 'notfound') { checkdata[4] == 'unknown';}
            if (checkdata[6] !== undefined && checkdata[6] !== "notfound" && checkdata[6] !== "not found") {
                //STEAM INFO / GT INFO / GT GRAPH
                bot.channels.get(target).send({embed: {
                    "title": "New " + sectiontype[selector] + "!",
                    "description": "__" + postauthor + "__ posted *" + postdate + "* an [" + sectiontype[selector] + "](" + postlink + ") for the [" + sectionfrom[selector] + "](" + seclink + ")! ",
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
                    //STEAM INFO / GT INFO / NO GT GRAPH (not found)
                    "title": "New " + sectiontype[selector] + "!",
                    "description": "__" + postauthor + "__ posted *" + postdate + "* an [" + sectiontype[selector] + "](" + postlink + ") for the [" + sectionfrom[selector] + "](" + seclink + ")! ",
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
    }
    checkdata = [];
    console.log('New thread warning sent!\n----------\n');
}