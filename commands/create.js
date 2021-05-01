const Game = require("../objects/game.js").Game;

module.exports = {
	name: "$creategame",
	description: "Creates a kahoot game",
	execute(msg, args, data) {
		msg.channel.send(
`Creating Quiz...
Enter which quiz set (1 - 5):`);
        data.games[msg.channel.id] = new Game([],-1,msg.author);
        console.log(data.games[msg.channel.id]);
	},
};