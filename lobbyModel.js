defaultConfig = require("./lobbyConfig.json")

var getNewLobby = function(config){
  return new Lobby(config);
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
  }
  
  add(game){
      var key = this.getNewKey();

      for(var prop in this.config.propToAdd){
          game[prop] = this.config.propToAdd[prop];
      }

      this.gameList[key] = game;
      var gameClientInfo = {};

      for(var prop of this.config.propForList){
          var result = game;
          for(var subPath of prop.split('.')){
              result = result[subPath];
          }
          gameClientInfo[prop] = result;
      }
      gameClientInfo.key = key;
      this.clientGameList.push(gameClientInfo);

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

  updateGameClientInfo(key){
      var game = this.gameList[key];

      for(var gameClientInfo of this.clientGameList){
          if(gameClientInfo.key == key){
              for(var prop of this.config.propForList){
                var result = game;
                for(var key of prop.split('.')){
                    result = result[key];
                }
                gameClientInfo[prop] = result;
            }
            break;
          }
      }
  }

  getGameDetail(key){
      return this.gameList[key];
  }

  getNewKey(){
      return Date.now();
  }
  
}