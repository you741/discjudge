module.exports = {
	name: "$reactiontest",
	description: "for testing reaction",
	execute(msg, args, data) {
		msg.channel.send("Reaction test")
			.then(message => {
				message.react('🇦');
				message.react('🇧');
				message.react('🇨');
				message.react('🇩');
			});
		return 0;
	},
};