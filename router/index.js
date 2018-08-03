const express = require('express'),
  router = express.Router(),
  util = require('../module/util');
  sql = require('../module/sql');

router.get('/', function (req, res) {
  res.render('index', {login: req.session.login, userdata: req.session.userdata})
});

router.get('/reg', function (req, res) {
  res.render('reg')
}).post('/reg', sql.reg);

router.get('/login', function (req, res) {
  req.session.login && (res.redirect('/'), 1) ||
  res.render('login');
}).post('/login', sql.login);

router.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

router.get('/task/:id', function (req, res) {
  res.render('details', {login: req.session.login, userdata: req.session.userdata})
}).post('/task/:id', sql.querytaskbyid);

module.exports = router;