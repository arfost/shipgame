const express = require('express');
const router = express.Router();

var room = require('../roomModel.js')
var lobby = require('../lobbyModel.js').getNewLobby(room);

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: lobby.config.port });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
      console.log("socket connection : ", data)
    var datas = data.split(":")
    lobby.joinGameSocket(datas[0], datas[1], ws)
  });
});

router.get('/gamesList', function (req, res) {
    

    var gameToShow = [];
    var gameList = lobby.getClientRoomList();
    console.log('nouvelle game liste demandée au server', req.query, gameList);
    for (var game in gameList) {
        if (req.query.empty == 'false' || (gameList[game]['players'] > 0)) {
            gameToShow.push(gameList[game]);
        }
    }

    res.status(200).json(gameToShow);
});

router.get('/joinGame', function (req, res, next) {

    if (req.query.key && req.session.name) {
        var joined = lobby.join(req.query.key, req.session.name);
        res.status(200).json(joined);
    }
    var err = new Error(req.query.key ? 'No player for the join request' : 'No key and maybe no player for the join request');
    err.status = 403;
    next(err);
});

router.post('/createGame', function (req, res) {
    console.log("creation de game avec : ", req.body, "::")
    var create = lobby.add({
        places: req.body.places,
        name: req.body.name,
        desc: req.body.desc,
        owner: req.session.name
    })
    res.status(200).json(create);
});

module.exports = router;