var request = require('request');
var express = require('express');
var router = express.Router();

var clientId = 'SsOMWhuXnXPHdrOjD67FMyfOcBm2XumCBUUrC0n5btiSbTVt';
var clientSecret = 'FILL ME IN FROM YOUR ACCOUNT';
var authorizeUrl = 'https://oauth.groupme.com/oauth/authorize?clientId=' + clientId;
var accessTokenUrl = 'https://oauth.groupme.com/v1/oauth/access_token';
var paymentUrl = 'https://api.venmo.com/v1/payments';

router.get('/', function(req, res) {
	return res.redirect(authorizeUrl);
});


router.get('/authorize', function(req, res) {
  return res.redirect(authorizeUrl);
});

router.get('/oauth', function(req, res) {
  if (!req.query.code) {
    return res.send('no code provided');
  }

  request.post({
    url: accessTokenUrl,
    form: {
      client_id: clientId,
      client_secret: clientSecret,
      code: req.query.code
    }
  }, function(err, response, body) {
    req.session.venmo = JSON.parse(body);
    req.session.message = 'Authenticated GroupMe successfully!';
    return res.redirect('https://www.google.com');
  });
});

module.exports = router;

