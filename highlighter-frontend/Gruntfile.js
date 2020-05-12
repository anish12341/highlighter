

module.exports = function(grunt) {
    var taskBrowse = {
        options: {
            debug: true
        },
        background: {
            src: './src/background/*',
            dest: './extension/background.js'
        },
        content: {
            src: './src/content/*',
            dest: './extension/content.js'
        },
        popup: {
            src: './src/popup/*',
            dest: './extension/popup.js'
        } 
    }

    var taskWatch = {
        files: ['./src/background/**/*.js', './src/content/**/*.js', './src/popup/**/*.js'],
        tasks: ['browserify']
    }

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      watch: taskWatch,
      browserify: taskBrowse
    });
  
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
  };