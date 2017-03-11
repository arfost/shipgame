'use strict'

var express = require('express')
var cookieSession = require('cookie-session')
var bodyParser = require('body-parser');
const logger = require('morgan');


const lobby = require('./routes/lobbyRoad');
var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.use(logger('dev'));

app.use('/static', express.static('static'));

app.use('/lobby', lobby);

app.get('/', function (req, res) {
  console.log('test')
  req.session.name = "Anonymous-"+ new Date().toString();
  res.status(200).sendFile(__dirname + '/templates/index.html');
});

app.get('/name/:name', function (req, res) {
  console.log('test')
  req.session.name = req.params.name;
  res.status(200).end("new name : "+req.params.name);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    //print in console
    console.log("erreur : ", err)

    // render the error page
    res.status(err.status || 500);
    res.send('error : ' + err.message);
});

module.exports = app;