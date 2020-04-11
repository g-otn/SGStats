//===========================================================================
/*

	SGStats Discord bot
	Made by Skeke#2155 in Jan 2018
	current version information at package.json
	Special thanks: Hades#0666

*/
//===========================================================================
/*
	Main Modules
*/
//Discord Modules
const Discord = require('discord.js');
const bot = new Discord.Client();
//Settings and info
const botinfo = require('./package.json');
var prefix = require('./config/prefix.json');


/*
	Server Information for commands
*/
//Server Addresses
const animeph = "209.126.103.165:27045"
const csgo5v5 = '192.99.4.87:28791'
const mcttt = "192.223.31.40:27015"
const prophunt = "208.103.169.108:27024"
const tvanilla = '173.26.48.4:27045'


/*
	Bot initiation
*/
bot.on("ready", () => {
	exports.bot = bot;
	console.clear();
	bot.user.setUsername(botinfo.name);
	bot.user.setPresence({ status: 'away', game: { name: prefix.prefix + 'help | @' + botinfo.name } });
	console.log(botinfo.name + ' v' + botinfo.version + ' started. \nAuthor: ' + botinfo.author);
	console.log('Prefix: ' + prefix.prefix);
	console.log('============================\n');
	bot.channels.get("468491525379194880").send('**' + botinfo.name + ' has started.**\n``' + Date(Date.now()) + '``');
});


/*
	Message detector and command executor
*/
bot.on("message", (msg) => { //Detect messages
	/*
		Channel log
	*/
	if (msg.channel.id == '559392429254639626') // Public Discord Announcements
		require('fs').appendFile('log/announcements.txt', msg.content.replace('@', '') + '\n', () => {})
	if (msg.channel.id == '379434065033560074' && msg.content.length !== 0) // Staff Discord MCTTT Relay 
    require('fs').appendFile('log/mcttt_relay.txt', msg.content + '\n', () => {})
  
	/*
		Message Filter
	*/
	//Ignore the message if it doesn't start with the prefix or it's from a bot
	if (msg.content.includes(botinfo.name + ' has started.') === false) {
		//Main bot: <@394544294490275847> | SGStats#6003
		//Test bot: <@439196372152090625> | SGStats-test#5661
		if (msg.content.startsWith('<@394544294490275847>')) {
			msg.content = msg.content.split('<@394544294490275847>').join('!!');
		} else if (msg.content.startsWith('<@394544294490275847> ')) {
			msg.content = msg.content.split('<@394544294490275847> ').join('!!');
		}
		if (msg.content !== prefix.prefix + 'startauto') {
			if (!msg.content.startsWith(prefix.prefix) || msg.author.bot) return;
		}
	}
	//Checks if it's the "starting message"
	if (msg.content.includes(botinfo.name + ' has started.') === true && msg.author.bot) {
		// Commands executed on start
		//bot.channels.get("468491525379194880").send(prefix.prefix + 'startauto');
		//msg.content = prefix.prefix + 'checkbypass 255&sortby=lastpost&order=desc';
		//msg.content = prefix.prefix + 'checkbypass 241';
		return; //Comment if a msg.content is changed, uncomment otherwise
	}



	/*
		Message parsing
	*/
	//Log in the console about the command
	console.log('=> Command by ' + msg.author.tag + ' in #' + msg.channel.name + ': ' + msg.content);

	//Separate the prefix from the rest ('!hue br 123' -> 'hue br 123')
	var p_cmd_arg = msg + ''; //Transforms the command into a string
	var cmd_arg = p_cmd_arg.replace(prefix.prefix, ''); //Replaces the prefix for nothing ('');
	cmd_arg = cmd_arg.toString();
	//Separation between the command (without prefix) and arguments  
	var args = cmd_arg.trim().split(' ').slice(1); //Separate arguments (['hue', 'br', '123'] -> ['br', '123'])
	var cmd = cmd_arg.trim().split(' ').slice(0,1).toString(); //Separate command (['hue', 'br', '123'] -> ['hue'])
	console.log('=> Command: ' + cmd);
	console.log('=> Arguments: ' + args);



	/*
		Command Filter
	*/
	cmd = cmd.toLowerCase(); //remove case-sensitivity for commands (not args)
	var cmd_m // Command module: stores the file that will be required
	switch (cmd) {
		/*
			Regular commands
		*/
		//Help command
		case '':
		case 'help':
			cmd_m = require('./commands/help.js');
			args = args.join(' ').trim();
			cmd_m.help(msg,args);
			break;


		//Online command
		case 'online':
			if (args[0] !== undefined)
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			var cmd_m = require('./commands/online.js');
			args = args.join('').trim();
			cmd_m.onlineplayers(msg,args);
			break;


		//Population command
		case 'population':
			if (args[0] !== undefined)
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			cmd_m = require('./commands/population.js');
			cmd_m.populationgraph(msg,args[0], args[1]);
			break;


		//stats command
		case 'stats':
			if (args[0] !== undefined)
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			cmd_m = require('./commands/stats.js');
			cmd_m.stats(msg,args);
			break;


		//Server (stats) commands
		case 'server':
			msg.channel.send({embed: { "description": "You have to select a server! Use ``" + prefix.prefix + "help server`` for more information.", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"}}});
			break;
		case 'cs':
		case 'csgo':
			cmd_m = require('./commands/server_stats.js');
			cmd_m.server_stats(msg, 'csgo5v5', '21', 'CS:GO 5v5');
			break;
		case 'mc':
		case 'mcttt':
		case 'mcmd':
			cmd_m = require('./commands/server_stats.js');
			cmd_m.server_stats(msg, 'mcttt', '19', 'MC TTT');
			break;
		case 'ph':
		case 'prophunt':
			cmd_m = require('./commands/server_stats.js');
			cmd_m.server_stats(msg, 'prophunt', '18', 'PropHunt');
			break;
		case 'va':
		case 'vanilla':
			cmd_m = require('./commands/server_stats.js')
			cmd_m.server_stats(msg, 'vttt', '22', 'True Vanilla TTT')
			break;


		//Serverh command
		case 'serverh':
			msg.channel.send({embed: { "description": "You have to select a server! Use ``" + prefix.prefix + "help serverh`` for more information.", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"}}});
			break;
    case 'anh':
    case 'animeh':
    case 'animeph':
			if (args[0] !== undefined)
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			exports.args = args;
			cmd_m = require('./commands/serverh.js');
			cmd_m.hourscmd_argsorganize(animeph, args);
			cmd_m.graphtypeselector(msg, require('./commands/serverh.js').args);
			cmd_m = require('./commands/serverh.js'); //reload
			if (cmd_m.errorcheck !== true) cmd_m.scrapGT(msg, animeph, 'main', cmd_m.args); 
      break
		case 'mch':
		case 'mcttth':
		case 'mcmdh':
			if (args[0] !== undefined)
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			exports.args = args;
			cmd_m = require('./commands/serverh.js');
			cmd_m.hourscmd_argsorganize(mcttt, args);
			cmd_m.graphtypeselector(msg, require('./commands/serverh.js').args);
			cmd_m = require('./commands/serverh.js'); //reload
			if (cmd_m.errorcheck !== true) cmd_m.scrapGT(msg, mcttt, 'main', cmd_m.args); 
			break;
		case 'phh':
		case 'prophunth':
			if (args[0] !== undefined)
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			exports.args = args;
			cmd_m = require('./commands/serverh.js');
			cmd_m.hourscmd_argsorganize(prophunt, args);
			cmd_m.graphtypeselector(msg, require('./commands/serverh.js').args);
			cmd_m = require('./commands/serverh.js'); //reload
			if (cmd_m.errorcheck !== true) cmd_m.scrapGT(msg, prophunt, 'main', cmd_m.args);
			break;
		case 'vah':
		case 'vanillah':
			if (args[0] !== undefined)
			args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			exports.args = args;
			cmd_m = require('./commands/serverh.js');
			cmd_m.hourscmd_argsorganize(csgo5v5, args);
			cmd_m.graphtypeselector(msg, require('./commands/serverh.js').args);
			cmd_m = require('./commands/serverh.js'); //reload
			if (cmd_m.errorcheck !== true) cmd_m.scrapGT(msg, csgo5v5, 'main', cmd_m.args);
			break;
		case 'csh':
		case 'csgoh':
			msg.channel.send({embed: { "description": "Gamertracker does not support player hours in CS:GO servers.", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk3.png?1552863583494"}}});
			break;
			

		//Steaminfo command
		case 'steaminfo':
			cmd_m = require('./commands/steaminfo.js');
			args = args.join(' ');
			cmd_m.steaminfo(msg, args, "main");
			break;
			

		// Bug Report command
		case 'bugreport':
			cmd_m = require('./commands/pm_bug_report.js')
			cmd_m.startBugReport(msg)
			break;

		// Suggestion command
		case 'suggestion':
			cmd_m = require('./commands/pm_suggestion.js')
			cmd_m.startNewSuggestion(msg)
			break;
			
		/*
			Test, automatic and configuration commands
		*/
		//Message test command
		case 'hue':
			cmd_m = require('./commands/hue.js');
			cmd_m.hue(msg);
			break;

		case 'say':
			if (msg.author.tag !== "Skeke#2155") return
			cmd_m = require('./commands/say.js')
			cmd_m.sendMessage(msg.channel, args)
			break;
		/*case 'test':
			cmd_m = require('./commands/Check2/Check2.js')
			cmd_m.test();
			break;
		*/

		//Forums check commands
		case 'check':
			cmd_m = require('./commands/check.js');
			cmd_m.check(args, false);
			break;
		case 'checkbypass':
			if (msg.author.tag !== "Skeke#2155" && msg.author.tag !== 'SGStats#6003' && msg.author.tag != 'SGStats-test#5661') 
				return
			cmd_m = require('./commands/check.js');
			cmd_m.check(args, true);
			break;


		//Forums auto checking commands
		case 'startauto': //Starts auto check
			cmd_m = require('./commands/check.js');
			console.log('breaker: ' + breaker);
			if (!breaker) {	
				interval = setInterval(function(){cmd_m.check('auto', false)}, 600000); //60000 = 1min; 600000 = 10min;
				breaker = true;
				console.log('Auto checker started. breaker: ' + breaker +'\n');
				if (msg.author.bot) { msg.delete(); return};
				msg.channel.send({embed: { "description": "Forums auto checker is now running.", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk8.png?1518561204876"}}});
				console.log('Forums auto checker is now running.');
			} else {
				msg.channel.send({embed: { "description": "Forums auto checker is already running!", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk4.png?1518561202898"}}});
				console.log('Forums auto checker is already running!');
			}
			break;
		case 'stopauto': //Stop auto check
			cmd_m = require('./commands/check.js');
			console.log('breaker: ' + breaker);
			if (breaker === true) {
				clearInterval(interval);
				breaker = false;
				console.log('Auto checker stopped. breaker: ' + breaker +'\n');
				msg.channel.send({embed: { "description": "Forums auto checker is now disabled.", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk7.png?1518561202966"}}});
				console.log('Forums auto checker is now disabled.');
			} else {
				msg.channel.send({embed: { "description": "Forums auto checker is already disabled!", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk4.png?1518561202898"}}});
				console.log('Forums auto checker is already disabled!');
			}			
			break;


		//Prefix changer command
		case 'prefix':
			cmd_m = require('./commands/prefix_change.js');
			cmd_m.prefixChange(msg,args);
			break;


		//Unknown command
		default:
			msg.channel.send({embed: { "description": "'" + cmd + "' is not a known command.\nType ``" + prefix.prefix + "help`` for a list of commands.", "color": 0x0000ff,	"thumbnail": { "url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk1.png?1518561202682"}}});
			console.log('!! Invalid command !!');
			console.log('----------\n');
	}
	args = '';
	cmd = '';
});

var interval;
var breaker = false; //Prevents autocheck to run twice at the same time

//'Request number' for GamerTracker URLs
exports.req_num = Math.floor(Math.random() * 9999999999999990);
//exports.req_num = "";



/*
	Autoping (anti-sleep) for glitch.com
*/
require('./config/autoping.js').antiSleep();



/*
	Bot login options (console and glitch.com)
*/
bot.login(process.env.TOKEN || require('./config/token.json').token);