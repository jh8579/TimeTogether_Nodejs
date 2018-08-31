require('date-utils');
var express = require('express');
var http = require('http');
var path = require('path');
var async = require('async');

var bodyParser = require('body-parser');

var mysql = require('mysql');

var multer = require('multer');
var memoryStorage = multer.memoryStorage();
var upload = multer({
  storage: memoryStorage
});

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json({
  extended: true
}));
app.use(express.favicon());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());

var conn = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  multipleStatements : true
});

///////////////// 에코톤 함수
app.post('/putNoise', upload.array('file'), function(req, res) {
  var roomId = req.body.roomId;
  var noise = req.body.noise;
  var temp = new Date();
  var date = temp.toFormat('HH24:MI');

  var noise = {
    roomId: roomId,
    noise: noise,
    time: date
  }

  var sql = "INSERT Into happy.RoomNoise SET ?";
  conn.query(sql, noise, function(err, results) {
    if (err) {
      console.log(err)
    } else {
      res.send('success');
    }
  });

});

app.get('/putnoise/:roomId/:noise', function(req, res) {
  var roomId = req.params.roomId;
  var noise1 = req.params.noise;
  var temp = new Date();
  var date = temp.toFormat('HH24:MI');

  var noise = {
    roomId: roomId,
    noise: noise1,
    time: date
  }

  var sql = "INSERT Into happy.RoomNoise SET ?";
  conn.query(sql, noise, function(err, results) {
    if (err) {
      console.log(err)
    } else {
      res.send('success');
    }
  });

});

app.get('/getNoise', function(req, res) {
  var sql = "SELECT DISTINCT roomId FROM happy.RoomNoise;"
  sql += "SELECT COUNT(DISTINCT roomId) AS count FROM happy.RoomNoise;"
  conn.query(sql, function(err, results) {
    console.log(results);

    var count = results[1][0].count;
    if (err) {
      console.log(err);
    }
    console.log(results);

    var roomId = new Array();
    for (var i = 0; i < count; i++) {
      roomId[i] = results[0][i].roomId;
    }

    var sql = "SELECT COUNT(DISTINCT roomId) AS count FROM happy.RoomNoise;";
    for (var i = 0; i < count; i++) {
      sql += "SELECT * FROM (SELECT * from happy.RoomNoise Where roomId=? order by time desc limit 10)as a order by time asc;";
    }
    conn.query(sql, roomId, function(err, result) {
      if (err) {
        console.log(err);
      }
      res.send(result);
    });
  });
});

app.post('/putClock', upload.array('file'), function(req, res){
  var bright = req.body.bright;
  var power = req.body.power;
  console.log(bright+power);
  var sql = "UPDATE happy.state SET clockBright=?, clockPower=?;"
  conn.query(sql, [bright, power], function(err, results) {
    if (err) {
      console.log(err);
      res.send({"code": "ERROR"})
    } else {
      res.send({"code": "OK"});
    }
  });

});

app.post('/putMood', upload.array('file'), function(req, res){
  var bright = req.body.bright;
  var power = req.body.power;

  var sql = "UPDATE happy.state SET moodBright=?, moodPower=?;"
  conn.query(sql, [bright, power], function(err, results) {
    if (err) {
      console.log(err);
      res.send({"code": "ERROR"})
    } else {
      res.send({"code": "OK"});
    }
  });

});

app.get('/getDevice', function(req, res){
  var sql = "SELECT * FROM happy.state WHERE id=1;"
  conn.query(sql, function(err, results) {
    if (err) {
      console.log(err);
    }
    res.send(results)
  });
})

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
