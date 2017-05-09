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
    this.places = roomConfig.places;
    this.name = roomConfig.name;
    this.desc = roomConfig.desc;
    this.maxPlayer = roomConfig.places;
    this.players = {}
    this.players[roomConfig.owner] = {
      name: roomConfig.owner
    }
    this.players.length = 1;
    this.statut = "WAITING"
    this.propForList = propForList;
    console.log("room finie de creer avec : ", roomConfig, this.players)
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
    if (this.statut == "WAITING") {
      this.players[playerProfil] = {
        name: playerProfil
      }
      this.players.length++;
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

  newMove(player, data) {
    this.game.play(player, data)
    this.updateState()
  }

  updateState() {
    let playersStatuts = {}
    for (let player in this.players) {
      if (player != "length") {
        playersStatuts[this.players[player].name] = !!this.players[player].ws
      }
    }
    for (let player in this.players) {
      if (player != "length") {
        let message = "bad-status"
        if (this.statut == "WAITING") {
          message = "WAITING:" + (this.maxPlayer - this.players.length)
        }
        if (this.statut == "launched") {
          let gameStats = this.game.gameStatForPlayer(player);
          message = "LAUNCHED:"+JSON.stringify({
            players: playersStatuts,
            gameStat: gameStats
          })

        }

        this.players[player].ws.send(message)
        console.log("message socket send", player, message)

      }

    }
  }

  disconnectSocket(player) {
    this.players[player].ws = false;
    this.updateState();
  }

  joinSocket(player, ws) {
    console.log("socket join room : ", player, this.players)
    this.players[player].ws = ws;
    ws.on("message", function (data) {
      this.newMove(player, data)
    })
    ws.on("closed", function () {
      this.disconnectSocket(player)
    })
    this.updateState();
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
    for (player in gameOptions.players) {
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