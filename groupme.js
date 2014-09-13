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
  return res.redirect(base + 'main');
});

router.get('/groups', function(req, res) {
  console.log(req.session.groupme_token);
  request.get({
    url: apiEndpoint + '/groups' + '?token=' + req.session.groupme_token
  }, function(err, response, body) {
    if (err) {
      return res.redirect('http://en.wikipedia.org/wiki/HTTP_404');
    }

    var data = (JSON.parse(body)).response;
    groups = [];
    for (var i in data) {
      groups.push({'conversationName' : data[i].name});
    }  
    console.log(groups);
    return res.render('main', {
      groups: groups
    });
    /*req.db.collection('payments').insert({
      amount: amount,
      phone: phone,
      note: note,
      recipient: recipient,
      date: Date.now()
    }, function(err, result) {
      req.session.message = 'Sent $' + amount + ' to ' + recipient + ' successfully!';
    }); */
  });
});

module.exports = router;

