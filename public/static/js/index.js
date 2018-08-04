layui.use(['element', 'table', 'layer', 'util'], function () {
  const table = layui.table,
    layer = layui.layer,
    util = layui.util,
    $ = layui.$;

  const active = {
    all: function () {
      table.reload('parse-table-demo', {
        url: '/admin/querytaskall'
      });
    },
    not: function () {
      table.reload('parse-table-demo', {
        url: '/admin/querytasknot'
      });
    },
    received: function () {
      table.reload('parse-table-demo', {
        url: '/admin/querytaskreceived'
      });
    },
    havePublished: function () {
      table.reload('parse-table-demo', {
        url: '/query/havePublished'
      });
    },
    publishUnderway: function () {
      table.reload('parse-table-demo', {
        url: '/query/publishUnderway'
      });
    },
    finished: function () {
      table.reload('parse-table-demo', {
        url: '/query/finished'
      });
    }
  };

  $('#buts .layui-btn').on('click', function(){
    var othis = $(this), method = othis.data('method');
    active[method] ? active[method].call(this, othis) : '';
  });

  table.on('tool(parse-table-demo)', function (obj) {
    const data = obj.data;
    if (obj.event === 'show') {
      location.href = '/task/' + data._id
    }
  });

  table.render({
    elem: '#parse-table-demo'
    , url: '/admin/querytaskall'
    , method: 'post'
    , page: true
    , limit: 20
    , loading: true
    , skin: 'line'
    , cols: [[
      {
        field: 'publishName', title: '发布人', width: 115, align: 'center', templet: function (d) {
          // console.log(d);
          return d.publishName.username
        }
      }
      , {field: 'publishTitle', title: '主题', align: 'center'}
      /*, {
        field: 'publishTime', title: '发布时间', width: 160, align: 'center', sort: true, templet: function (d) {
          return layui.util.toDateString(d.publishTime)
        }
      }*/
      , {field: 'publishFinishTime', title: '截止日期', width: 160, align: 'center', sort: true, templet: function (d) {
          return d.publishFinishTime
        }}
      ,{field: 'finished', title: '是否完成', width: 100, align: 'center', sort: true, templet: function (d) {
          if(d.finished) {
            return '<span style="color: red">已完成</span>'
          } else if (d.receiveName.length > 0) {
            return '正在进行中'
          }
          return ''
        }}
      , {
        field: 'receiveName', title: '已接取人数',  width: 115, align: 'center', templet: function (d) {
          return d.receiveName.length
        }
      }
      ,{
        field: 'receiveNum', title: '最高接取人数', width: 115, align: 'center', templet: function (d) {
          return d.receiveNum
        }
      }
      /*, {
        field: 'receiveTime', title: '奖励', align: 'center', templet: function (d) {
          return d.finishBonus || ''
        }
      }*/
      // ,{field: 'published', title: '是否发布', width: 90, align: 'center'}
      // , {field: 'publishHard', title: '难度', width: 64, sort: true, align: 'center'}
      , {float: 'right', width: 90, toolbar: '#barDemo', align: 'center'}
    ]]
  })
});