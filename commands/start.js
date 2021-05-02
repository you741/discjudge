const Game = require("../objects/game.js").Game;

module.exports = {
	name: "$start",
	description: "Starts a game, needs a game",
	execute(msg, args, data) {
		if(msg.channel.id in data.games) {
			if(data.games[msg.channel.id].creator === msg.author) {
				var game = data.games[msg.channel.id];
				if (game.players.length === 0) {
					msg.reply("Must have at least one player to start!");
					return;
				} else if (game.quiz === -1) {
					msg.reply("There must be a valid quiz before you can start!");
					return;
				}
				msg.channel.send("Starting game...");
				data.games[msg.channel.id].started = true;
			} else {
				msg.reply("You are not the game creator so you cannot start the game.");
			}
		} else {
			msg.reply("Cannot start, there is no game being created!");
		}
	},
};