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

// constants that are useful
const quizMode = 88

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  if (msg.author.bot) return;

  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase(); // removes first word and makes that command

  if (!bot.commands.has(command)) return; // no command then bye
  console.info(`Called command: ${command}`);

  try {
    var cbid = bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
