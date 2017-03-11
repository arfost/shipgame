'use strict'

/****
 * Une room 
 * 
 * 
 * 
 * 
 */

var getNewRoom = function (roomConfig, lobbyConfig) {
  return new Room(roomConfig, lobbyConfig);
}

module.exports.getNewRoom = getNewRoom;

class Room {

  constructor(roomConfig, propForList) {
    this.places = 2;
    this.name = roomConfig.name;
    this.desc = roomConfig.desc;
    this.maxPlayer = roomConfig.places;
    this.players = [roomConfig.owner];
    this.statut = "waiting"
    this.propForList = propForList;
  }

  updateClientInfo() {
    for (var prop of this.propForList) {
      var result = this;
      for (var subPath of prop.split('.')) {
        result = result[subPath];
      }
      this.roomClientInfo[prop.split('.')[0]] = result;
    }
  }

  addPlayer(playerProfil) {
    if (this.statut == "waiting") {
      this.players.push(playerProfil);
      if (this.players.length == this.maxPlayer) {
        this.statut = "launched";
        this.game = new Game({
          maxPlayer: this.maxPlayer
        });
      }
      this.updateClientInfo();
      return true;
    } else {
      return false;
    }

  }

  getPlayerList() {
    return this.players;
  }

  removePlayer(playerProfil) {

  }
}

class Game {
  constructor(gameOptions) {
    this.maxPlayer = gameOptions.maxPlayer;
    this.played = 0;
    this.play = [];
    this.score = {
      gamePlayed: 0,
      players: {}
    };
    for (player of gameOptions.players) {
      this.score.players[player] = {
        win: 0,
        score: 0
      }
    }
  }
  play(player, play) {
    this.played++;
    this.play.push({
      player: player,
      play: play
    });
    if (this.played == this.maxPlayer) {
      var winner = "";
      var score = 0;
      for (var play of this.play) {
        if (100 - play.play > score) {
          winner = play.player;
          score = 100 - play.play;
        }
      }
      this.score.players[winner].win++;
      this.score.players[winner].score += score;
      this.lastTurn = {
        play: JSON.stringify(JSON.parse(this.play)),
        winner: winner,
        score: score
      }
      this.play = [];
      this.played = 0;
    }
    return true;
  }

  gameStatForPlayer(player) {
    var gameStat = {};

    gameStat.score = this.score;
    gameStat.lastTurn = this.lastTurn;
    gameStat.played = this.played;
    var selfPlay = "";
    for (play of this.play) {
      if (play.player == player) {
        selfPlay = play.play;
      }
    }
    gameStat.selfPlay = selfPlay;

    return gameStat;
  }
}