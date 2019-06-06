module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-watchify')

  var task = {
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

  grunt.initConfig({
      manifest: grunt.file.readJSON('./extension/manifest.json'),
      browserify: task,
      watchify: task
  })

  grunt.registerTask('default', [
      'browserify:background',
      'browserify:content',
      'browserify:popup'
  ])

  grunt.registerTask('watch', [
      'watchify:background',
      'watchify:content',
      'browserify:popup'
  ])

}