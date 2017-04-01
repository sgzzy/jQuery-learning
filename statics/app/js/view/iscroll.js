/**
 * Created by Administrator on 2017/1/5.
 */
var mPull = require("pull");

var options = {
  id: "wrapper",
  content: '#ui-list'
};

var pull = new mPull(options);
pull.iscroll();
