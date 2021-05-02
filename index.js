//
// Created by You Zhou on 30/04/2021
//
// base code is from a template from https://www.sitepoint.com/discord-bot-node-js/
// idea is not copied, just the structure of the commands

require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection(); // dictionary essentially
const botCommands = require('./commands'); // imports all the things in the export of index.js in commands as a dictionary

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.DISCORD_TOKEN;
const options = {
        method: 'GET',
        url: `https://${process.env.ASTRA_DB_ID}-${process.env.ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/keyspaces/${process.env.ASTRA_DB_KEYSPACE}/test_data_o`,
        headers: {
            'X-Cassandra-Token': `${process.env.ASTRA_DB_APPLICATION_TOKEN}`
        },
        params: {
            where: {
            },
        },
        validateStatus: false,
    }

bot.login(TOKEN);

// objects
const Game = require("./objects/game.js").Game;
const Score = require("./objects/score.js").Score;

const REACTDICT = { '🇦': "A",
          '🇧': "B",
          '🇨': "C",
          '🇩': "D"};

var TIMELIMIT = 20000;
var CORRECT = [1,2,3,4,1,2,3,4];

// data
var data = {games: {}, players: {}};
var questionNum = 1;

// functions
function calcScore(timeDiff) {
  return parseInt(1000 - timeDiff);
}

function sortScoreboard(scoreboard) {
  var obj = {};
  scoreboard.forEach((u,k) => {
    obj[k] = u;
  });
  var sorted = Object.keys(obj).sort((k1,k2) => {
    return obj[k2].score - obj[k1].score;
  }).map(k => {
    return {player: obj[k].player, score: obj[k].score};
  });
  return sorted;
}

function sendQuestion(num,msg) {
  if(!(msg.channel.id in data.games)) return;
  var game = data.games[msg.channel.id];
  questionNum = num;
  var quizData = game.quizData[num-1];
  var ans = quizData.ans.split(/\,/);
  // set media
  var media = {};
  if(quizData.id === 2) {
    media = {files:["./media/graph-min.png"]};
  } else if(quizData.id === 4) {
    media = {files:["./media/husky.mov"]};
  } else if (quizData.id === 5) {
    media = {files:["./media/test.cpp"]};
  }
  // set question
  var q_stmt = `Question ${num}: ${quizData.q_stmt}
A: ${quizData.c_1}
B: ${quizData.c_2}
C: ${quizData.c_3}
D: ${quizData.c_4}
(MAKE SURE YOU WAIT FOR ALL ANSWERS TO APPEAR BEFORE ANSWERING, IF THE BOT DOES NOT RESPOND TO YOUR REACTION, REACT AGAIN)`;
  if(quizData.is_mc === 'n') {
    q_stmt = `Question ${num}: ${quizData.q_stmt}
(MAKE SURE YOU WAIT FOR ALL ANSWERS TO APPEAR BEFORE ANSWERING, IF THE BOT DOES NOT RESPOND TO YOUR REACTION, REACT AGAIN)`
  }
  msg.channel.send(`Question #${num} sent to players: ${quizData.q_stmt}`,media);
  for(var key in game.players) {
    var player = game.players[key];
    if(!game.scoreboard.has(player.id)) game.scoreboard.set(player.id, new Score(player, game));
    if(quizData.is_mc === 'n') {
      player.send(q_stmt, media);
    } else {
      player.send(q_stmt, media)
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
          if(ans.includes(lastAnswer)) {
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
}

async function gameLoop(num,msg) { // start of every new round
  if(!(msg.channel.id in data.games)) return;
  var game = data.games[msg.channel.id];
  game.timeStarted = new Date();
  sendQuestion(num,msg);
  setTimeout(() => { // show results after time limit
    console.log(`Question ${num} results:`);
    console.log(game.scoreboard);
    msg.channel.send(`Question ${num} results:`);
    var sorted = sortScoreboard(game.scoreboard);
    for(var i = 0;i < sorted.length;i++) {
      msg.channel.send(`${i+1}. ${sorted[i].player.username}: ${sorted[i].score} points.`);
    }
    if(num === game.numQuestions) {
      msg.channel.send(`Winner is: <@${sorted[0].player.id}>!`);
      delete data.games[msg.channel.id];
    }
  if(num < game.numQuestions) {
      msg.channel.send(`React with ✅ to continue.`).then(message => {
        message.react('✅');
        const filter = (reaction,user) => {
          return reaction.emoji.name === '✅' && user === game.creator;
        };
        message.awaitReactions(filter, {max: 1}).then(collected => {
            gameLoop(num+1,msg);
        });
      });
  }
  }, TIMELIMIT);
}

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
  if (msg.author.bot) return;

  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase(); // removes first word and makes that command

  if(msg.channel instanceof Discord.DMChannel) {
    var author = msg.author;
    if(author.id in data.players) {
      var game = data.players[author.id].game;
      var quizData = game.quizData[questionNum-1];
      if(quizData.is_mc === 'n') {
        var timeAnswered = new Date();
        if(quizData.ans === msg.content) {
            var timeDiff = (timeAnswered.getTime() - game.timeStarted.getTime())/TIMELIMIT*500;
            var scoreBoost = calcScore(timeDiff);
            game.scoreboard.get(author.id).score += scoreBoost;
            msg.channel.send(`Your answer is correct! Gained ${scoreBoost} points! Score: ${game.scoreboard.get(author.id).score}`);
          } else {
            msg.channel.send(`Your answer is incorrect! Score: ${game.scoreboard.get(author.id).score}`);
          }
      } else {
        msg.channel.send("This is a multiple choice question!");
      }
    }  else {
      msg.reply("Hey there, to use this Bot, type \"$creategame\" in a server text channel!");
    }
    return;
  }

  if (!bot.commands.has(command)) { // if it is not a command then check if there's some other value to enter
    if(msg.channel.id in data.games) { // if there is a game see if we can choose a quiz
      var game = data.games[msg.channel.id];
      if(msg.author !== game.creator) return; // must be game creator to do stuff to game
      if(game.quiz === -1) { // select a quiz
        if (isNaN(command)) {
          msg.channel.send("Quiz set must be a number!");
        } else if (parseInt(command) < 1 || parseInt(command) > 5) {
          msg.channel.send("Quiz set must be between 1 and 5!");
        } else {
          msg.channel.send(
`Quiz set ${command} chosen!
All players who want to play, type $join.
The game creator can type $start to start.`);
          game.quiz = parseInt(command);
          const response = await axios.request(options);
          game.numQuestions = response.data.count;
          game.quizData = response.data.data;
        }
      }
    }
    return;
  }

  console.info(`Called command: ${command}`);

  try {
    bot.commands.get(command).execute(msg, args, data);
    if(command === "$start") {
      if(msg.channel.id in data.games) {
        var game = data.games[msg.channel.id];
        if(game.started) {
          for(var key in game.players) {
            data.players[game.players[key].id] = {player: game.players[key], game: game};
          }
          console.log(data.players);
          gameLoop(1,msg);
        }
      }
    }
  } catch (error) {
    console.error(error);
    msg.reply('Error trying to execute command!');
  }
});
