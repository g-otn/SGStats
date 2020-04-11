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

exports.server_stats = async function(msg,url,apiID,name) {
    url = 'http://status.smithtainment.com/api/'+url+'/';
    console.log('Server name:',name,'\nServer url:',url);
    var text = '';
    request(url, options, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            text = $('#grohsfabian_game_server_status-'+apiID).text().trim();
            text = text.replace('Name:','').replace('Status:','\n').replace('Server:','\n').replace('Players:','\n').split('\n');
            console.log('Scraped text:',text);
            msg.channel.send({embed: {
                'title': name + ' info',
                'description': '``'+text[0]+'``\n**Status:** '+text[1]+'\n**IP:** ``'+text[2]+'``\n**Players:** '+text[3]+'\n',
                'url': url,
                'color': 0x313131,
                'footer': {
                    'text': 'Last scanned 1s ago via Reeb’s API',
                    'icon_url': 'https://cdn.discordapp.com/avatars/153550726793003008/08bb5ec777ab048d045ceca6254dac34.png?size=128'
                }
            }});
        } else {
            console.log('Error when acessing website ('+response.statusCode+'):',error);
            msg.channel.send({embed: { 
                "description": "Couldn't access the website. (" + response.statusCode + ')', 
                "color": 0x0000ff,	
                "thumbnail": { 
                    "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
                }
            }});
        }
    });
}