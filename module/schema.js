const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true}
  ,password: {type: Schema.Types.ObjectId, required: true, ref: 'password'} //
  ,used: {type: Boolean, required: true, default: false}
  // ,email: {type: String, required: false}
  ,level: {type: Number, default: 1, required: true}
  ,workinfo: {
    department: {type: String, required: true},
    jobnum: {type: Number, required: true}
  }
  ,usertaskinfo: {type: Schema.Types.ObjectId, required: true, ref: 'usertaskinfo'}
}, {createdAt: 'created', updatedAt: 'updated'});
const passwordSchema = new Schema({
  password: {type: String, required: true}
});
const usertaskinfoSchema = new Schema({
  havePublished: {type: [ {type: Schema.Types.ObjectId, ref: 'task'} ]} // 已发布
  ,publishUnderway: {type: [ {type: Schema.Types.ObjectId, ref: 'task'} ]} // 正在进行
  ,finished: {type: [ {type: Schema.Types.ObjectId, ref: 'task'} ]} // 已完成
});
const taskSchema = new Schema({
  publishName: {type: Schema.Types.ObjectId, required: true, ref: 'user'} // 发布人
  ,publishTime: {type: String, default: new Date(), required: true} // 发布时间
  ,receiveName: {type: [{
      userinfo: {type: Schema.Types.ObjectId, required: false, ref: 'user'}
      ,finished: {type: Boolean, default: false, required: false}
      ,finishedMsg: {type: String, required: false}
      ,finishTime: {type: String, required: false} // 完成日期
      ,finishEvaluate: {type: String, required: false}
    }]} // 接取人
  ,receiveTime: {type: String, required: false} // 接取任务日期 ( 总的 )
  ,receiveNum: {type: Number, default: 0, required: false} // 接取人数
  ,publishFinishTime: {type: String, required: true} // 限时
  ,published: {type: Boolean, default: false} // 是否接取 (接取人数已满)
  ,publishTitle: {type: String, required: true} // 标题
  ,publishContent: {type: String, required: true} // 内容
  ,publishMintext: {type: String, required: false}
  ,publishHard: {type: Number, required: true} // 难度
  ,finished: {type: Boolean, default: false, required: false} // 是否完成( 总的 )
  // ,finishedMsg: {type: String, required: false} // 完成信息
  ,finishTime: {type: String, required: false} // 完成日期
  ,finishEvaluate: {type: String, required: false} // 完成评价
  ,finishBonus: {type: String, required: false} // 报酬 奖金
});


const model = {
  user: mongoose.model('user', userSchema),
  password: mongoose.model('password', passwordSchema),
  usertaskinfo: mongoose.model('usertaskinfo', usertaskinfoSchema),
  task: mongoose.model('task', taskSchema),
};

module.exports = model;
