/**
 * The gulp-cmd plugin for embedding style text in JavaScript code
 */

'use strict';

// doc and head
var doc = document;
var head = doc.getElementsByTagName('head')[0] || doc.documentElement;

/**
 * is string
 * @param value
 * @returns {boolean}
 */
function isString(value) {
  return {}.toString.call(value) === "[object String]";
}

/**
 * create a style node
 * @returns {HTMLStyleElement}
 */
function createStyle() {
  var node = doc.createElement('style');

  // set type
  node.type = 'text/css';

  // ie
  if (node.styleSheet !== undefined) {
    // http://support.microsoft.com/kb/262161
    if (doc.getElementsByTagName('style').length > 31) {
      throw new Error('Exceed the maximal count of style tags in IE');
    }
  }

  // adds to dom first to avoid the css hack invalid
  head.appendChild(node);

  return node;
}

// declare variable
var cssNode;
var linkNode;
var cssCache = '';
var linkCache = '';

/**
 * insert style
 * @param node
 * @param css
 */
function insertStyle(node, css) {
  // ie
  if (node.styleSheet !== undefined) {
    node.styleSheet.cssText = css;
  }
  // w3c
  else {
    css = doc.createTextNode(css);

    // insert text node
    if (node.firstChild) {
      node.replaceChild(css, node.firstChild);
    } else {
      node.appendChild(css);
    }
  }
}

/**
 * insert css text
 * @param css
 */
function css(css) {
  if (css && isString(css)) {
    // cache css
    cssCache += css;

    // create style node
    if (!cssNode) {
      cssNode = createStyle();
    }

    // insert css
    insertStyle(cssNode, cssCache);
  }
}

/**
 * insert import url
 * @param link
 */
function link(link) {
  if (link && isString(link)) {
    // cache css
    linkCache += link;

    // create style node
    if (!linkNode) {
      linkNode = createStyle();
    }

    // insert css
    insertStyle(linkNode, linkCache);
  }
}

// exports
module.exports.css = css;
module.exports.link = link;
