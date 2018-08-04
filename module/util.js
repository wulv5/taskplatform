const crypto = require('crypto'),
  multer = require('multer'),
  path = require('path'),
  verifypassword = function (pass) {
    const md5 = crypto.createHmac('sha512', 'ojbspbbk');
    return md5.update(pass).digest('hex');
  },
  storage = multer.diskStorage({
    destination: path.join(process.cwd(), 'public/layui/upload'),
    filename: function (req, file, callback) {
      let filename = (file.originalname).split(".");
      callback(null, `${Date.now()}.${filename[filename.length - 1]}`)
    }
  }),
  fileFilter = function (req, file, cb) {
    // 当设置这个判断后  没允许的 && 没设置的类型 拒绝
    if (file.mimetype === 'image/gif') {
      cb(null, true)
    } else {
      req.upload = '123';
      cb(null, false)
    }
  },
  uploadconf = multer({
    storage: storage,
    /*limits: {
      // 限制上传文件的大小
    },*/
    // fileFilter:fileFilter
  }),
  upload = function(req, res) {
    uploadconf.single('file')(req, res, (err) => {
      err && res.send({code: 1, msg: '上传失败'}) ||
      res.send({
        code: 0, data: {
          src: `/layui/upload/${req.file.filename}`,
          title: req.file.filename // 可选
        }
      })
    });
  },
  checklogin = function (req, res, next) {
    if (!req.session.login) {
      res.send({code: 1, data: '请先登录'});
      return
    }
    next()
  },
  checkused = function(req, res, next) {
    if (!req.session.userdata.used) {
      res.send({code: 1, data: '请联系管理员激活帐户'});
      return
    }
    next()
  };

module.exports = {
  verifypassword,
  upload,
  checklogin,
  checkused
};