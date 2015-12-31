/**
 * Created by brian on 12/30/15.
 */
var gulp = require('gulp');
var babel=require('gulp-babel');
var watchify = require('gulp-watchify');
var rename=require('gulp-rename');
gulp.task('watch:test',build({src:'./test/index.js',filename:'test',dest:'./temp',watch:1}));
gulp.task('build:test',build({src:'./test/index.js',filename:'test',dest:'./temp'}));
gulp.task('build:src',function(){
  return gulp.src('src/**/*.js').pipe(babel({
    presets:['es2015']
  })).pipe(gulp.dest('dist'))
});
gulp.task('watch:src',['build:src'],function(){
  gulp.watch('src/**/*.js',['build:src']);
});


function build(opt){
  var filename=opt.filename;
  return watchify(function(watchify){
    return gulp.src(opt.src).
    pipe(watchify({
      watch:!!opt.watch,
      transform:[['babelify',{presets:['es2015']}]]
    })).pipe(rename(function(file){
      filename && (file.basename=filename)
    }))
      .pipe(gulp.dest(opt.dest))
  })
}


