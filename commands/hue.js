/*
    Command: hue
    Function: Test command
*/

exports.hue = function(){

	//Update message parameters for this execution
    const msg = require('../bot.js').msg;

    msg.channel.send('br');
    console.log('----------\n');
}