var express = require('express');
var router = express.Router();

var ObjectID = require('mongodb').ObjectID;

router.get('/', function(req, res) {
  req.db.collection('notes').find().toArray(function(err, notes) {
    return res.render('index', {
      title: 'Codename: KND',
      notes: notes
    });
  });
});

router.get('/main/', function(req, res) {
  return res.render('main');
});

router.get('/db', function(req, res) {
  req.db.collection('test').find().toArray(function(err, items) {
    return res.send(items);
  });
});

router.get('/:id', function(req, res) {
  req.db.collection('notes').findOne({_id: ObjectID(req.params.id)}, function(err, note) {
    if (err || !note) {
      req.session.message = 'That note does not exist!';
      return res.redirect('/');
    }

    return res.render('note', {
      note: note
    })
  });
});

router.post('/create', function(req, res) {
  if (!(req.body.title && req.body.body)) {
    req.session.message = 'You must provide a title and a body!';
    return res.redirect('/');
  }

  req.db.collection('notes').insert({
    title: req.body.title,
    body: req.body.body
  }, function(err, result) {
    req.session.message = 'Note created!';
    return res.redirect('/');
  });
});


module.exports = router;
