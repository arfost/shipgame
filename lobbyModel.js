'use strict'

var defaultConfig = require("./lobbyConfig.json")

var getNewLobby = function(room, config){
  return new Lobby(room, config);
}

module.exports.getNewLobby = getNewLobby;
/**
 * Le Lobby est chargé de contenir la liste des /rooms 
 * de la maintenir, et de l'exposer au serveur
 * 
 * properties : 
 * * config : un objet json contenant les configs du lobbyConfig
 *      -propForList list des properties a afficher venant de la room
 * * clientRoomList : array de resumé de room + getter
 * * roomList : une map clef/valeur de rooms
 * * room : reference static contenant le constructeur des room a maintenir
 *  
 * 
 */
class Lobby{

/**
 * cree un nouveau lobby,
 * -room:
 *      type de room a utiliser pour creer une nouvelle partie
 * 
 * -config:(optionnel)
 *        les configs a utiliser pour le lobby
 */
  constructor(room, config){
      if(config == undefined){
          this.config = defaultConfig;
      }else{
          this.config = config;
      }
      this.clientRoomList = [];
      this.roomList = {};
    this.room = room;
  }
  
  /**
   * ajoute une nouvelle room au lobby,
   * et l'ajoute ainsi que son resumé aux listes du lobby
   * -roomOptions:
   *            options de la room a creer, fournis par le client
   * *return : key de la room
   * 
   */
  add(roomOptions){
      var key = this.getNewKey();
		var room = this.room.getNewRoom(roomOptions, this.config.propForList);

      this.roomList[key] = room;
      room.roomClientInfo = {};

      for(var prop of this.config.propForList){
          var result = room;
          for(var subPath of prop.split('.')){
              result = result[subPath];
          }
          room.roomClientInfo[prop] = result;
      }
      room.roomClientInfo.key = key;
      this.clientRoomList.push(room.roomClientInfo);

      return key;
  }
/**
 * ajouter un joueur a une room
 * -key:    
 *      clef de la room a rejoindre
 * -player: 
 *          player a ajouter dans la room
 */
  join(key, player){

      var room = this.roomList[key];
      return room.addPlayer(player);
  }
/**
 * 
 */
  getClientRoomList(){
      console.log(this.clientRoomList);
      return this.clientRoomList;
  }

  getRoomDetail(key){
      return this.roomList[key];
  }

  getNewKey(){
      return Date.now();
  }
  
}