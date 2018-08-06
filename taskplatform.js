const express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  session = require('express-session'),
  MongoStore  = require("connect-mongo")(session),
  path = require('path'),
  conf = require('./conf');
  app = express();

mongoose.connect(conf.dburl, { useNewUrlParser: true });

mongoose.connection.on('error', e => console.log('连接数据库失败'));
mongoose.connection.once('open', e => console.log('连接数据库成功'));
app.use(session({
  secret: 'emmmm emmmm',
  rolling: true,
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: false},
  store: new MongoStore({
    url: conf.sessiondburl
  })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/layui', express.static(path.join(__dirname, 'public/layui'), {maxAge: 1000*60*60*24*7}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

app.use(require('./router/outapi'));
app.use('/', require('./router/index'));
app.use('/admin', require('./router/admin'));

app.listen(235,function () {
  console.log('http://localhost:235')
});
