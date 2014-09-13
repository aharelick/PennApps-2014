var request = require('request');
var express = require('express');
var router = express.Router();

var base = "http://localhost:3000/"
var clientId = 'SsOMWhuXnXPHdrOjD67FMyfOcBm2XumCBUUrC0n5btiSbTVt';
var authorizeUrl = 'https://oauth.groupme.com/oauth/authorize?client_id=' + clientId;

router.get('/', function(req, res) {
	return res.redirect(authorizeUrl);
});


router.get('/authorize', function(req, res) {
  return res.redirect(authorizeUrl);
});

router.get('/success', function(req, res) {
  req.session.token = req.query.access_token;
  res.redirect(base + 'main');


});

module.exports = router;

