module.exports = {
	name: "$creategame",
	description: "Creates a kahoot game",
	execute(msg, args) {
		msg.channel.send(
`Creating Quiz...
Enter which quiz set (1 - 5):`);
		return 88;
	},
};