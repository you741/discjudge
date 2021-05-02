module.exports = {
  Game: function(players,quiz,creator) {
  	this.players = players;
  	this.quiz = quiz;
  	this.creator = creator;
  	this.started = false;
  	this.scoreboard = {};
  	this.timeStarted = -1;
  },
};
