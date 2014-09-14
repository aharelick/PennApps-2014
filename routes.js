var express = require('express');
var router = express.Router();

var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res) {
  req.db.collection('notes').find().toArray(function(err, notes) {
    return res.render('index', {
      title: 'GroupMe+',
      notes: notes
    });
  });
});

router.get('/main/', function(req, res) {
  return res.render('main');
});


module.exports = router;
