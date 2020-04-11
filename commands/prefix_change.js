/*
    Command: prefix
    Function: Changes bot prefix (staff only)
    Author: Skeke#2155
*/
var bot = require('../bot.js').bot;
var prefix = require('../config/prefix.json');
const botinfo = require('./package.json');

exports.prefixChange = function(msg,args) {
    if (!(args == [] || args == undefined || args == '' || args == ' ')) { //ignores commands without arguments
        if (args.length == 2) { //ignores commands with wrong number of arguments (password, new prefix)
            console.log('Attempt to change prefix. Entry: ' + args[0]);
            if (args[0] === 'lolissKEKe5') { //password
                console.log('Correct password, changing prefix to: ' + args[1]);
                const fs = require('fs');
                const prefix_path = '../config/prefix.json';
                var prefix_file = '{\n	\"prefix\": \"'+args[1]+'\"\n}';
                fs.writeFile(prefix_path, prefix_file, function (err) {
                    if (err) throw err;
                    delete require.cache[require.resolve(prefix_path)];
                    prefix = require('../config/prefix.json');
                    console.log('Prefix changed. New prefix: ' + prefix.prefix);
                    msg.author.send('Prefix successfully changed to ``' + prefix.prefix + '``');
                    msg.delete();
                    bot.user.setPresence({ status: 'away', game: { name: prefix.prefix + 'help | @' + botinfo.name } });
                });
            } else { 
                console.log('Incorrect password.'); 
                msg.author.send('Incorrect password.');
                msg.delete();
            }			
        } else { 
            console.log('Attempt to change prefix. Incorrect args length.'); 
            msg.author.send('Please use '+prefix.prefix+'prefix ``password`` ``new prefix``');
            msg.delete();
        }
    } else { 
        console.log('Attempt to change prefix. No entry found.'); 
        msg.author.send('Changing the prefix requires a password.');
        msg.delete();
    }
}