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



  grunt.loadNpmTasks('grunt-contrib-connect');

};
