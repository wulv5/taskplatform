const express = require('express'),
  router = express.Router(),
  sql = require('../module/sql');

router.use(function (req, res, next) {
  if (!req.session.login || req.session.userdata.level < 10 || !req.session.userdata.used) {
    res.redirect('/');
    return
  }
  next()
});

router.get('/', function (req, res) {
  res.redirect('/admin/addtask');
});

router.get('/userall', function (req, res) {
  res.render('admin/userall')
}).post('/queryuserall', sql.admin.queryuserall)
  .post('/resetuserused', sql.admin.resetuserused)
  .post('/deluser', sql.admin.deluser)
  .post('/reuserlevel', sql.admin.reuserlevel);

router.get('/resetpassword', function (req, res) {
  res.render('admin/resetpassword')
}).post('/resetpassword', sql.admin.resetpassword);

router.get('/taskall', function (req, res) {
  res.render('admin/taskall.ejs')
});

router.get('/addtask', function (req, res) {
  res.render('admin/addtask.ejs')
}).post('/addtask', sql.admin.addtask)
  .post('/deltask', sql.admin.deltask);

module.exports = router;