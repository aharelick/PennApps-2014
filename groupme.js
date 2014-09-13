var request = require('request');
var express = require('express');
var router = express.Router();



var clientId = 0; // FILL ME IN FROM YOUR ACCOUNT
var clientSecret = 'FILL ME IN FROM YOUR ACCOUNT';
var authorizeUrl = 'https://api.venmo.com/v1/oauth/authorize?client_id=' + clientId + '&scope=make_payments%20access_profile&response_type=code';
var accessTokenUrl = 'https://api.venmo.com/v1/oauth/access_token';
var paymentUrl = 'https://api.venmo.com/v1/payments';