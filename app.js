var express = require('express'),
  http = require('http'),
  path = require('path'),
  mysql = require('mysql'),
  async = require('async');

require('date-utils');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

var conn = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  database: 'happy'
});

app.use(express.errorHandler());


app.post('/putNoise', function(req, res) {
  var roomId = req.body.roomId;
  var noise = req.body.noise;
  var temp = new Date();
  var date = temp.toFormat('YYYY-MM-DD HH24:MI:SS');

  var noise = {
    roomId: roomId,
    noise: noise,
    time: date
  }

  var sql = "INSERT Into RoomNoise SET ?";
  conn.query(sql, noise, function(err, results) {
    if (err) {
      console.log(err)
    } else {
      res.send('success');
    }
  });

});

app.get('/getNoise/:roomId', function(req, res) {
  var roomId = req.params.roomId;

  var sql = "SELECT * FROM (SELECT * from RoomNoise Where roomId=? order by time desc limit 10)as a order by time asc";
  conn.query(sql, [roomId], function(err, results) {
    if(err){
      console.log(err);
    }
    console.log(results);
    res.send(results);
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
