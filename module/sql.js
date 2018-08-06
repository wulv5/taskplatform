const model = require('./schema'),
  util = require('./util');

const sql = {};
/*******************************
 *
 * emmmmm
 *
 *******************************/
sql.createuser = function(username, password, body) {
  return new Promise((next, e) => {
    model.user.findOne({username: username}, function (err, result) {
      if (err) {
        e({result: '服务器错误', err});
        return
      }
      if (result) {
        e({result: '用户已经存在', err});
        return
      }
      Promise.all([
        model.password.create({password: util.verifypassword(password)}),
        model.usertaskinfo.create({})
      ]).then((result) => {
        model.user.create({
          username: username,
          password: result[0]._id,
          workinfo: {
            department: body.department,
            jobnum: body.jobnum
          },
          usertaskinfo: result[1]._id
        }).then((user) => {
          next({result: '注册成功', user})
        }).catch((err) => {
          console.log('createuser', err);
          e({result: '服务器错误', err})
        })
      });
    });
  })
};
sql.queryuserpass = function (username) {
  return new Promise((ok, e) => {
    model.user.findOne({username: username}).populate('password').exec(function (err, result) {
      if (result) {
        ok({code: 0, result: result, err})
      } else {
        e({code: 1, result: '没有该用户', err})
      }
    })
  })
};
sql.reg = function (req, res) {
  sql.createuser(req.body.username, req.body.password, req.body).then(({result, err}) => {
    err && res.send({code: 1, data: result}) || res.send({code: 0, data: result})
  }).catch(({result, err}) => {
    res.send({code: 1, data: result, err})
  })
};
sql.login = function (req, res) {
  sql.queryuserpass(req.body.username).then(({result}) => {
    if (!result.used) {
      res.send({code: 1, data: '请联系管理员激活帐户'});
      return
    }
    if (result.password.password === util.verifypassword(req.body.password)) {
      req.session.userdata = result;
      req.session.login = true;
      res.send({code: 0, data: '登陆成功成功', result});
    } else {
      res.send({code: 1, data: '用户名或密码错误'})
    }
  }).catch(({result, err}) => {
    res.send({code: 1, err, data: result});
  });
};
sql.querytaskbyid = function (req, res) {
  model.task.findOne({_id: req.params.id}).populate('publishName receiveName.userinfo', 'username workinfo').exec(function (err, result) {
    if (req.session.login) {
      model.usertaskinfo.findOne({_id: req.session.userdata.usertaskinfo}).exec((err, result1) => {
        res.send({
          login: req.session.login,
          userdata: req.session.userdata._id,
          published: result1.publishUnderway,
          data: result
        })
      })
    } else {
      res.send({
        login: req.session.login,
        userdata: req.session.userdata,
        data: result
      })
    }
  })
};

/*******************************
*
* 查询 (全部) 所有任务/可以接取的任务/不可接取的任务
*
*******************************/
sql.querytaskall = function (req, res) {
  Promise.all([
    model.task.find().skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)).populate('publishName receiveName', 'username').sort({'_id': -1}),
    model.task.estimatedDocumentCount()
  ]).then((result) => {
    res.send({code: 0, data: result[0], count: result[1]})
  }).catch((err) => {
    res.send({code: 1, err, data: '服务器错误'});
  });
};
sql.querytasknot = function (req, res) {
  Promise.all([
    model.task.find({published: false}).skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)).populate('publishName receiveName', 'username').sort({'_id': -1}),
    model.task.find({published: false})
  ]).then((result) => {
    res.send({code: 0, data: result[0], count: result[1].length})
  }).catch((err) => {
    res.send({code: 1, err, data: '服务器错误'});
  });
};
sql.querytaskreceived = function (req, res) {
  Promise.all([
    model.task.find({published: true}).skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)).populate('publishName receiveName', 'username').sort({'_id': -1}),
    model.task.find({published: true})
  ]).then((result) => {
    res.send({code: 0, data: result[0], count: result[1].length})
  }).catch((err) => {
    res.send({code: 1, err, data: '服务器错误'});
  });
};

/*******************************
*
* 查询 (自己) 已发布/正在进行/已完成任务
*
*******************************/
sql.queryhavePublished = function (req, res) {
  let id = req.body._id || req.session.userdata.usertaskinfo;
  model.usertaskinfo.findOne({_id: id}).populate({
    path: 'havePublished', options: {
      sort: {_id: -1},
      skip: (req.body.page - 1) * req.body.limit,
      limit: Number(req.body.limit)
    },
    populate: {
      path: 'publishName receiveName',
      select: 'username'
    }
  }).then((result) => {
    res.send({code: 0, data: result.havePublished, count: result.populated('havePublished').length});
  }).catch((err) => {
    res.send({code: 1, err, data: '服务器错误'});
  });
};
sql.querypublishUnderway = function (req, res) {
  let id = req.body._id || req.session.userdata.usertaskinfo;
  model.usertaskinfo.findOne({_id: id}).populate({
    path: 'publishUnderway', options: {
      sort: {_id: -1},
      skip: (req.body.page - 1) * req.body.limit,
      limit: Number(req.body.limit)
    },
    populate: {
      path: 'publishName receiveName',
      select: 'username'
    }
  }).then((result) => {
    res.send({code: 0, data: result.publishUnderway, count: result.populated('publishUnderway').length});
  }).catch((err) => {
    res.send({code: 1, err, data: '服务器错误'});
  });
};
sql.queryfinished = function (req, res) {
  let id = req.body._id || req.session.userdata.usertaskinfo;
  model.usertaskinfo.findOne({_id: id}).populate({
    path: 'finished', options: {
      sort: {_id: -1},
      skip: (req.body.page - 1) * req.body.limit,
      limit: Number(req.body.limit),
      count: true
    },
    populate: {
      path: 'publishName receiveName',
      select: 'username'
    }
  }).then((result) => {
    res.send({code: 0, data: result.finished, count: result.populated('finished').length});
  }).catch((err) => {
    res.send({code: 1, err, data: '服务器错误'});
  });
};

/*******************************
*
* 接取任务/完成任务/任务评价
*
********************************/
sql.taskreceive = function (req, res) {
  model.task.findOne({_id: req.body.id}, function (err, result) {
    if (err) {
      res.send({code: 1, data: '服务器错误'});
      return
    }
    if (result.receiveName.length >= result.receiveNum) {
      res.send({code: 1, data: '接取人数已满'});
      return
    }
    if (result.finished) {
      res.send({code: 1, data: '任务已经完成,不能接取已经完成的任务'});
      return
    }
    let finishedMsg = result.receiveName.findIndex(function (val) {
      return String(val.userinfo) === req.session.userdata._id
    });
    if (!(finishedMsg === -1)) {
      res.send({code: 1, data: '不能重复接取'});
      return
    }
    model.usertaskinfo.findOne({_id: req.session.userdata.usertaskinfo}, function (err, result1) {
      let em = result1.havePublished.filter((val) => {
        return String(val) === req.body.id;
      }) || 1;
      if (em.length === 1) {
        res.send({code: 1, data: '不能接取自己发布的任务'});
        return
      }
      Promise.all([
        model.task.update({_id: req.body.id}, {
          $set: {receiveTime: new Date()},
          // $inc: {receiveNum: 1},
          $push: {receiveName: {userinfo: req.session.userdata._id}
          }
        }),
        model.usertaskinfo.update({_id: req.session.userdata.usertaskinfo}, {$push: {publishUnderway: req.body.id}})
      ]).then((result1) => {
        res.send({code: 0, data: '接取成功'});
      }).catch((err) => {
        console.log('taskreceive', err);
        res.send({code: 1, data: '服务器错误'});
      });
    });
  })
};
sql.taskfinished = function (req, res) {
  model.task.findOne({_id: req.body.id}, function (err, result) {
    if (err) {
      res.send({code: 1, data: '服务器错误'});
      return
    }
    let finishedMsg = result.receiveName.findIndex(function (val) {
      return String(val.userinfo) === req.session.userdata._id
    });
    if (finishedMsg === -1) {
      res.send({code: 1, data: '请先接取任务'});
      return
    }
    if (result.receiveName[finishedMsg].finished) {
      res.send({code: 1, data: '已经提交过'});
      return
    }
    Promise.all([
      model.task.update({_id: req.body.id}, {$set: {
          ['receiveName.' + finishedMsg + '.finished']: true,
          ['receiveName.' + finishedMsg + '.finishTime']: new Date(),
          ['receiveName.' + finishedMsg + '.finishedMsg']: req.body.finishedMsg
        }}),
      model.usertaskinfo.update({_id: req.session.userdata.usertaskinfo},
        {$push: {finished: req.body.id}, $pull: {publishUnderway: req.body.id}})
    ]).then(() => {
      res.send({code: 0, data: '提交成功'});
    }).catch((err) => {
      console.log('taskfinished', err);
      res.send({code: 1, data: '服务器错误'});
    });
  })
};
sql.taskfinishEvaluate = function (req, res) {
  model.task.findOne({_id: req.body.detail_id}, function (err, result) {
    if (err) {
      res.send({code: 1, data: '服务器错误'});
      return
    }
    let userMsg = result.receiveName.findIndex(function (val) {
      return String(val._id) === req.body.user_id
    });
    if (result.receiveName[userMsg].finishEvaluate) {
      res.send({code: 1, data: '已经评论'});
      return
    }
    model.usertaskinfo.findOne({_id: req.session.userdata.usertaskinfo}, function (err, result1) {
      let finishedMsg = result1.havePublished.findIndex(function (val) {
        return String(val) === req.body.detail_id
      });
      if (finishedMsg === -1) {
        res.send({code: 1, data: '似乎这不是你发布的任务'});
        return
      }
      model.task.update({_id: req.body.detail_id}, {$set: {
          // finishEvaluate: req.body.finishEvaluate,
          ['receiveName.' + userMsg + '.finishEvaluate' ]: req.body.finishEvaluate,
          finished: true,
          published: true,
          finishTime: new Date()
        }}, function (err, result) {
        err || res.send({code: 0, data: '提交成功'});
      })
    });
  })
};


/*******************************
*
* 后台api
*
********************************/
sql.admin = {};
sql.admin.queryuserall = function (req, res) {
  Promise.all([
    model.user.find().skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
    model.user.countDocuments()
  ]).then((result) => {
    res.send({code: 0, data: result[0], count: result[1]})
  }).catch(() => {
    res.send({code: 1, data: '服务器错误'})
  })
};
sql.admin.resetuserused = function(req, res) {
  model.user.update({_id: req.body.user_id}, {$set: {used: req.body.used}}).then((result) => {
    res.send({
      code: 0,
      data: '修改成功'
    })
  }).catch((err) => {
    res.send({
      code: 1,
      data: '修改失败',
      err: err
    })
  })
};
sql.admin.deluser = function (req, res) {
  model.user.findOne({_id: req.body.id}, function (err, result) {
    if (err) {
      res.send({code: 1, err, data: '服务器错误'});
      return
    }
    if (req.body.id === req.session.userdata._id) {
      res.send({code: 1, data: '不能删除自己'});
      return
    }
    if (result.level >= 999) {
      res.send({code: 1, data: '不能删除最高权限账号'});
      return
    }
    if (req.session.userdata.level < 999 && result.level >= 10) {
      res.send({code: 1, data: '不能删除管理员账号'});
      return
    }
    Promise.all([
      model.user.remove({_id: req.body.id}),
      model.usertaskinfo.remove({_id: result.usertaskinfo}),
      model.password.remove({_id: result.password}),
      model.task.update({'receiveName.userinfo': req.body.id},
        {$pull: {'receiveName': {userinfo: req.body.id}}}, {multi: true}),
      model.task.remove({publishName: req.body.id})
    ]).then(() => {
      res.send({code: 0, data: '删除成功'});
    }).catch((err) => {
      console.log('deluser', err);
      res.send({code: 1, data: '服务器错误'});
    })
  });
};
sql.admin.reuserlevel = function (req, res) {
  if (!req.body.id) {
    res.send({code: 1, data: '参数错误'})
  }
  if (req.body.level > 10) {
    res.send({code: 1, data: '参数错误'})
  }
  if (req.session.userdata.level < 999) {
    res.send({code: 1, data: '请用最高权限账号更改'});
    return
  }
  model.user.findOne({_id: req.body.id}, function (err, result) {
    if (result.level >= 999) {
      res.send({code: 1, data: '不能更改最高权限账号'});
      return
    }
    model.user.update({_id: req.body.id}, {$set: {level: req.body.level}}, function (err, result) {
      if (err) {
        res.send({code: 1, err, data: '服务器错误'});
        return
      }
      res.send({code: 0, err, data: '修改成功'})
    });
  });
};
sql.admin.resetpassword = function (req, res) {
  model.user.findOne({username: req.body.username}, function (err, result) {
    if (err) {
      res.send({code: 1, err, data: '服务器错误'});
      return
    }
    if (!result) {
      res.send({code: 1, err, data: '没有该用户'});
      return
    }
    model.password.update({_id: result.password},
      {$set: {password: util.verifypassword(req.body.password)}}, function (err, result) {
        if (err) {
          res.send({code: 1, err, data: '服务器错误'});
          return
        }
        res.send({code: 0, data: '重置密码成功'})
      })
  });
};
sql.admin.addtask = function (req, res) {
  let task = req.body;
  task.publishName = req.session.userdata._id;
  model.task.create(task, function (err, result) {
    if (err) {
      res.send({code: 1, data: '服务器错误', err});
      return
    }
    model.usertaskinfo.update({_id: req.session.userdata.usertaskinfo}, {$push: {havePublished: result._id}}, function () {});
    res.send({code: 0, data: '发布成功'});
  })
};
sql.admin.deltask = function (req, res) {
  model.usertaskinfo.findOne({_id: req.session.userdata.usertaskinfo}, function (err, result) {
    if (err) {
      res.send({code: 1, err, data: '服务器错误'});
      return
    }
    let em = result.havePublished.filter((val) => {
      return String(val) === req.body.id;
    });
    if (em.length === 0 && req.session.userdata.level < 999) {
      res.send({code: 1, data: '不能删除别人的任务'});
      return
    }
    Promise.all([
      model.task.remove({_id: req.body.id}),
      model.usertaskinfo.update(
        {$or:[{havePublished: req.body.id}, {publishUnderway: req.body.id}, {finished: req.body.id}]},
        {$pull: {havePublished: req.body.id, publishUnderway: req.body.id, finished: req.body.id}},
        { multi: true })
    ]).then(() => {
      res.send({code: 0, data: '删除成功'});
    }).catch(() => {
      res.send({code: 1, data: '服务器错误'});
    });
  });
};

module.exports = sql;