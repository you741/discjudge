module.exports = {
  Game: function(players,quiz,creator) {
  	this.players = players;
  	this.quiz = quiz;
  	this.creator = creator;
  	this.started = false;
  	this.scoreboard = new Map();
  	this.timeStarted = -1;
  	this.numQuestions = -1;
  	this.quizData = {};
  },
};
