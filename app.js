var path = require('path');
var logger = require('morgan');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var mongo = require('mongodb');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.set('port', process.env.PORT || 3000);

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'codeweekend'}));
app.use(express.static(path.join(__dirname, 'public')));

// Set up our database connection
var Db = mongo.Db;
var Server = mongo.Server;
var db = new Db('messages',
  new Server('localhost', '27017', {auto_reconnect: true}, {}),
  {safe: true}
);
db.open(function(){});

// Our own middleware which runs for every request
app.use(function(req, res, next) {
  if (req.session.message) {
    res.locals.message = req.session.message;
    req.session.message = null;
  }

  // Pass the db connection to the route handler
  req.db = db;
  next()
});

var venmo = require('./venmo');
app.use('/venmo', venmo);

var routes = require('./routes');
app.use('/', routes);

// If no routes activated by now, catch the 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Handle any errors by rendering the error page
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    errorMessage: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

// Start listening for requests
app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
