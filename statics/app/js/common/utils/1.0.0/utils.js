/**
 * Created by Administrator on 2016/12/22.
 */

var OP = Object.prototype;
var AP = Array.prototype;
var FP = Function.prototype;


// toString
var OPToString = OP.toString;
var FPToString = FP.toString;
var APTOString = AP.toString();

/**
 * 获取数据类型
 *
 * @
 * @param {any} value
 * @returns
 */
function type(value){
  return OPToString.call(value);
}

/**
 * 对象判定
 *
 * @param {any} value
 * @returns {boolean}
 */
function object(value){
  return type(value) === '[object Object]';
}

/**
 * 数组判定
 *
 * @param {any} value
 * @returns {boolean}
 */
function array(value){
  return type(value) === '[object Array]';
}

/**
 * 函数判定
 *
 * @
 * @param {any} value
 * @returns
 */
function fn(value){
  return type(value) === '[object Function]';
}

/**
 * 字符串判定
 *
 * @
 * @param {any} value
 * @returns
 */
function string(value){
  return type(value) === '[object String]';
}

/**
 * 数字判定
 *
 * @
 * @param {any} value
 * @returns
 */
function number(value){
  return type(value) === '[object Number]';
}

/**
 * NaN判定
 *
 * @param {any} value
 * @returns
 */
function nan(value){
  return number(value) && value !== value;
}

// Native function RegExp
// @see https://github.com/kgryte/regex-native-function/blob/master/lib/index.js
var NATIVE_RE = '';

// Use a native function as a template...
NATIVE_RE += FPToString.call(Function);
// Escape special RegExp characters...
NATIVE_RE = NATIVE_RE.replace(/([.*+?^=!:$(){}|[\]\/\\])/g, '\\$1');
// Replace any mentions of `Function` to make template generic.
// Replace `for ...` and additional info provided in other environments, such as Rhino (see lodash).
NATIVE_RE = NATIVE_RE.replace(/Function|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?');
// Bracket the regex:
NATIVE_RE = '^' + NATIVE_RE + '$';

// Get RegExp
NATIVE_RE = new RegExp(NATIVE_RE);

/**
 * 是否是原生方法
 *
 * @
 * @param {any} value
 * @returns
 */
function native(value){
  if (!fn(value)) {
    return false;
  }

  return NATIVE_RE.test(FPToString.toString.call(value));
}

