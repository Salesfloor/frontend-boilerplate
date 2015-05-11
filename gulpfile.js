//initialize all of our variables
var app, base, gulp, gutil, gulpSequence, shell, build_deps;

//load all of our dependencies
//add more here if you want to include more libraries
gulp        = require('gulp');
gutil       = require('gulp-util');
gulpSequence = require('gulp-sequence').use(gulp);
shell       = require('gulp-shell');


gulp.task('write-dep-file', shell.task([
  'rm -f dependencies.js',
  'touch dependencies.js;'
]));

gulp.task('write-deps', function () {
  return string_src("dependencies.js", 'test123')
    .pipe(gulp.dest('./'))
});

gulp.task('build-deps', gulpSequence(['write-dep-file', 'write-deps']));

function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}

build_deps = {
  build_deps_from_string: function () {

  },

}