var request = require('request');
var express = require('express');
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
  }); 
    return res.json(sendData); 
});

router.get

module.exports = router;

