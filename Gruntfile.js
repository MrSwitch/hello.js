//
// Grunttask runners
//
module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js'],//, 'test/**/*.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					console: true,
					module: true,
					document: true
				},
				// dont check dot notation
				sub :true
			}
		},
		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint']
		},

		// Shunt files around
		shunt : {
			// Shunt the documents of our project
			docs : {
				'README.md' : './index.html'
			},
			// Combine the src files, create minified versions
			build : {
				'dist/hello.js' : ['src/hello.js', 'src/hello.amd.js'],
				'dist/hello.all.js' : ['src/hello.js', 'src/modules/', 'src/hello.amd.js']
			},
			minify : {
				'dist/hello.min.js' : 'dist/hello.js',
				'dist/hello.all.min.js' : 'dist/hello.all.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('shunt');

	grunt.registerTask('test', ['jshint']);
	grunt.registerTask('default', ['jshint', 'shunt:build', 'shunt:minify']);

};