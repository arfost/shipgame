'use strict'

var express = require('express')
var app = express()

app.use('/', express.static('static'));

var game = require('./gameModel.js')
var lobby = require('./lobbyModel.js').getNewLobby(game);


lobby.add({
  places:5,
  name:'game 1',
  desc:'desc de game 1'
});
lobby.add({
  places:6,
  name:'game 2',
  desc:'desc de game 2'
});
lobby.add({
  places:5,
  name:'game 3',
  desc:'desc de game 3'
});
lobby.add({
  places:8,
  name:'game 4',
  desc:'desc de game 4'
});
lobby.add({
  places:6,
  name:'game 5',
  desc:'desc de game 5'
});

app.get('/lobby/gamesList', function (req, res) {
  console.log('retest', req.query);
  
  var gameToShow = [];
 var gameList = lobby.getClientGameList();
  for(var game in gameList){
    if (req.query.empty == 'false' || (gameList[game]['players.length'] > 0)){
      gameList[game].key = game;
      gameToShow.push(gameList[game]);
    }
  }

  res.status(200).json(gameToShow);
});

app.get('/lobby/joinGame', function (req, res) {
  
  var joined = lobby.join(req.query.key);
  if(joined){
    lobby.updateGameClientInfo(req.query.key, Date.now())
  }
  res.status(200).json(joined);
  console.log("toto")
});

app.get('/lobby/createGame', function (req, res) {
  res.status(200).json(lobby.add({
    places:req.query.places,
    name:req.query.name,
    desc:req.query.desc
  }));
});

app.get('/', function (req, res) {
  console.log('test')
  res.status(200).sendFile(__dirname + '/templates/index.html');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
