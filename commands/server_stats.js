/*
    Command: server
    Function: Shows info about a specific SG server
    Author: original by Hades#0666, recreated by Skeke#2155
*/
//Command info
var msg = require('../bot.js').msg;
//Scrap modules
const request = require('request');
const cheerio = require('cheerio');
//Anti-HTTP Code 403 (Forbidden)
const options = { 
    headers: {'user-agent': 'node.js'}
};


//function from Hades old bot that shows server info
exports.server_stats = function(server, name2) {

    //Update message parameters for this execution
    msg = require('../bot.js').msg;

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