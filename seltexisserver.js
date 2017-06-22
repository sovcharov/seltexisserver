/*jslint nomen: true, node: true, unparam: true*/
(function () {
  "use strict";
  // var test = require('./test');
  // console.log(test);
  //     return;

  var express = require('express'),
  // cookieParser = require('cookie-parser'),
  app = express(),
  mysql = require('mysql'),
  mysqlConnection = require(__dirname + '/../seltexisdbconfig/dbconnectmysqlnode.js'),
  myFunctions = require('./myfunctions'),
  getTimeString = myFunctions.getTimeString,
  getDateString = myFunctions.getDateString,
  // https = require('https'),
  // fs = require('fs'),
  // privateKey,
  // certificate,
  // credentials,
  // httpsServer;
  http,
  httpServer;

  //UNCOMMENT FOR production
  //
  // privateKey = fs.readFileSync(__dirname + '/../ssl.key');
  // certificate = fs.readFileSync(__dirname + '/../ssl.crt');
  // credentials = {key: privateKey, cert: certificate};
  // httpsServer = https.createServer(credentials, app);
  // httpsServer.listen(5555, function () {
  // });

  //COMMENT FOR production
  //
  http = require('http');
  httpServer = http.createServer(app);
  httpServer.listen(5555, function () {
    console.log('start');
  });


  app.use(function (req, res, next) {
    var allowedOrigins = ['http://1.local', 'https://fvolchek.net', 'https://www.fvolchek.net', 'http://localhost:4200', 'http://seltex.ru', 'http://www.seltex.ru'],
    origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    // res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "DELETE, PUT");
    next();
  });

  app.get('/api/storedata/store/:id/date/:date', function (req, res) {


  });

  app.get('/api/test', function (req, res) {


    var query = "SELECT * FROM inventory WHERE id = 1",
    connection = mysql.createConnection(mysqlConnection);

    connection.connect();

    connection.query(query, function (err, rows, fields) {
      res.send(JSON.stringify(rows[0]));
      // res.send(JSON.stringify({first:"no", second: "yeah"}));
    });

    connection.end();
  });

  app.post('/api/log/user/:id/action/:action', function (req, res) {

    var query = "call addLog(" + req.params.id + ", '" + req.params.action + "')",
    connection = mysql.createConnection(mysqlConnection);

    connection.connect();

    connection.query(query, function (err, rows, fields) {
      res.send('OK');
    });

    connection.end();
  });

}());
