/**
 * Created by Administrator on 2016/12/20.
 */
var $ = require('jquery');
var Template = require('template');
var htmlInner = $('body').html();
// console.log(Template.escapeHTML(htmlInner));
var data = {
  labelledby: 'dialog-title',
  title: {
    title: 'haha',
    value: 'Talk'
  },
  controls: [{
    className: 'control',
    title: 'control\'s title',
    value: 'there is a controller',
    autofocus: 'autofocus'
  }],
  buttons: [{
    className: 'button',
    title: 'button\'s title',
    value: 'sure',
    autofocus: 'autofocus'
  }],
  describedby: 'describe',
  width: '',
  height: ''
};
var html = Template.template(htmlInner, data);
