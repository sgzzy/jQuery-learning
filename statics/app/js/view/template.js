/**
 * Created by Administrator on 2016/12/30.
 */
var template = require('template');
console.log(template);
var data = {
  title: '基本例子',
  isAdmin: true,
  list: ['文艺', '博客', '摄影', '电影', '民谣', '旅行', '吉他']
};
var html = template('test', data);
document.getElementById('content').innerHTML = html;
