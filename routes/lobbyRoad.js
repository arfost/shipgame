const express = require('express');
const router = express.Router();

var room = require('../roomModel.js')
var lobby = require('../lobbyModel.js').getNewLobby(room);


router.get('/gamesList', function (req, res) {
    console.log('retest', req.query);

    var gameToShow = [];
    var gameList = lobby.getClientRoomList();
    for (var game in gameList) {
        if (req.query.empty == 'false' || (gameList[game]['players'] > 0)) {
            gameList[game].key = game;
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