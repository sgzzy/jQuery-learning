/**
 * Created by Administrator on 2017/1/12.
 */
var extend = function (sub, supper){
  // 若传入的参数不为对象或为空，则抛出错误
  if(typeof sub != "object" || typeof supper != "object") {
    throw new TypeError("不是正规的对象");
  }
  for(var key in supper) {// 扩展sub中不存在的属性
    if(!(key in sub)) {
      sub[key] = supper[key];
    }
  }
};
