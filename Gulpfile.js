/**
 * Created by brian on 12/30/15.
 */
var source = require('vinyl-source-stream');
var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var path=require('path');
gulp.task('prepare',function(){
  return buildScript('./temp/babel-seed.js','./temp/babel.js')
});
gulp.task('test',function(callback){
  buildScript('./temp/test.js','./temp/test-browser.js',{watch:true})
});
function buildScript(src,dest,opt) {
  opt=opt||{};
  var props = {entries:[src]};
  var b=browserify(props);
  var bundler = opt.watch ? watchify(b) : b;
  bundler.transform("babelify", {presets: ["es2015"]});
  function rebundle() {
    var stream = bundler.bundle();
    return stream.on('error', function(){
      console.error.apply(console,arguments);
      this.emit('end')
    })
      .pipe(source(lastFileName(dest)))
      .pipe(gulp.dest(path.dirname(dest)));
  }
  bundler.on('update', function() {
    rebundle();
    console.log('Rebundle...');
  });
  return rebundle();
}
function lastFileName(src){
  return src.substring(src.lastIndexOf(path.sep)+1)
}
