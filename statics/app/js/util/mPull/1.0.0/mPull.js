/**
 * Created by Administrator on 2017/1/6.
 */
var IScroll = require('iscroll');
var display = {
  refresh: function (el){
    // 到达临界距离之前显示上拉刷新
    el.querySelector('.pullDownLabel').innerText = "下拉刷新";
  },
  refreshable: function (el){
    // 到达临界距离之后，显示松手开始刷新
    el.querySelector('.pullDownLabel').innerText = "松手开始刷新";
  },
  refreshing: function (el){
    // 正在加载数据时，显示刷新中...
    el.querySelector('.pullDownLabel').innerText = '';
    el.querySelector('.loader').style.display = 'block';
  },
  refreshed: function (el){
    // 数据加载完成后，显示刷新完成，遂即隐藏
    el.querySelector('.loader').style.display = 'none';
    el.querySelector('.pullDownLabel').innerText = "刷新完成";
  },
  load: function (el){
    // 到达临界距离之前显示下拉加载
    el.querySelector('.pullUpLabel').innerText = "上拉加载";
  },
  loadable: function (el){
    // 到达临界距离之后，显示松手开始加载
    el.querySelector('.pullUpLabel').innerText = "松手开始加载";
  },
  loading: function (el){
    // 正在加载数据时，显示加载中...
    el.querySelector('.pullUpLabel').innerText = '';
    el.querySelector('.loader').style.display = 'block';
  },
  loaded: function (el){
    // 数据加载完成后，显示加载完成，遂即隐藏
    el.querySelector('.loader').style.display = 'none';
    el.querySelector('.pullUpLabel').innerText = "加载完成";
  }
};


var action = {
  prvePage: function (el){
    var data = getData(); // 获取数据
    el.innerHTML = data + el.innerHTML; // 插入数据
  },
  nextPage: function (el){
    var data = getData(); // 获取数据
    el.innerHTML += data; // 插入数据
  },
  load: function (el){
    var data = getData(); // 获取数据
    el.innerHTML += data; // 插入数据
  }
};

var getData = function (){
  var li = "<li class='ui-list-item'>Pretty row </li><li class='ui-list-item'>Pretty row </li><li class='ui-list-item'>Pretty row </li><li class='ui-list-item'>Pretty row </li>";
  return li;
};

function Pull(options){
  var that = this;
  this.id = options.id;
  this.content = options.content;
  this.option = {
    pull_up: true,
    //是否显示上拉
    pull_down: false,
    //是否显示下拉
    is_loading: false,
    // 是否正在加载 即上拉后正在加载
    is_refresh: false,
    //是否正在下拉刷新
    pull_distance: 50,
    //拉动距离 即达到出发加载或刷新的临界值
    pull_element_height: 50,
    //上拉 下拉显示标签的高度  也是iscroll回弹后定位的高度
    pull_element_maxHeight: 80
    // 上拉 下拉显示标签的最大高度
  };
  if (options.option) {
    for (var key in this.option) {
      if (options.option[key]) {
        this.option[key] = options.option[key];
      }
    }
  }

  complementWrapper(this);
  this.wrapper = document.getElementById(this.id);

  this.pullUpEl = document.querySelector('.pullUp');
  this.pullDownEl = document.querySelector('.pullDown');


  //根据设置 隐藏上拉下拉标签
  if (!that.option.pull_up)
    this.pullUpEl.style.display = 'none';
  if (!that.option.pull_down)
    this.pullDownEl.style.display = 'none';

}

module.exports = Pull;

Pull.prototype = {
  iscroll: function (){
    var that = this;

    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

    var myScroll = new IScroll(that.wrapper, {probeType: 2});

    myScroll.on('scroll', function (){
      console.log(this.y);
      //计算拉动的距离 处理为正数是下拉 负数是上拉
      var posY = this.maxScrollY - this.y;
      // 考虑到滚动内容不满容器的情况
      this.moved_distance = this.maxScrollY >= 0 ? this.distY: (posY >= 0 ? -posY : 0);

      var maxHeight = that.option.pull_element_maxHeight;
      this.y = Math.abs(this.moved_distance) > maxHeight ? maxHeight : this.y;
      //回弹距离0 默认是到初始位置
      this.minScrollY = 0;
      switch (true) {
        //大于0 为下拉刷新 :0 - 刷新的临界值
        case this.moved_distance > 0 && this.moved_distance < that.option.pull_distance:
          this.y = Math.abs(this.moved_distance) > maxHeight ? maxHeight : this.moved_distance;
          display.refresh(that.pullDownEl);
          break;
        //大于0 为下拉刷新 :刷新的临界值以上 出发刷新
        case this.moved_distance > that.option.pull_distance:
          this.y = Math.abs(this.moved_distance) > maxHeight ? maxHeight : this.moved_distance;
          display.refreshable(that.pullDownEl);
          //启用下拉刷新 并且不是上拉加载正在加载的情况下才控制回弹高度
          if (that.option.pull_down && !that.option.is_loading)
            this.minScrollY = that.option.pull_element_height;
          break;
        //小于0 上拉加载: 0 - 负数 的刷新临界值
        case this.moved_distance < 0 && this.moved_distance > -that.option.pull_distance:
          display.load(that.pullUpEl);
          break;
        //小于0 上拉加载: 负数 的刷新临界值以下 触发加载
        case this.moved_distance < -that.option.pull_distance:
          if (this.maxScrollY !== 0 ) {
            this.y = Math.abs(this.moved_distance) > maxHeight ? (this.maxScrollY - maxHeight) : (this.maxScrollY + this.moved_distance);
          }
          display.loadable(that.pullUpEl);
          //启用的上拉加载  并且不是正在刷新 才控制回弹高度
          if (that.option.pull_up && !that.option.is_refresh)
            this.minScrollY = (this.maxScrollY >= 0) ? 0 : that.option.pull_element_height;
          break;
      }
      if(!that.option.pull_down && this.maxScrollY >= 0) {
        this.minScrollY = 0;
        this.y = 0;
      }
    });
    //滑动结束的处理
    myScroll.on('scrollEnd', function (e){
      //没有正在刷新且没有正在加载 才触发 刷新和加载的处理
      var context = this;
      if (!that.option.is_loading && !that.option.is_refresh) {
        //判断临界值
        if (this.moved_distance > that.option.pull_distance) {
          display.refreshing(that.pullDownEl);
          that.option.is_refresh = true;
          //用一个计时器模拟了加载数据时间
          var t1 = setTimeout(function (){
            clearTimeout(t1);
            display.refreshed(that.pullDownEl);
            t1 = setTimeout(function (){
              clearTimeout(t1);
              myScroll.refresh();
              context.y = 0;
              that.option.is_refresh = false;
            }, 500);
          }, 2000);
        }
        if (this.moved_distance < -that.option.pull_distance) {
          display.loading(that.pullUpEl);
          that.option.is_loading = true;
          //用一个计时器模拟了加载数据时间
          var t2 = setTimeout(function (){
            clearTimeout(t2);
            action.load(that.wrapper.querySelector(that.content));
            display.loaded(that.pullUpEl);
            t2 = setTimeout(function (){
              clearTimeout(t2);
              that.option.is_loading = false;
              myScroll.refresh();
              context.y = context.maxScrollY;
              context.scrollTo(0, context.y, 200, context.options.bounceEasing);
              console.log(context.y);
            }, 500);
          }, 2000);
        }
      }
    });
  }
};

var complementWrapper = function (parameter){
  // 给容器添加scroller、pullDown和pullUp
  var wrapper = document.getElementById(parameter.id);
  var div = document.createElement('div');

  div.className = 'scroller';

  wrapper.appendChild(div);

  var scroller = wrapper.querySelector('.scroller');
  var list = wrapper.querySelector('#' + parameter.id + ' ' + parameter.content);

  scroller.insertBefore(list, scroller.childNodes[0]);

  // 创建下拉控件
  var pullDown = document.createElement('div');

  pullDown.className = 'pullDown';

  var loader = document.createElement('div');

  loader.className = 'loader';

  for (var i = 0; i < 4; i++) {
    var span = document.createElement('span');

    loader.appendChild(span);
  }

  pullDown.appendChild(loader);

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
};
