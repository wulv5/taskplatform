const express = require('express'),
  util = require('../module/util'),
  sql = require('../module/sql'),
  router = express.Router();

router.post('/admin/addtask/upload', util.upload);

// 查询 (全部) 所有任务/可以接取的任务/不可接取的任务
router.post('/admin/querytaskall', sql.querytaskall);
router.post('/admin/querytasknot', sql.querytasknot);
router.post('/admin/querytaskreceived', sql.querytaskreceived);

// 查询 (自己) 已发布/正在进行/已完成任务
router.post('/query/havePublished', util.checklogin, util.checkused, sql.queryhavePublished);
router.post('/query/publishUnderway', util.checklogin, util.checkused, sql.querypublishUnderway);
router.post('/query/finished', util.checklogin, util.checkused, sql.queryfinished);

// 接取任务/完成任务/任务评价
router.post('/task/receive', util.checklogin, util.checkused, sql.taskreceive);
router.post('/task/finished', util.checklogin, util.checkused, sql.taskfinished);
router.post('/task/finishEvaluate', util.checklogin, util.checkused, sql.taskfinishEvaluate);

module.exports = router;