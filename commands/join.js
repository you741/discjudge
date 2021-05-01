const Game = require("../objects/game.js").Game;

module.exports = {
	name: "$join",
	description: "Lets playes join, must have game",
	execute(msg, args, data) {
        if(msg.channel.id in data.games) { // channel must have a game aleady
        	var game = data.games[msg.channel.id];
        	if(game.players.includes(msg.author,0)) {
        		msg.reply("You're already in the game!");
        	} else if (game.started === true) {
        		msg.reply(`Sorry, the game has started!`);
        	} else {
        		data.games[msg.channel.id].players.push(msg.author);
        		msg.reply("You've been added to the game!");
        		console.log(data.games[msg.channel.id]);
        	}
        }
	},
};