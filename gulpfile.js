//initialize all of our variables
var app, base, gulp, gutil, gulpSequence, shell;

//load all of our dependencies
//add more here if you want to include more libraries
gulp        = require('gulp');
gutil       = require('gulp-util');
gulpSequence = require('gulp-sequence').use(gulp);
shell       = require('gulp-shell');
