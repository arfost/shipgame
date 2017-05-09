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
        var players = Object.assign({}, this.players)
        delete players.length
        this.game = new Game({
          maxPlayer: this.maxPlayer,
          players: players
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
    console.log("new play : ", player, data, this.game, this)
    this.game.play(player, data)
    this.updateState()
  }

  updateState() {
    let playersStatuts = []
    for (let player in this.players) {
      if (player != "length") {
        playersStatuts.push({name:this.players[player].name, statut:!!this.players[player].ws})
      }
    }
    for (let player in this.players) {
      if (player != "length") {
        let message = "bad-status"
        if (this.statut == "WAITING") {
          message = "WAITING=" + (this.maxPlayer - this.players.length)
        }
        if (this.statut == "launched") {
          let gameStats = this.game.gameStatForPlayer(player);
          message = "LAUNCHED="+JSON.stringify({
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
    ws.removeAllListeners('message')
    ws.on('message', (data)=> {
      this.newMove(player, data)
    })
    ws.on("closed", ()=> {
      this.disconnectSocket(player)
    })
    this.updateState();
  }
}

class Game {
  constructor(gameOptions) {
    this.maxPlayer = gameOptions.maxPlayer;
    this.played = 0;
    this.plays = [];
    this.score = {
      gamePlayed: 0,
      players: {}
    };
    for (var player in gameOptions.players) {
      this.score.players[player] = {
        win: 0,
        score: 0
      }
    }
  }
  play(player, play) {
    this.played++;
    this.plays.push({
      player: player,
      play: play
    });
    if (this.played == this.maxPlayer) {
      var winner = "";
      var score = 0;
      for (var play of this.plays) {
        if (100 - play.play > score) {
          winner = play.player;
          score = 100 - play.play;
        }
      }
      this.score.players[winner].win++;
      this.score.players[winner].score += score;
      this.lastTurn = {
        play: JSON.parse(JSON.stringify(this.plays)),
        winner: winner,
        score: score
      }
      this.plays = [];
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
    for (let play of this.plays) {
      if (play.player == player) {
        selfPlay = play.play;
      }
    }
    gameStat.selfPlay = selfPlay;

    return gameStat;
  }
}