// Prologue: Please excuse the repetitive nature of the code, it was written hastily. 
var request = require('request');
var express = require('express');
var nodeUuid = require("node-uuid");
var validator = require("validator");
var async = require("async");
var Promise = require('bluebird');
var router = express.Router();

// Constants
var base = 'http://localhost:3000/'
var clientId = 'SsOMWhuXnXPHdrOjD67FMyfOcBm2XumCBUUrC0n5btiSbTVt';
var authorizeUrl = 'https://oauth.groupme.com/oauth/authorize?client_id=' + clientId;
var apiEndpoint = 'https://api.groupme.com/v3'

// groupme root shouldn't be used for anything
router.get('/', function(req, res) {
	if (req.session.groupme_token) {
    return res.redirect(base + 'main');
  } else {
    return res.redirect(authorizeUrl);
  }
});

// groupme authorize redirects to the oath url
router.get('/authorize', function(req, res) {
  if (req.session.groupme_token) {
    return res.redirect(base + 'main');
  } else {
    return res.redirect(authorizeUrl);
  }
});

// groupme success sets the access token post oath then sends to main
router.get('/success', function(req, res) {
  req.session.groupme_token = req.query.access_token;
  request.get({
    url: apiEndpoint + '/users/me' + '?token=' + req.session.groupme_token
  }, function(err, response, body) {
    if (err) {
      console.log(err);
      return res.redirect('http://en.wikipedia.org/wiki/HTTP_404');
    }
    req.session.groupme_id = ((JSON.parse(body)).response).id;
  });
  return res.redirect(base + 'main');
});

// groupme groups return json data for the user's groups
router.get('/groups', function(req, res) {
  // don't give them anything if they aren't logged in
  if (!req.session.groupme_token) {
    return res.json(null);
  }
  request.get({
    url: apiEndpoint + '/groups' + '?token=' + req.session.groupme_token
  }, function(err, response, body) {
    if (err) {
      console.log(err);
      return res.redirect('http://en.wikipedia.org/wiki/HTTP_404');
    }

    var data = (JSON.parse(body)).response;
    sendData = [];
    for (var i in data) {
      sendData.push({'conversationName' : data[i].name, 'id' : data[i].group_id});
    }  
    return res.json(sendData); 
  }); 
});

// separate function to generate and stringify the json for sending a message
function createMessageJSON(message) {
  var uuid = nodeUuid.v1(); // unique identifier based on current time
  var json = {"message":{"source_guid": uuid,"text":message}};
  return JSON.stringify(json);
}

// groupme send takes the message and group to send it in
router.post('/send', function(req, res) {
  var message = req.body.message;
  var group_id = req.body.group_id;
  request.post({
    url: apiEndpoint + '/groups/' + group_id  + '/messages?token=' + req.session.groupme_token,
    headers: {
        'Content-Type': 'application/json' // can't forget about your headers
    },
    body: createMessageJSON(message)
  }, function(err, response, body) {
      // probably should return a value based on the api's response, but I didn't... maybe later
      return res.json(null); 
  });
});

// the all knowing promise while loop taken from http://blog.victorquinn.com/javascript-promise-while-loop
var promiseWhile = function(condition, action) {
    var resolver = Promise.defer();
 
    var loop = function() {
        if (!condition()) return resolver.resolve();
        return Promise.cast(action())
            .then(loop)
            .catch(resolver.reject);
    };
 
    process.nextTick(loop);
 
    return resolver.promise;
};

// groupme load takes the last message read in and the group_id which triggers 
// requests to the api to retrieve all the messages in the group and put them in the db
router.get('/load', function(req, res) {
  var last_message = req.query.last_message;
  var group_id = req.query.group_id;
  var done = true;
  message_count = 0;
  promiseWhile(function() {
    // Condition for stopping
    return done;
  }, function() {
  // Action to run, should return a promise
    return new Promise(function(resolve, reject) {
      //async event that returns a Promise.
      request.get({
        url: apiEndpoint + '/groups/' + group_id  + '/messages?token=' + req.session.groupme_token + "&before_id=" + last_message + "&limit=100"
      }, function(err, response, body) {
            if (response.statusCode == 304 || err || body == "Not Found") {
              done = false;
            } else {
            var data = (JSON.parse(body)).response;
            for (var i in data.messages) {
              message_count++;
              var curr = data.messages[i];
              var image = null;
              if (curr.attachments.length != 0 && curr.attachments[0].type == 'image') {
                image = curr.attachments[0].url;
              }
              // strip html tags maybe
              var text = validator.escape(curr.text);
              json = {'name' : curr.name, 'text': text, 'pic': curr.avatar_url,'like_count': (curr.favorited_by).length, 'image': image, 'message_id': curr.id, 'group_id':group_id};
              last_message = curr.id;
              req.db.collection('messages').update({message_id: json.message_id}, json, {upsert : true}, function(err, result) {
                if (err) {
                  //return res.json({'err' : err});
                }
              });
            }
          }
        console.log("loaded " + message_count + " messages into db");
        resolve();   
      }); 
    });
  }).then(function() {
      // this will run after completion of the promiseWhile Promise!
    req.db.collection('messages').ensureIndex({ text: "text" }, function(err, result) {
      console.log("successfully loaded")
      res.json({'success' : true});
    });
  });
});

// groupme messages returns the most recent 100 messages from the given group_id
router.get('/messages', function(req, res) {
  var group_id = req.query.group_id;
  request.get({
    url: apiEndpoint + '/groups/' + group_id  + '/messages?token=' + req.session.groupme_token + "&limit=100",
  }, function(err, response, body) {
      if (err || body == "Not Found") {
        return res.json([]);
      }
      var data = (JSON.parse(body)).response;
      sendData = [];
      for (var i in data.messages) {
        var curr = data.messages[i];
        var image = null;
        if (curr.attachments.length != 0 && curr.attachments[0].type == 'image') {
          image = curr.attachments[0].url;
        }
        // strip html tags maybe
        var text = validator.escape(curr.text);
        json = {'name' : curr.name, 'text': text, 'pic': curr.avatar_url,'like_count': (curr.favorited_by).length, 'image': image, 'message_id': curr.id, 'group_id':group_id};
        sendData.push(json);
        req.db.collection('messages').update({message_id: json.message_id}, json, {upsert : true}, function(err, result) {
          if (err) {
            //return res.json({'err' : err});
          }
        });
      } 
    //req.db.collection('messages').ensureIndex({ text: "text" }, function(err, result) {
      return res.json(sendData);
    //});
  });
});

// groupme moremessages is called whenever the user wants to load messages past the first 100
router.get('/moremessages', function(req, res) {
  var group_id = req.query.group_id;
  var last_message = req.query.last_message;
  request.get({
    url: apiEndpoint + '/groups/' + group_id  + '/messages?token=' + req.session.groupme_token + "&before_id=" + last_message + "&limit=100"
  }, function(err, response, body) {
      if (response.statusCode == 304 || err || body == "Not Found") {
        return res.json([]);
      }
      var data = (JSON.parse(body)).response;
    sendData = [];
      for (var i in data.messages) {
        var curr = data.messages[i];
        var image = null;
        if (curr.attachments.length != 0 && curr.attachments[0].type == 'image') {
          image = curr.attachments[0].url;
        }
        // strip html tags maybe
        var text = validator.escape(curr.text);
        json = {'name' : curr.name, 'text': text, 'pic': curr.avatar_url,'like_count': (curr.favorited_by).length, 'image': image, 'message_id': curr.id, 'group_id':group_id};
        sendData.push(json);
        req.db.collection('messages').update({message_id: json.message_id}, json, {upsert : true}, function(err, result) {
          if (err) {
            //return res.json({'err' : err});
          }
        });
      }  
    return res.json(sendData); 
  });
});

// groupme search is called to query the mongodb for a given string
router.get('/search', function(req, res) {
  var param = req.query.param; // text to query with 
  var group_id = req.query.group_id;
  sendData = [];
  req.db.collection('messages').find({text:{$regex : ".*" + param + ".*"}}).toArray(function(err, items) {
    // used async to make sure we pushed all of the results onto the list before we sent it back
    async.each(items, function(item, callback) {
      sendData.push(item);
      callback();
    }, function(err) {
        return res.json(sendData);
    });
  });
});

module.exports = router;

