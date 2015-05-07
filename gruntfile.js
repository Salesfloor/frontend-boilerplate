module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 8555,
          keepalive : true,
          livereload: false,
          base : "",
          hostname: '*'
        }
      }
    },

    nunjucks: {
      precompile: {
        baseDir: 'app',
        src: ['app/views/**/*.html','app/components/**/*.html','app/layouts/**/*.html'],
        dest: 'app/templates/templates.js'
      }
    },


  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-nunjucks');

};
