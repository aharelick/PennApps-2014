var request = require('request');
var express = require('express');
var nodeUuid = require("node-uuid");
var validator = require("validator");
var router = express.Router();

var base = 'http://localhost:3000/'
var clientId = 'SsOMWhuXnXPHdrOjD67FMyfOcBm2XumCBUUrC0n5btiSbTVt';
var authorizeUrl = 'https://oauth.groupme.com/oauth/authorize?client_id=' + clientId;
var apiEndpoint = 'https://api.groupme.com/v3'

router.get('/', function(req, res) {
	return res.redirect(authorizeUrl);
});


router.get('/authorize', function(req, res) {
  if (req.session.groupme_token) {
    return res.redirect(base + 'main');
  } else {
    return res.redirect(authorizeUrl);
  }
});

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

router.get('/groups', function(req, res) {
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
   /* req.db.collection('groups').insert({
      : ''
    }, function(err, result) {
      req.session.message = 'Sent $ successfully!';
    });  */
    return res.json(sendData); 
  }); 
});

function createMessageJSON(message) {
  var uuid = nodeUuid.v1();
  var json = {"message":{"source_guid": uuid,"text":message}};
  return JSON.stringify(json);

}
router.post('/send', function(req, res) {
  var message = req.body.message;
  var group_id = req.body.group_id;
  request.post({
    url: apiEndpoint + '/groups/' + group_id  + '/messages?token=' + req.session.groupme_token,
    headers: {
        'Content-Type': 'application/json'
    },
    body: createMessageJSON(message)
  }, function(err, response, body) {});
  return res.json(null); 
});

router.get('/messages', function(req, res) {
  var group_id = req.query.group_id;
  //var last_message = req.body.last_message;
  console.log(group_id);
  request.get({
    url: apiEndpoint + '/groups/' + group_id  + '/messages?token=' + req.session.groupme_token + "&limit=100",
  }, function(err, response, body) {
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
      sendData.push({'name' : curr.name, 'text': text, 'pic': curr.avatar_url,
       'like_count': (curr.favorited_by).length, 'image': image, 'id': curr.id});
    }  
    return res.json(sendData); 
  });
});

router.get('/moremessages', function(req, res) {
  var group_id = req.query.group_id;
  var last_message = req.query.last_message;
  request.get({
    url: apiEndpoint + '/groups/' + group_id  + '/messages?token=' + req.session.groupme_token + "&before_id=" + last_message + "&limit=100",
  }, function(err, response, body) {
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
      sendData.push({'name' : curr.name, 'text': text, 'pic': curr.avatar_url,
       'like_count': (curr.favorited_by).length, 'image': image, 'id': curr.id});
    }  
    return res.json(sendData); 
  });
});

module.exports = router;

