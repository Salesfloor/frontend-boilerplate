//initialize all of our variables
var app, base, gulp, gutil, runSequence, shell, path, through2, File, fs, run, lazypipe;
var build_deps, build_sass;

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
lazypipe      = require('lazypipe');

gulp.task('write-deps', function () {
  return build_deps.parse_configs();
});

gulp.task('bundle-deps', function () {
  return build_deps.write_deps();
});

// Wrapper to write to file within a stream
function string_buffer(filename, buffer) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: buffer}))
    this.push(null)
  }
  return src
}


// White label components build process

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

// Build an array of tasks to altenatively
// write each component file
// and bundle each retailer app
gulp.task('build-all', function () {
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


build_sass = {

  // Get scss base component path
  // And the path for each retailer's component
  paths: {
    'base': 'app/components/*/*.scss',
    retailer: function (retailer) {
      return 'app/components/*/retailers/' + retailer + '/*.scss'
    },
    get: function (path) {
      if (this[path]) { return this[path]; }
      else { return this.retailer(path); }
    }
  },

  // Returns a lazypipe to build the sass
  // imports for a given retailer
  build_sass_pipe: function (retailer) {
    return lazypipe()
      .pipe(gulp.src, this.paths.get(retailer))
      .pipe(this.gather_imports, this)
      .pipe(this.build_imports, this, retailer)
      .pipe(gulp.dest, './')
  },


  // Getter for a given sass lazypipe
  sass_pipe: {},
  get_sass_pipe: function (retailer) {
    if (this.sass_pipe[retailer] == null) {
      this.sass_pipe[retailer] = this.build_sass_pipe(retailer);
    }
    return this.sass_pipe[retailer];
  },

  // Gather import strings necessary for current build
  // and concatenate them in one string
  import_strings: '',
  gather_imports: function (self) {
    return through2.obj(function(file, encoding, done) {

      var filepath = self.get_component_filepath(file);
      self.import_strings += "@import " + filepath + ";\n";

      done(null, file);
    });
  },

  // Get the component path to import from
  get_component_filepath: function (file) {
    var filename = path.basename(file.path);
    var pattern = 'components/'
    return file.path.slice(file.path.search(pattern) + pattern.length);
  },

  // Build the final sass imports file
  build_imports: function (self, retailer) {
    return through2.obj(function(file, encoding, done) {

      console.log(retailer, self.import_strings);
      var target_name = 'dependencies/components.'  + retailer + '.scss';
      var imports = new File({ cwd: "", base: "", path: target_name, contents: new Buffer(self.import_strings) });

      done(null, imports);
    });
  },

  // Execute the given sass lazypipe
  sass_task: function (retailer) {
    return this.get_sass_pipe(retailer)();
  },

  copy_sass: function (retailer) {
    var path = 'dependencies/components.' + retailer + '.scss';
    if (!fs.existsSync(path)) { path = 'dependencies/components.base.scss'; }

    return gulp.src(path)
      .pipe(this.copy_imports())
      .pipe(gulp.dest('app/components/'));
  },

  // Build the final sass imports file
  copy_imports: function () {
    return through2.obj(function(file, encoding, done) {

      var target_name = 'components.scss';
      var imports = new File({ cwd: "", base: "", path: target_name, contents: file.contents });

      done(null, imports);
    });
  }
};

// Task to build the base sass import file
// With each component, no white-label
gulp.task('sass-base', function () {
  return build_sass.sass_task('base');
});


/* Tri-period task :
/* - Build the basic component import file
/* - Add the white-label version given
/*   a retailer by parameter,
 *   TODO - Build all retailers if no params provided
 * - Copy the scss dependency into the components' tree
 */
gulp.task('sass', function () {
  var retailer = getRetailer();
  if (!retailer) {
    return console.log('Error: Please provide retailer');
  }

  gulp.task('sass-' + retailer, function () {
    return build_sass.sass_task(retailer);
  });

  gulp.task('sass-copy-' + retailer, function () {
    return build_sass.copy_sass(retailer);
  });

  runSequence('sass-base', 'sass-' + retailer, 'sass-copy-' + retailer);
});


function getArgs() {
  return Object.keys(gutil.env).filter(function (key) {
    return key !== '_';
  });
}

function getRetailer() {
  return Object.keys(gutil.env).filter(function (key) {
    return key !== '_';
  })[0];
}