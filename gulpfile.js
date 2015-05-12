//initialize all of our variables
var app, base, gulp, gutil, runSequence, shell, build_deps, path, through2, File, fs, run;

//load all of our dependencies
//add more here if you want to include more libraries
gulp          = require('gulp');
gutil         = require('gulp-util');
File          = gutil.File;
path          = require('path');
through2      = require('through2');
runSequence   = require('run-sequence');
shell         = require('gulp-shell');
fs            = require('fs');
run           = require('gulp-run');

gulp.task('write-deps', function () {
  return build_deps.parse_configs();
});

gulp.task('bundle-deps', function () {
  return build_deps.write_deps();
});

function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}

function string_buffer(filename, buffer) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: buffer}))
    this.push(null)
  }
  return src
}

build_deps = {
  retailers: [],
  parse_configs: function () {
    return gulp.src('./configs/*.json')
      .pipe(this.build_deps())
      .pipe(gulp.dest('./dependencies/'));
  },

  build_deps: function() {
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
        import_strings = "",
        exports = [];
        self = this;
    components.forEach(function (obj) {
      var str = self.get_export_string(obj);
      if (str.length === 0) { return; }
      import_strings += str;
      exports.push(self.capitalize(obj));
    });

    var export_string = 'export { ' + exports.join(', ') + ' };';
    import_strings += '\n\n' + export_string;

    return import_strings;
  },

  capitalize: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  get_export_string: function (component) {
    var component_path = this.get_component_path(component)
    if (!component_path) { return '';}
    return "import " + this.capitalize(component) + " from '" + component_path + "';\n";
  },

  get_component_path: function (component) {
    var init_path = 'app/components/'
    var fullpath = init_path + component + '/retailers/' + this.current_retailer + '/' + component;
    var basepath = init_path + component + '/' + component;

    if(fs.existsSync(fullpath + '.js')) {
      return fullpath;
    } else if (fs.existsSync(basepath + '.js')) {
      return basepath;
    } else {
      console.log('Missing component file for component: ' + component + ', path: ' + basepath);
      return false;
    }
  },

  get_retailer: function (filename) {
    var reg = /^(configs|dependencies)\.(\w+?).js(on)?$/
    return reg.exec(filename)[2];
  },

  get_dep_filename: function (filename) {
    return 'dependencies.' + this.current_retailer + '.js';
  },

  write_deps: function () {
    var ret = {ret: null, comp: null}
    return gulp.src('./dependencies/*', {passthrough: true})
      .pipe(this.set_current_retailer(ret))
      .pipe(this.bundle_deps(ret))
      .pipe(this.bundle(ret))
  },

  set_current_retailer: function(ret) {
    var self = this;
    return through2.obj(function(file, encoding, done) {
      var filename = path.basename(file.path);

      self.current_retailer = self.get_retailer(filename);
      ret.ret = self.current_retailer;

      done(null, file);
    });
  },

  bundle_deps: function(ret) {
    var self = this;
    return through2.obj(function(file, encoding, done) {
      var filename = path.basename(file.path);

      self.current_retailer = self.get_retailer(filename);
      // self.current_retailer = self.get_retailer(filename);
      // var dep_string = self.get_deps(config);

      var target_name = 'components.js'
      ret.comp = file.contents;
      var dep = new File({ cwd: "", base: "", path: target_name, contents: file.contents });
      done(null, dep);
    });
  },

  bundle: function(retailer) {
    var self = this;
    return through2.obj(function(file, encoding, done) {
      var filename = path.basename(file.path);

      // Add current retailer to the list of retailers
      // We will use that to build all the bundles at the end
      self.retailers.push(retailer.ret);

      // Freeze retailer's reference to be used in our task callback
      // where the initial retailer.ret reference will have already changed
      var frozenRetailer = retailer.ret;

      // Write components.js to disk, with the specific retailer version
      gulp.task('write-component-' + frozenRetailer, function () {
        return string_buffer(filename, file.contents).pipe(gulp.dest('app/'));
      });

      // Bundle a specific retailer version
      // Along with all their specific components
      gulp.task('build-' + frozenRetailer, function () {
        return run('jspm bundle app/app build.' + frozenRetailer + '.js').exec();
      });

      done(null, file);
    });
  }
};

gulp.task('build-all', function () {
  // Build the array of tasks to write each component file
  // And then bundle each retailer app
  var build_tasks = build_deps.retailers.reduce(function (tasks, retailer) {
    tasks.push('write-component-' + retailer);
    tasks.push('build-' + retailer);
    return tasks;
  }, []);

  // Run all tasks sequentially
  runSequence.apply(null, build_tasks);
});

gulp.task('build-deps', function () {
  runSequence('write-deps', 'bundle-deps', 'build-all');
});
