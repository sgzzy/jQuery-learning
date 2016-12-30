/**
 * Created by nuintun on 2015/5/5.
 */

'use strict';
// 开启 DEBUG 开关
process.env.DEBUG_FD = '1';
process.env.DEBUG_COLORS = 'true';
process.env.DEBUG = 'gulp-css,gulp-cmd';

var path = require('path');
var join = path.join;
var relative = path.relative;
var dirname = path.dirname;
var extname = path.extname;
var resolve = path.resolve;
var gulp = require('gulp');
var rimraf = require('del');
var css = require('gulp-css');
var cmd = require('gulp-cmd');
var colors = cmd.colors;
var pedding = require('pedding');
var cssnano = require('cssnano');
var uglify = require('uglify-js');
var chokidar = require('chokidar');
var plumber = require('gulp-plumber');
var switchStream = require('switch-stream');

// alias
var alias = {
  'import-style': 'util/import-style/1.0.0/import-style',
  'pull-refresher': 'util/pull-refresher/1.0.0/pull-refresher',
  'jquery': 'base/jquery/1.11.3/jquery',
  'utils': 'common/utils/1.0.0/utils',
  'template': 'common/template/1.0.0/template-debug',
  'iscroll': 'common/iscroll/5.2.0/iscroll'
};
// bookmark
var bookmark = Date.now();

// compress javascript file
function compress() {
  return switchStream(function(vinyl) {
    if (extname(vinyl.path) === '.js') {
      return 'js';
    }

    if (extname(vinyl.path) === '.css') {
      return 'css';
    }
  }, {
    js: switchStream.through(function(vinyl, encoding, next) {
      try {
        var result = uglify.minify(vinyl.contents.toString(), {
          fromString: true,
          compress: { screw_ie8: false },
          mangle: { screw_ie8: false },
          output: { screw_ie8: false }
        });

        vinyl.contents = new Buffer(result.code);
      } catch (error) {
        // no nothing
      }

      this.push(vinyl);
      next();
    }),
    css: switchStream.through(function(vinyl, encoding, next) {
      var context = this;

      cssnano.process(vinyl.contents.toString(), { safe: true }).then(function(result) {
        vinyl.contents = new Buffer(result.css);

        context.push(vinyl);
        next();
      });
    })
  });
}

// rewrite cmd plugins
var CMDPLUGINS = {
  css: function(vinyl, options, next) {
    var context = this;

    cssnano.process(vinyl.contents.toString(), { safe: true }).then(function(result) {
      vinyl.contents = new Buffer(result.css);

      cmd.defaults.plugins.css.exec(vinyl, options, function(vinyl) {
        try {
          var result = uglify.minify(vinyl.contents.toString(), {
            fromString: true,
            compress: { screw_ie8: false },
            mangle: { screw_ie8: false },
            output: { screw_ie8: false }
          });

          vinyl.contents = new Buffer(result.code);
        } catch (error) {
          // no nothing
        }

        context.push(vinyl);
        next();
      });
    });
  }
};

['js', 'json', 'tpl', 'html'].forEach(function(name) {
  CMDPLUGINS[name] = function(vinyl, options, next) {
    var context = this;
    // transform
    cmd.defaults.plugins[name].exec(vinyl, options, function(vinyl) {
      try {
        var result = uglify.minify(vinyl.contents.toString(), {
          fromString: true,
          compress: { screw_ie8: false },
          mangle: { screw_ie8: false },
          output: { screw_ie8: false }
        });

        vinyl.contents = new Buffer(result.code);
      } catch (error) {
        // no nothing
      }

      context.push(vinyl);
      next();
    });
  }
});

// rewrite css plugins
var CSSPLUGINS = {
  css: function(vinyl, options, next) {
    var context = this;

    cssnano.process(vinyl.contents.toString(), { safe: true }).then(function(result) {
      vinyl.contents = new Buffer(result.css);

      css.defaults.plugins.css.exec(vinyl, options, function(vinyl) {
        context.push(vinyl);
        next();
      });
    });
  }
};

// file watch
function watch(glob, options, callabck) {
  if (typeof options === 'function') {
    callabck = options;
    options = {};
  }

  // ignore initial add event
  options.ignoreInitial = true;
  // ignore permission errors
  options.ignorePermissionErrors = true;

  // get watcher
  var watcher = chokidar.watch(glob, options);
  // bing event
  if (callabck) {
    watcher.on('all', function(event, path) {
      if (path && !/___jb_tmp___$/.test(path)) {
        callabck.apply(this, arguments);
      }
    });
  }

  // return watcher
  return watcher;
}

// css resource path
function onpath(path, property, file, wwwroot) {
  if (/^[^./\\]/.test(path)) {
    path = './' + path;
  }

  if (path.indexOf('.') === 0) {
    path = join(dirname(file), path);
    path = relative(wwwroot, path);
    path = '/' + path;
    path = path.replace(/\\+/g, '/');
  }

  path = path.replace('/statics/app/', '/statics/product/');

  return path;
}

// date format
function dateFormat(date, format) {
  // 参数错误
  if (!date instanceof Date) {
    throw new TypeError('Param date must be a Date');
  }

  format = format || 'yyyy-MM-dd hh:mm:ss';

  var map = {
    'M': date.getMonth() + 1, //月份
    'd': date.getDate(), //日
    'h': date.getHours(), //小时
    'm': date.getMinutes(), //分
    's': date.getSeconds(), //秒
    'q': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds() //毫秒
  };

  format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
    var v = map[t];

    if (v !== undefined) {
      if (all.length > 1) {
        v = '0' + v;
        v = v.substr(v.length - 2);
      }

      return v;
    } else if (t === 'y') {
      return (date.getFullYear() + '').substr(4 - all.length);
    }

    return all;
  });

  return format;
}

// clean task
gulp.task('clean', function() {
  bookmark = Date.now();

  rimraf.sync('statics/product');
});

// runtime task
gulp.task('runtime', ['clean'], function() {
  // loader file
  gulp.src('statics/app/loader/**/*.js', { base: 'statics/app', nodir: true })
    .pipe(gulp.dest('statics/product'));

  // image file
  gulp.src('statics/app/images/**/*', { base: 'statics/app', nodir: true })
    .pipe(gulp.dest('statics/product'));
});

// runtime product task
gulp.task('runtime-product', ['clean'], function() {
  // loader file
  gulp.src('statics/app/loader/**/*.js', { base: 'statics/app', nodir: true })
    .pipe(compress())
    .pipe(gulp.dest('statics/product'));

  // image file
  gulp.src('statics/app/images/**/*', { base: 'statics/app', nodir: true })
    .pipe(gulp.dest('statics/product'));
});

// product task
gulp.task('product', ['runtime-product'], function() {
  // complete callback
  var complete = pedding(2, function() {
    var now = new Date();

    console.log(
      '  %s [%s] build complete... √ %s\x07',
      colors.green.bold('gulp-product'),
      dateFormat(now),
      colors.green('+' + (now - bookmark) + 'ms')
    );
  });

  // js files
  gulp.src('statics/app/js/**/*', { base: 'statics/app/js', nodir: true })
    .pipe(cmd({
      alias: alias,
      ignore: ['jquery'],
      plugins: CMDPLUGINS,
      include: function(id) {
        return id && id.indexOf('view') === 0 ? 'all' : 'self';
      },
      css: {
        onpath: onpath
      }
    }))
    .pipe(gulp.dest('statics/product/js'))
    .on('finish', complete);
  // css files
  gulp.src('statics/app/css/?(base|view)/**/*', { base: 'statics/app', nodir: true })
    .pipe(css({
      include: true,
      onpath: onpath,
      plugins: CSSPLUGINS
    }))
    .pipe(gulp.dest('statics/product'))
    .on('finish', complete);
});

// app task
gulp.task('default', ['runtime'], function() {
  // complete callback
  var complete = pedding(2, function() {
    var now = new Date();
    console.log(
      '  %s [%s] build complete... √ %s\x07',
      colors.green.bold('gulp-default'),
      dateFormat(now),
      colors.green('+' + (now - bookmark) + 'ms')
    );
  });

  // js files
  gulp.src('statics/app/js/**/*', { base: 'statics/app/js', nodir: true })
    .pipe(cmd({
      alias: alias,
      include: 'self',
      css: { onpath: onpath }
    }))
    .pipe(gulp.dest('statics/product/js'))
    .on('finish', complete);

  // css files
  gulp.src('statics/app/css/**/*', { base: 'statics/app', nodir: true })
    .pipe(css({ onpath: onpath }))
    .pipe(gulp.dest('statics/product'))
    .on('finish', complete);
});

// app watch task
gulp.task('watch', ['default'], function() {
  var base = join(process.cwd(), 'statics/app');

  // debug watcher
  function debugWatcher(event, path) {
    var now = new Date();

    console.log(
      '  %s %s: %s %s',
      colors.green.bold('gulp-watch'),
      event,
      colors.magenta(join('statics/app', path).replace(/\\/g, '/')),
      colors.green('+' + (now - bookmark) + 'ms')
    );
  }

  // complete callback
  function complete() {
    var now = new Date();

    console.log(
      '  %s [%s] build complete... √ %s\x07',
      colors.green.bold('gulp-watch'),
      dateFormat(now),
      colors.green('+' + (now - bookmark) + 'ms')
    );
  }

  // watch js files
  watch('statics/app/js', function(event, path) {
    var rpath = relative(base, path);

    bookmark = Date.now();
    event = event.toLowerCase();

    debugWatcher(event, rpath);

    if (event === 'unlink' || event === 'unlinkdir') {
      rimraf.sync(resolve('statics/product', rpath));
      complete();
    } else {
      gulp.src(path, { base: 'statics/app/js' })
        .pipe(plumber())
        .pipe(cmd({
          alias: alias,
          include: 'self',
          cache: false,
          css: { onpath: onpath }
        }))
        .pipe(gulp.dest('statics/product/js'))
        .on('finish', complete);
    }
  });

  // watch css files
  watch('statics/app/css', function(event, path) {
    var rpath = relative(base, path);

    bookmark = Date.now();
    event = event.toLowerCase();

    debugWatcher(event, rpath);

    if (event === 'unlink' || event === 'unlinkdir') {
      rimraf.sync(resolve('statics/product', relative(base, path)));
      complete();
    } else {
      gulp.src(path, { base: 'statics/app' })
        .pipe(plumber())
        .pipe(css({
          onpath: function(path) {
            return path.replace('statics/app/', 'statics/product/')
          }
        }))
        .pipe(gulp.dest('statics/product'))
        .on('finish', complete);
    }
  });

  // watch image files
  watch('statics/app/images', function(event, path) {
    var rpath = relative(base, path);

    bookmark = Date.now();
    event = event.toLowerCase();

    debugWatcher(event, rpath);

    if (event === 'unlink' || event === 'unlinkdir') {
      rimraf.sync(resolve('statics/product', relative(base, path)));
      complete();
    } else {
      gulp.src(path, { base: 'statics/app' })
        .pipe(gulp.dest('statics/product'))
        .on('finish', complete);
    }
  });
});
