/**
 * Created by Administrator on 2016/12/30.
 */

var IScroll = require('iscroll');

function Refresher(options){
  var refresher = this;
  // 设置上拉和下拉参数
  this.option = options.option || {
      pull_down: true, // 是否支持下拉
      pull_up: true, // 是否支持上拉
      pull_distance: 50, // 拉动临界距离，即触发刷新或加载动作的临界距离
      pull_maxDistan: 80, // 拉动的最大距离
      pull_height: 50, // 控件高度，也是回弹后定位的高度
      is_refreshing: false, // 是否正在刷新
      is_loading: false // 是否正在加载
    };

  // 容器id
  this.id = options.id;
  // 初始滚动内容
  this.content  = options.content;
  // 加载数据的父级元素
  this.orderList = options.orderList;

  this.pullUpAction = options.pullUpAction;
  this.pullDownAction = options.pullDownAction;



  // 不同滚动状态下的动作
  this.loading_style = {
    // 变化的文字或者效果
    refresh_before: function (pullDown){
      // 没有刷新没有加载情况下 才变化
      if (!refresher.option.is_loading && !refresher.option.is_refreshing)
        pullDown.querySelector('.pullDownLabel').innerText = '下拉刷新';
    },
    refresh_able: function (pullDown){
      // 没有刷新没有加载情况下 才变化
      if (!refresher.option.is_loading && !refresher.option.is_refreshing)
        pullDown.querySelector('.pullDownLabel').innerText = '松手开始刷新';
    },
    refresh_start: function (pullDown, pullUp){
      pullDown.querySelector('.pullDownLabel').innerText = '';
      pullDown.querySelector('.loader').style.display = 'block';
      //正在刷新的时候隐藏上拉加载
      if (refresher.option.pull_up)
        pullUp.style.display = 'none';
    },
    refresh_end: function (pullDown, pullUp){
      pullDown.querySelector('.loader').style.display = 'none';
      pullDown.querySelector('.pullDownLabel').innerText = '刷新完成';
      //刷新完成 显示上拉加载
      if (refresher.option.pull_up)
        pullUp.style.display = '';
    },
    load_before: function (pullUp){
      //没有刷新没有加载情况下 才变化
      if (!refresher.option.is_loading && !refresher.option.is_refreshing)
        pullUp.querySelector('.pullUpLabel').innerText = '上拉加载更多';
    },
    load_able: function (pullUp){
      //没有刷新没有加载情况下 才变化
      if (!refresher.option.is_loading && !refresher.option.is_refreshing)
        pullUp.querySelector('.pullUpLabel').innerText = '松手开始加载';
    },
    load_start: function (pullUp, pullDown){
      pullUp.querySelector('.pullUpLabel').innerText = '';
      pullUp.querySelector('.loader').style.display = 'block';
      //正在加载的时候 隐藏下拉刷新
      if (refresher.option.pull_down)
        pullDown.style.display = 'none';
    },
    load_end: function (pullUp, pullDown){
      pullUp.querySelector('.loader').style.display = 'none';
      pullUp.querySelector('.pullUpLabel').innerText = '加载完成';
      //加载完成了 显示下拉刷新
      if (refresher.option.pull_down)pullDown.style.display = '';
    }
  }
}

Refresher.prototype = {
  initScroller: function (){
    var refresher = this;
    // 给容器添加scroller、pullDown和pullUp
    // 获取容器wrapper
    var wrapper = document.getElementById(refresher.id);

    // 创建scroller
    var div = document.createElement('div');
    div.className = 'scroller';
    wrapper.appendChild(div);

    var scroller = wrapper.querySelector('.scroller');
    var list = wrapper.querySelector('#' + refresher.id + ' ' + refresher.content);
    scroller.insertBefore(list, scroller.childNodes[0]);

    // 创建下拉控件
    var pullDown = document.createElement('div');
    pullDown.className = 'pullDown';
    // 创建加载控件
    var loader = document.createElement('div');
    loader.className = 'loader';
    for (var i = 0; i < 4; i++) {
      var span = document.createElement('span');
      loader.appendChild(span);
    }
    pullDown.appendChild(loader);
    // 创建下拉文字提示
    var pullDownLabel = document.createElement('div');
    pullDownLabel.className = 'pullDownLabel';
    pullDown.appendChild(pullDownLabel);
    scroller.insertBefore(pullDown, scroller.childNodes[0]);

    // 创建上拉控件
    var pullUp = document.createElement('div');
    pullUp.className = 'pullUp';

    loader = document.createElement('div');
    loader.className = 'loader';
    for (i = 0; i < 4; i++) {
      span = document.createElement('span');

      loader.appendChild(span);
    }
    pullUp.appendChild(loader);

    var pullUpLabel = document.createElement('div');
    pullUpLabel.className = 'pullUpLabel';
    pullUp.appendChild(pullUpLabel);
    scroller.appendChild(pullUp);

    refresher.pullUp = pullUp;
    refresher.pullDown = pullDown;
  },
  _init: function (){
    var refresher = this;
    refresher.initScroller();
    var iscroll = IScroll(document.getElementById(refresher.id), {

    });

    iscroll.on('scroll', function (e){
      //计算拉动的距离 处理为正数是下拉 负数是上拉
      var absY = this.maxScrollY - this.y;
      this.moved_distance = (this.maxScrollY == 0) ? this.distY : (this.y > 0 ? this.y : (absY > 0 ? -absY : 0));

      //回弹距离0 默认是到初始位置
      this.minScrollY = 0;
      switch (true) {
        //大于0 为下拉刷新 :0 - 刷新的临界值
        case this.moved_distance > 0 && this.moved_distance < refresher.option.pull_distance:
          this.y = this.moved_distance > refresher.option.pull_maxDistan ? refresher.option.pull_maxDistan : this.moved_distance;
          refresher.loading_style.refresh_before(refresher.pullDown);
          break;
        //大于0 为下拉刷新 :刷新的临界值以上 出发刷新
        case this.moved_distance > refresher.option.pull_distance:
          this.y = this.moved_distance > refresher.option.pull_maxDistan ? refresher.option.pull_maxDistan : this.moved_distance;
          refresher.loading_style.refresh_able(refresher.pullDown);
          //启用下拉刷新 并且不是上拉加载正在加载的情况下才控制回弹高度
          if (refresher.option.pull_down && !refresher.option.is_loading)
            this.minScrollY = refresher.option.pull_height;
          break;
        //小于0 上拉加载: 0 - 负数 的刷新临界值
        case this.moved_distance < 0 && this.moved_distance > -refresher.option.pull_distance:

          refresher.loading_style.load_before(refresher.pullUp);
          break;
        //小于0 上拉加载: 负数 的刷新临界值以下 触发加载
        case this.moved_distance < -refresher.option.pull_distance:
          if (this.maxScrollY !== 0 ) {
            this.y = -this.moved_distance > refresher.option.pull_maxDistan ? (this.maxScrollY - refresher.option.pull_maxDistan) : (this.maxScrollY + this.moved_distance);
          }
          refresher.loading_style.load_able(refresher.pullUp);
          //启用的上拉加载 并且不是正在刷新 才控制回弹高度
          if (refresher.option.pull_up && !refresher.option.is_refresh)

            this.minScrollY = (this.maxScrollY == 0 && this.y == 0) ? 0 : refresher.option.pull_height;
          break;
      }
    });

    iscroll.on('scrollEnd', function (e){
      //没有正在刷新且没有正在加载 才触发 刷新和加载的处理
      if (!option.is_loading && !refresher.option.is_refreshing) {
        //判断临界值
        if (this.moved_distance > refresher.option.pull_distance) {
          refresher.loading_style.refresh_start(refresher.pullDown, refresher.pullUp);
          refresher.option.is_refresh = true;
          //用一个计时器模拟了加载数据时间
          var t1 = setTimeout(function (){
            clearTimeout(t1);
            refresher.loading_style.refresh_end(refresher.pullDown, refresher.pullUp);
            t1 = setTimeout(function (){
              clearTimeout(t1);
              iscroll.refresh();
              refresher.option.is_refresh = false;
            }, 500);
          }, 2000);
        }
        if (this.moved_distance < -refresher.option.pull_distance) {
          refresher.loading_style.load_start(refresher.pullUp, refresher.pullDown);
          refresher.option.is_loading = true;
          //用一个计时器模拟了加载数据时间
          var t2 = setTimeout(function (){
            clearTimeout(t2);
            refresher.pullUpAction();
            refresher.loading_style.load_end(pullUp, pullDown);
            t2 = setTimeout(function (){
              clearTimeout(t2);
              refresher.option.is_loading = false;
              iscroll.refresh();
            }, 500);
          }, 2000);
        }
      }
    });

  },
  load: function (iscroll){
    var refresher = this;
      $.ajax({
        url: refresher.orderList.attr('data-url'),
        data: {
          page: refresher.page <= refresher.pages ? ++refresher.page : refresher.page,

          pageSize: size
        },
        success: function (result) {

          if (result.data.valid) {
            var _pages = refresher.pages;

            refresher.pages = Math.max(Math.ceil(result.data.total / size), 1);

            if (pages !== _pages) {
              if (refresher.page >= _pages && pages > _pages) {
                refresher.orderList.append(result.data.html);
              }
            } else {
              if (refresher.page <= refresher.pages) {
                refresher.orderList.append(result.data.html);
              }
            }
            refresher.load_end();
          } else {
            alert(result.msg);
          }
        },
        complete: function (){
          iscroll.refresh();
        }
      });
  }
};
