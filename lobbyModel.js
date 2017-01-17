'use strict'

var defaultConfig = require("./lobbyConfig.json")

var getNewLobby = function(game, config){
  return new Lobby(game, config);
}

module.exports.getNewLobby = getNewLobby;

class Lobby{

  constructor(config){
      if(config == undefined){
          this.config = defaultConfig;
      }else{
          this.config = config;
      }
      this.clientGameList = [];
      this.gameList = {};
    this.game = game;
  }
  
  add(gameOptions){
      var key = this.getNewKey();
		var game = this.game.getNewGame(gameOptions);
    	
      for(var prop in this.config.propToAdd){
          game[prop] = this.config.propToAdd[prop];
      }

      this.gameList[key] = game;
      game.gameClientInfo = {};

      for(var prop of this.config.propForList){
          var result = game;
          for(var subPath of prop.split('.')){
              result = result[subPath];
          }
          game.gameClientInfo[prop] = result;
      }
      game.gameClientInfo.key = key;
      this.clientGameList.push(game.gameClientInfo);

      return key;
  }

  join(key, player){

      var game = this.gameList[key];
      if(game.players.length < game.places){
          game.players.push(player);
          return true;
      }else{
          return false;
      }
  }

  getClientGameList(){
      console.log(this.clientGameList);
      return this.clientGameList;
  }

  getGameDetail(key){
      return this.gameList[key];
  }

  getNewKey(){
      return Date.now();
  }
  
}