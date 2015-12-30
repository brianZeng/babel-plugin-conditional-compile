/**
 * Created by brian on 12/30/15.
 */
var gulp = require('gulp');
var watchify = require('gulp-watchify');
gulp.task('watch:test',build({src:'./test/index.js',dest:'./temp/test',watch:1}));
gulp.task('build:test',build({src:'./test/index.js',dest:'./temp/test'}));

gulp.task('watch:src',build({src:'./src/index.js',dest:'./dist/',watch:true}));
gulp.task('build:src',build({src:'./src/index.js',dest:'./dist/'}));
function build(opt){
  return watchify(function(watchify){
    return gulp.src(opt.src).
    pipe(watchify({
      watch:!!opt.watch,
      transform:[['babelify',{presets:['es2015']}]]
    })).
    pipe(gulp.dest(opt.dest))
  })
}


