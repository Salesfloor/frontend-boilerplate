//initialize all of our variables
var app, base, gulp, gutil, gulpSequence, shell, build_deps, path, through2, File;

//load all of our dependencies
//add more here if you want to include more libraries
gulp          = require('gulp');
gutil         = require('gulp-util');
File          = gutil.File;
path          = require('path');
through2      = require('through2');
gulpSequence  = require('gulp-sequence').use(gulp);
shell         = require('gulp-shell');


gulp.task('write-dep-file', shell.task([
  'rm -f dependencies.js',
  'touch dependencies.js;'
]));

gulp.task('write-deps', function () {
  build_deps.get_configs();
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
  get_configs: function () {
    gulp.src('./configs/*.json')
      .pipe(this.build_deps('test'))
      .pipe(gulp.dest('./dependencies/'));
  },

  build_deps: function(modifier) {
    var self = this;
    return through2.obj(function(file, encoding, done) {
      var filename = path.basename(file.path);
      var config = require('./configs/' + filename);

      self.current_retailer = self.get_retailer(filename);
      var dep_string = self.get_deps(config);

      var target_name = self.get_dep_filename(filename);
      var dep = new File({ cwd: "", base: "", path: target_name, contents: new Buffer(dep_string) });
      done(null, dep);
    });
  },

  get_deps: function (config) {
    var components = config.components,
        import_strings = "";
        self = this;
    components.forEach(function (obj) {
      import_strings += self.get_export_string(obj)
    });

    return import_strings;
  },

  get_export_string: function (component) {
    var component_path = this.get_component_path(component)
    return 'import App.' + component + ' from ' + component_path + '\n';
  },

  get_component_path: function (component) {
    var basepath = 'app/components/'
    return  basepath + component + '/retailers/' + this.current_retailer + '/' + component + '.js';
  },

  get_retailer: function (filename) {
    var reg = /^configs\.(\w+?).json$/
    return reg.exec(filename)[1];
  },

  get_dep_filename: function (filename) {
    return 'dependencies.' + this.current_retailer + '.js';
  }

}