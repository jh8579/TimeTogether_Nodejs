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
  host: 'timetotogetherdb.chz1adkzud9i.us-east-1.rds.amazonaws.com',
  user: 'root',
  password: 'dkfkq486',
  port: 3306,
  database: 'happy',
  multipleStatements : true
});

// var conn = mysql.createConnection({
//   host: process.env.RDS_HOSTNAME,
//   user: process.env.RDS_USERNAME,
//   password: process.env.RDS_PASSWORD,
//   port: process.env.RDS_PORT,
//   database: 'happy',
//   multipleStatements : true
// });

app.use(express.errorHandler());


app.post('/putNoise', function(req, res) {
  var roomId = req.body.roomId;
  var noise = req.body.noise;
  var temp = new Date();
  var date = temp.toFormat('YY-MM-DD HH24:MI');

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

// select *
// from (select * from mytable order by `Group`, Age desc, Person) x
// group by `Group`

// var sql = "SELECT * FROM (SELECT * from RoomNoise Where roomId=? order by time desc limit 10)as a order by time asc;";


app.get('/getNoise', function(req, res) {
  var sql = "SELECT DISTINCT roomId FROM RoomNoise;"
  sql += "SELECT COUNT(DISTINCT roomId) AS count FROM RoomNoise;"
  conn.query(sql, function(err, results) {
    console.log(results);

    var count = results[1][0].count;
    if(err){
      console.log(err);
    }
    console.log(results);

    var roomId = new Array();
    for(var i=0; i<count; i++){
      roomId[i]=results[0][i].roomId;
    }

    var sql = "SELECT COUNT(DISTINCT roomId) AS count FROM RoomNoise;";
    for(var i=0; i<count; i++){
      sql += "SELECT * FROM (SELECT * from RoomNoise Where roomId=? order by time desc limit 10)as a order by time asc;";
    }
    conn.query(sql, roomId, function(err, result) {
      if(err){
        console.log(err);
      }
      res.send(result);
    });
  });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
