//
// Created by You Zhou on 30/04/2021
//
// base code is from a template from https://www.sitepoint.com/discord-bot-node-js/
// idea is not copied, just the structure of the commands

require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection(); // dictionary essentially
const botCommands = require('./commands'); // imports all the things in the export of index.js in commands as a dictionary

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.DISCORD_TOKEN;

bot.login(TOKEN);

// objects
const Game = require("./objects/game.js").Game;

// constants that are useful
const QUIZCREATE = 88
const ENTERQUIZSET = 87

// data
var data = {games: {}, players: {}};
var questionNum = 1;

// functions
function sendQuestion(num,msg,game) {
  msg.channel.send(`Question #${num} sent to players!`);
  for(var key in game.players) {
    var player = game.players[key];
    player.send(`Question ${num}:`)
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
      message.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
      .then(collected => {
        var reaction = collected.first();
        message.channel.send(`You answered ${reaction.emoji.name}.`);
        // TODO: check for right answer  
      })
      .catch(collected => {
        message.channel.send("You reacted with an invalid answer... no points.");
      });
    });
  }
}

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.author.bot) return;

  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase(); // removes first word and makes that command

  if(msg.channel instanceof Discord.DMChannel) {
    // TODO: check if player messaging is in a game
    msg.reply("Hey there, to use this Bot, type \"$creategame\" in a server text channel!");
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
        }
        console.log(game);
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
        sendQuestion(questionNum,msg,game);
        // TODO: resend question and update scoreboard after time limit
      }
    }
  } catch (error) {
    console.error(error);
    msg.reply('Error trying to execute command!');
  }
});
