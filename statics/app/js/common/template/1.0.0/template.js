/**
 * Created by Administrator on 2016/12/23.
 */

  // HTML 转码映射表
var HTML_ESCAPE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\x22': '&#x22;',
    '\x27': '&#x27;'
  };

// 分行正则
var NEW_LINE = /\n|\r\n/g;

// 去空格正则
var SPACE_CLEAR = /^\s*|\s*$/g;

var obj = {
  startTag: '<%',
  endTag: '%>'
};

/**
 * 实体化html标签符号
 *
 * @param html
 * @returns {string}
 */
function escapeHTML (html){
  return String(html).replace(/[&<>\'\"]/g, function (char){
    return HTML_ESCAPE_MAP[char];
  });
}

exports.template = function (view, data){
  // 初始化行数
  var line = 1;
  // 利用当前时间定位this
  var context = '__CONTEXT' + Date.now() + '__';
  // 解析模板 将其转化为字符串
  var code = 'try {\n' +
      'var ' + context + '= this;\n' +
      context + ".output += '" +
      view.replace(/<%/g, '\x11')
        .replace(/%>/g, '\x13')
        .replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27')
        .replace(SPACE_CLEAR, '')
        // 拆行
        .replace(NEW_LINE, function() {
          return "';\n" + context + ".line = " + (++line) + ";\n" + context + ".output += '\\n";
        })
        // 非转码输出
        .replace(/\x11==\s*(.+?)\s*\x13/g, "' + ($1) + '")
        // 转码输出
        .replace(/\x11=\s*(.+?)\s*\x13/g, "' + " + context + ".escapeHTML($1) + '")
        // 静态属性读取逻辑处理
        .replace(/(^|[^\w\u00c0-\uFFFF_])@(?=\w)/g, '$1' + context + '.data.')
        // 动态属性读取逻辑处理
        .replace(/(^|[^\w\u00c0-\uFFFF_])@(?=\[)/g, '$1' + context + '.data')
        // 抽取模板逻辑
        .replace(/\x11\s*(.+?)\s*\x13/g, "';\n$1\n" + context + ".output += '") +
    // 输出结果
    "';\n\nreturn " + context + ".output;\n} catch (e) {\n" +
    // 异常捕获
    "throw 'TemplateError: ' + e + ' (at ' + ' line ' + " + context + ".line + ')';\n}";
  // 模板渲染引擎
  var stringify = new Function(code.replace(new RegExp("\n" + context + "\.output \+= '';\n", 'g'), '\n'));
  console.log(stringify);
  /**
   * render
   *
   * @param {Object|Array} data
   * @returns {String}
   */
  function render(data) {
    return stringify.call({
      line: 1,
      output: '',
      data: data,
      escapeHTML: escapeHTML
    });
  }
  // 返回渲染函数或者渲染结果
  return data ? render(data) : render;

};
