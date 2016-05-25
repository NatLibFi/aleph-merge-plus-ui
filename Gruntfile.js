module.exports = function(grunt) {
 
  grunt.initConfig({
 
    pkg: grunt.file.readJSON('package.json'),

    // There are run with command: 'grunt jshint:ui'
    jshint: {
		ui: {
            options: {},
            src: ['js/*.js', 'WorkingDialog/WorkingDialog.js']
        }
    },

    // 'grunt watch:jshint' will run jshint when any js file changes in any directory.
	watch: {
		jshint: {
			files: ['**/*.js'],
			tasks: ['jshint:ui'],
			options: {
				interrupt: true
			}
		}
	}
    
  });
  // Each plugin must be loaded following this pattern
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  // 'grunt hint' is shortcut to grunt watch:jshint
  grunt.registerTask('hint', ['watch:jshint']);

};

