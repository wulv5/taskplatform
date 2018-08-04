layui.use(['element', 'laytpl', 'layer', 'util', 'rate', 'laydate', 'layedit', 'form'], function () {
  const laytpl = layui.laytpl,
    layer = layui.layer,
    util = layui.util,
    rate = layui.rate,
    laydate = layui.laydate,
    layedit = layui.layedit,
    form = layui.form,
    $ = layui.$;
  const active = {
    receive: function (othis, id) {
      $.ajax({
        url: '/task/receive',
        method: 'post',
        data: {
          id: id
        },
        success: function (res) {
          layer.alert(res.data, function (index) {
            res.code === 0 && (location.href = location.pathname);
            layer.close(index)
          })
        }
      })
    },
  };
  $.ajax({
    url: location.pathname,
    method: 'post',
    success: function (res) {
      // console.log(res);
      // const published = res.published && res.published.find(function (val) { return val === res.data._id });
      const finishedMsg = res.data.receiveName.length > 0 && res.data.receiveName.find(function (val) { return val.userinfo._id === res.userdata });
      // console.log(finishedMsg);
      const data = {
        login: res.login,
        userdata: res.userdata,
        published: finishedMsg,
        finishedMsg: finishedMsg || {finished: true},
        list: res.data
      };
      const getTpl = details.innerHTML
        , view = document.getElementById('view');
      laytpl(getTpl).render(data, function(html){
        view.innerHTML = html;
        rate.render({
          elem: '#publishHard'
          ,readonly: true
          ,value: res.data.publishHard
        });
        $('.layui-btn').on('click', function(){
          var othis = $(this), method = othis.data('method');
          active[method] ? active[method].call(this, othis, res.data._id) : '';
        });
        let thisTimer, setCountdown = function(){
          let end = new Date(util.toDateString(res.data.publishTime))
            ,endTime = new Date(end.setDate(end.getDate() + res.data.publishFinishTime))
            ,serverTime = new Date();
          clearTimeout(thisTimer);
          util.countdown(endTime, serverTime, function(date, serverTime, timer){
            let str = date[0] + '天' + date[1] + '时' +  date[2] + '分' + date[3] + '秒';
            lay('#time').html('剩余时间: '+ str);
            thisTimer = timer;
          });
        };
        setCountdown();
        const editindex = {};
        res.data.receiveName.forEach(function (val, index) {
          editindex[index]= layedit.build('LAY_demo' + index, {
            uploadImage: {url: '/admin/addtask/upload', type: 'post'}
          });
        });
        const finish_edit = layedit.build('finish_edit', {
          uploadImage: {url: '/admin/addtask/upload', type: 'post'}
        });
        form.on('submit(formDemo)', function (data) {
          layer.open({
            content: '确认无误吗?',
            icon: 3,
            title:'请确认'
            ,btn: ['取消', '确认无误']
            ,yes: function(index){
              layer.close(index);
            },
            btn2: function (index) {
              layer.close(index);
              layui.$.ajax({
                url: '/task/finishEvaluate',
                method: 'post',
                data: {
                  detail_id: res.data._id,
                  user_id: data.field._id,
                  finishEvaluate: layedit.getContent(editindex[data.field.num])
                },
                success: function (res) {
                  layer.alert(res.data, function (index) {
                    res.code === 0 && (location.href = location.pathname);
                    layer.close(index)
                  });
                }
              });
            }
          });
          return false;
        });
        form.on('submit(finishForm)', function (data) {
          layer.open({
            content: '确认无误吗?',
            icon: 3,
            title:'请确认'
            ,btn: ['取消', '确认无误']
            ,yes: function(index){
              layer.close(index);
            },
            btn2: function (index) {
              layer.close(index);
              layui.$.ajax({
                url: '/task/finished',
                method: 'post',
                data: {
                  id: res.data._id,
                  finishedMsg: layedit.getContent(finish_edit)
                },
                success: function (res) {
                  layer.alert(res.data, function (index) {
                    res.code === 0 && (location.href = location.pathname);
                    layer.close(index);
                  });
                }
              });
            }
          });
          return false;
        });
        layer.photos({
          photos: '#layer-photos-demo'
          ,anim: 5
        });
      });
    }
  })



});