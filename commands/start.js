const Game = require("../objects/game.js").Game;

module.exports = {
	name: "$start",
	description: "Starts a game, needs a game",
	execute(msg, args, data) {
		if(msg.channel.id in data.games) {
			if(data.games[msg.channel.id].creator === msg.author) {
				var game = data.games[msg.channel.id];
				msg.channel.send("Starting game...");
				data.games[msg.channel.id].started = true;
		        console.log(data.games[msg.channel.id]);
		        for(var key in game.players) {
		        	var player = game.players[key];
		        	player.send("First question:");
		        }
			} else {
				msg.reply("You are not the game creator so you cannot start the game.");
			}
		} else {
			msg.reply("Cannot start, there is no game being created!");
		}
	},
};