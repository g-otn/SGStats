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
	Information declaration for commands
*/
//Server Addresses
const anime = "70.42.74.129:27015";
const modded = "192.223.31.40:27015";
const prophunt = "192.99.239.40:27015";
const pure_mc = "206.221.183.139:25575"; 
const starwars = "70.42.74.160:27015";
const vanilla = "192.223.24.186:27015";

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
	bot.channels.get("413088508819800064").send('**' + botinfo.name + ' has started.**\n``' + Date(Date.now()) + '``');
});


/*
	Message detector and command executor
*/
//Detect messages
bot.on("message", (msg) => {
	/*
		Message Filter
	*/
	//Ignore the message if it doesn't start with the prefix or it's from a bot
	if (msg.content.includes(botinfo.name + ' has started.') === false) {
		//Main bot: <@394544294490275847>
		//Test bot: <@439196372152090625>
		if (msg.content.startsWith('<@394544294490275847>')) {
			msg.content = msg.content.split('<@394544294490275847>').join('!!');
		} else if (msg.content.startsWith('<@394544294490275847> ')) {
			msg.content = msg.content.split('<@394544294490275847> ').join('!!');
		}
		if (msg.content !== prefix.prefix + 'startauto') {
			if (!msg.content.startsWith(prefix.prefix) || msg.author.bot) return;
		}
	}
	//Checks if it's the 'starting message'
	if (msg.content.includes(botinfo.name + ' has started.') === true && msg.author.bot) {
		console.log('Bot startup message found.\n');
		//commands executed on start
		//bot.channels.get("413088508819800064").send(prefix.prefix + 'startauto');
		//msg.content = prefix.prefix + 'checkbypass 132';
		//msg.content = prefix.prefix + 'checkbypass 59';
		return; //Comment if a command above is executed, uncomment otherwise
	}

    //Log in the console about the command
    console.log('=> Command by ' + msg.author.tag + ' in #' + msg.channel.name + ': ' + msg.content);
    //Separate the prefix from the rest ('!hue br 123' -> 'hue br 123')
    var p_cmd_arg = msg + ''; //Transforms the command into a string
    var cmd_arg = p_cmd_arg.replace(prefix.prefix, ''); //Replaces the prefix for nothing ('');
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



	//Export the message parameters (author, channel, content, ...) for external functions
	exports.msg = msg;



	/*
		Command Filter
	*/
	//List of commands modules
	/*
	var ext_check = require('./commands/check.js');
	var ext_help = require('./commands/help.js');
	var ext_hue = require('./commands/hue.js');
	var ext_online = require('./commands/online.js');
	var ext_stats = require('./commands/stats.js');
	var ext_population = require('./commands/population.js');
	var ext_server_stats = require('./commands/server_stats.js');
	var ext_serverh = require('./commands/serverh.js');
	var ext_steaminfo = require('./commands/steaminfo.js');
	*/

	//Commands
	cmd = cmd.toLowerCase(); //remove case-sensitivity for commands (not args)
	switch (cmd) {
		/*
			Regular commands
		*/
		//Help command
		case '':
		case 'help':
			var ext_help = require('./commands/help.js');
			args = args.join(' ').trim();
			ext_help.help(args);
			break;
		//Online command
		case 'online':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			var ext_online = require('./commands/online.js');
			args = args.join('').trim();
			ext_online.onlineplayers(args);
			break;
		//Population command
		case 'population':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			var ext_population = require('./commands/population.js');
			ext_population.populationgraph(args[0], args[1]);
			break;
		//stats command
		case 'stats':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			var ext_stats = require('./commands/stats.js');
			ext_stats.stats(args);
			break;
		//Server (stats) command
		case 'server':
			msg.channel.send({embed: { 
				"description": "You have to select a server! Use ``" + prefix.prefix + "help server`` for more information.", 
				"color": 0x0000ff,	
				"thumbnail": { 
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
				}
			}});
			break;
		case 'an':
		case 'anime':
			var ext_server_stats = require('./commands/server_stats.js');
			ext_server_stats.server_stats(anime, 'Anime TTT');
			break;
		case 'md':
		case 'modded':
			var ext_server_stats = require('./commands/server_stats.js');
			ext_server_stats.server_stats(modded, 'MC TTT');
			break;
		case 'ph':
		case 'prophunt':
			var ext_server_stats = require('./commands/server_stats.js');
			ext_server_stats.server_stats(prophunt, 'PropHunt');
			break;
		case 'mc':
		case 'puremc':
		case 'minecraft':
			var ext_server_stats = require('./commands/server_stats.js');
			ext_server_stats.server_stats(pure_mc, 'Pure Vanilla Minecraft');
			break;
		case 'sw':
		case 'starw':
		case 'starwars':
			var ext_server_stats = require('./commands/server_stats.js');
			ext_server_stats.server_stats(starwars, 'Star Wars TTT');
			break;
		case 'va':
		case 'vanilla':
			var ext_server_stats = require('./commands/server_stats.js');
			ext_server_stats.server_stats(vanilla, 'Vanilla TTT');
			break;
		//Serverh command
		case 'serverh':
			msg.channel.send({embed: { 
				"description": "You have to select a server! Use ``" + prefix.prefix + "help serverh`` for more information.", 
				"color": 0x0000ff,	
				"thumbnail": { 
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk10.png?1521343597176"
				}
			}});
			break;
		case 'anh':
		case 'animeh':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			exports.args = args;
			var ext_serverh = require('./commands/serverh.js');
			ext_serverh.hourscmd_argsorganize(anime, args);
			ext_serverh.graphtypeselector(msg, require('./commands/serverh.js').args);
			ext_serverh = require('./commands/serverh.js'); //reload
			if (ext_serverh.errorcheck !== true) ext_serverh.scrapGT(anime, 'main', ext_serverh.args);
			break;
		case 'mdh':
		case 'moddedh':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			exports.args = args;
			var ext_serverh = require('./commands/serverh.js');
			ext_serverh.hourscmd_argsorganize(modded, args);
			ext_serverh.graphtypeselector(msg, require('./commands/serverh.js').args);
			ext_serverh = require('./commands/serverh.js'); //reload
			if (ext_serverh.errorcheck !== true) ext_serverh.scrapGT(modded, 'main', ext_serverh.args); 
			break;
		case 'phh':
		case 'prophunth':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			exports.args = args;
			var ext_serverh = require('./commands/serverh.js');
			ext_serverh.hourscmd_argsorganize(prophunt, args);
			ext_serverh.graphtypeselector(msg, require('./commands/serverh.js').args);
			ext_serverh = require('./commands/serverh.js'); //reload
			if (ext_serverh.errorcheck !== true) ext_serverh.scrapGT(prophunt, 'main', ext_serverh.args);
			break;
		case 'mch':
		case 'pmch':
		case 'puremch':
		case 'minecrafth':
			msg.channel.send({embed: { 
				"description": "Gamertracker does not support player hours of Minecraft servers.", 
				"color": 0x0000ff,	
				"thumbnail": { 
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk2.png?1518561205095"
				}
			}});
			break;
		case 'swh':
		case 'starwh':
		case 'starwarsh':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			exports.args = args;
			var ext_serverh = require('./commands/serverh.js');
			ext_serverh.hourscmd_argsorganize(starwars, args);
			ext_serverh.graphtypeselector(msg, require('./commands/serverh.js').args);
			ext_serverh = require('./commands/serverh.js'); //reload
			if (ext_serverh.errorcheck !== true) ext_serverh.scrapGT(starwars, 'main', ext_serverh.args);
			break;
		case 'vah':
		case 'vanillah':
			if (args[0] !== undefined) {
				args[0] = args[0].toLowerCase(); //Removes args case sensitivity
			}
			exports.args = args;
			var ext_serverh = require('./commands/serverh.js');
			ext_serverh.hourscmd_argsorganize(vanilla, args);
			ext_serverh.graphtypeselector(msg, require('./commands/serverh.js').args);
			ext_serverh = require('./commands/serverh.js'); //reload
			if (ext_serverh.errorcheck !== true) ext_serverh.scrapGT(vanilla, 'main', ext_serverh.args);
			break;
		//Steaminfo command
		case 'steaminfo':
			var ext_steaminfo = require('./commands/steaminfo.js');
			args = args.join(' ');
			ext_steaminfo.steaminfo(args, "main");
			break;
		/*
			Test, automatic and configuration commands
		*/
		//Test command
		case 'hue':
			var ext_hue = require('./commands/hue.js');
			ext_hue.hue();
			break;
		//Forums check commands
		case 'check':
			var ext_check = require('./commands/check.js');
			ext_check.check(args, false);
			break;
		case 'checkbypass':
			var ext_check = require('./commands/check.js');
			ext_check.check(args, true);
			break;
		//Forums auto checking commands
		case 'startauto': //Starts auto check
			var ext_check = require('./commands/check.js');
			console.log('breaker: ' + breaker);
			if (breaker === false) {	
				interval = setInterval(function(){ext_check.check('auto', false)}, 600000); //60000 = 1min; 600000 = 10min;
				breaker = true;
				console.log('Auto checker started. breaker: ' + breaker);
				msg.channel.send({embed: { 
					"description": "Forums auto checker is now running.", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk8.png?1518561204876"
					}
				}});
				console.log('Forums auto checker is now running.');
			} else {
				msg.channel.send({embed: { 
					"description": "Forums auto checker is already running!", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk4.png?1518561202898"
					}
				}});
				console.log('Forums auto checker is already running!');
			}
			break;
		case 'stopauto': //Stop auto check
			var ext_check = require('./commands/check.js');
			console.log('breaker: ' + breaker);
			if (breaker === true) {
				clearInterval(interval);
				breaker = false;
				console.log('Auto checker stopped. breaker: ' + breaker);
				msg.channel.send({embed: { 
					"description": "Forums auto checker is now disabled.", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk7.png?1518561202966"
					}
				}});
				console.log('Forums auto checker is now disabled.');
			} else {
				msg.channel.send({embed: { 
					"description": "Forums auto checker is already disabled!", 
					"color": 0x0000ff,	
					"thumbnail": { 
						"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk4.png?1518561202898"
					}
				}});
				console.log('Forums auto checker is already disabled!');
			}			
			break;
		//Prefix changer command
		case 'prefix':
			if (!(args == [] || args == undefined || args == '' || args == ' ')) { //ignores commands without arguments
				if (args.length == 2) { //ignores commands with wrong number of arguments (password, new prefix)
					console.log('Attempt to change prefix. Entry: ' + args[0]);
					if (args[0] === 'lolissKEKe5') { //password
						console.log('Correct password, changing prefix to: ' + args[1]);
						const fs = require('fs');
						const prefix_path = './config/prefix.json';
						var prefix_file = '{\n	\"prefix\": \"'+args[1]+'\"\n}';
						fs.writeFile(prefix_path, prefix_file, function (err) {
							if (err) throw err;
							delete require.cache[require.resolve(prefix_path)];
							prefix = require('./config/prefix.json');
							console.log('Prefix changed. New prefix: ' + prefix.prefix);
							msg.delete();
							msg.author.send('Prefix successfully changed to \'' + prefix.prefix + '\'');
							bot.user.setPresence({ status: 'away', game: { name: prefix.prefix + 'help' } });
						});
					} else console.log('Incorrect password.');			
				} else console.log('Attempt to change prefix. Incorrect args length.');
			} else console.log('Attempt to change prefix. No entry found.');
			break;
		//Unknown command
		default:
			msg.channel.send({embed: { 
				"description": "'" + cmd + "' is not a known command.\nType ``" + prefix.prefix + "help`` for a list of commands.", 
				"color": 0x0000ff,	
				"thumbnail": { 
					"url": "https://cdn.glitch.com/4ffc454b-6ce7-4018-83e1-63084831192f%2Fk1.png?1518561202682"
				}
			}});
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
/*
const autoping = require('./config/autoping.js');
autoping.autopingfunction();
*/



/*
	Bot login options (console and glitch.com)
*/
//bot.login(process.env.TOKEN);
bot.login(require('./config/token.json').token);