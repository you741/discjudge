const Game = require("../objects/game.js").Game;
const Score = require("../objects/score.js").Score;

const REACTDICT = { '🇦': 1,
					'🇧': 2,
					'🇨': 3,
					'🇩': 4};

var TIMELIMIT = 15000;
var CORRECT = [1,2,3,4,1,2,3,4];

// functions
function calcScore(timeDiff) {
	return parseInt(1000 - timeDiff);
}

function sortScoreboard(scoreboard) {
	var sorted = Object.keys(scoreboard).sort((k1,k2) => {
		return scoreboard.get(k2).score - scoreboard.get(k1).score;
	}).map(k => {
		return scoreboard.get(k).player;
	});
	return sorted;
}

function sendQuestion(num,msg,game) {
  msg.channel.send(`Question #${num} sent to players!`);
  for(var key in game.players) {
    var player = game.players[key];
    if(!game.scoreboard.has(player.id)) game.scoreboard.set(player.id, new Score(player, game));
    player.send( // TODO: insert question from database here
`Question ${num}:
(MAKE SURE YOU WAIT FOR ALL ANSWERS TO APPEAR BEFORE ANSWERING, IF THE BOT DOES NOT RESPOND TO YOUR REACTION, REACT AGAIN)`)
    .then(async message => {
      try {
        await message.react('🇦');
        await message.react('🇧');
        await message.react('🇨');
        await message.react('🇩');
      } catch(error) {
        console.error('Could not react with one of the emojis');
      }
      
      const filter = (reaction,user) => {
        return ["🇦","🇧","🇨","🇩"].includes(reaction.emoji.name) && !user.bot;
      };

      message.awaitReactions(filter, {max: 1, time: TIMELIMIT, errors: ['time']})
      .then(collected => {
        var reaction = collected.first();
        var p = reaction.message.channel.recipient;
        message.channel.send(`You answered ${reaction.emoji.name}.`);
        var lastAnswer = REACTDICT[reaction.emoji.name];
        var timeAnswered = new Date();
        if(lastAnswer === CORRECT[num - 1]) {
        	var timeDiff = (timeAnswered.getTime() - game.timeStarted.getTime())/TIMELIMIT*500;
        	var scoreBoost = calcScore(timeDiff);
        	game.scoreboard.get(p.id).score += scoreBoost;
        	message.channel.send(`Your answer is correct! Gained ${scoreBoost} points! Score: ${game.scoreboard.get(p.id).score}`);
        } else {
        	message.channel.send(`Your answer is incorrect! Score: ${game.scoreboard.get(p.id).score}`);
        }
      })
      .catch(collected => {
        message.channel.send(`You did not answer in time!`);
      });
    });
  }
}

async function gameLoop(num,msg,game) { // start of every new round
  game.timeStarted = new Date();
  sendQuestion(num,msg,game);
  setTimeout(() => { // show results after time limit
    console.log(`Question ${num} results:`);
    console.log(game.scoreboard);
    msg.channel.send(`Question ${num} results:`);
    console.log(sortScoreboard(game.scoreboard));
	if(num < game.numQuestions) {
	    msg.channel.send(`React with ✅ to continue.`).then(message => {
	    	message.react('✅');
	    	const filter = (reaction,user) => {
	    		return reaction.emoji.name === '✅' && user === game.creator;
	    	};
	    	message.awaitReactions(filter, {max: 1}).then(collected => {
			      gameLoop(num+1,msg,game);
	    	});
	    });
	}
  }, TIMELIMIT);
}

var questionNum = 1;

module.exports = {
	name: "$start",
	description: "Starts a game, needs a game",
	execute(msg, args, data) {
		if(msg.channel.id in data.games) {
			var game = data.games[msg.channel.id];
			if(game.creator === msg.author) {
				if (game.players.length === 0) {
					msg.reply("Must have at least one player to start!");
					return;
				} else if (game.quiz === -1) {
					msg.reply("There must be a valid quiz before you can start!");
					return;
				} else if (game.started) {
					msg.reply("Game already started!");
					return;
				}
				msg.channel.send("Starting game...");
				data.games[msg.channel.id].started = true;
        		gameLoop(questionNum,msg,game);
			} else {
				msg.reply("You are not the game creator so you cannot start the game.");
			}
		} else {
			msg.reply("Cannot start, there is no game being created!");
		}
	},
};