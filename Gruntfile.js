//
// Grunttask runners
//
module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js'],
			options: {

				ignores: ['tests/specs/libs/*.js'],

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
		karma : {
			unit: {
				configFile: 'tests/karma.conf.js'
//				autoWatch: true
			}
		},
		mocha_phantomjs: {
			options: {
				//'reporter': 'xunit',
				//'output': 'test/results/mocha.xml'
			},
			all: ['tests/specs/index.html'],
		},
		// Bump
		bumpup: ['package.json', 'bower.json'],
		// Shunt files around
		shunt : {
			// Shunt the documents of our project
			docs : {
				'README.md' : './index.html'
			},
			// Combine the src files, create minified versions
			build : {
				'dist/hello.js' : ['src/hello.js', 'src/hello.then.js', 'src/hello.amd.js', 'src/hello.commonjs.js'],
				'dist/hello.all.js' : ['src/hello.js', 'src/hello.then.js', 'src/modules/', 'src/hello.amd.js', 'src/hello.commonjs.js']
			},
			minify : {
				'dist/hello.min.js' : 'dist/hello.js',
				'dist/hello.all.min.js' : 'dist/hello.all.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('shunt');

	grunt.registerTask('test', ['jshint', 'mocha_phantomjs']);
	grunt.registerTask('default', ['test', 'shunt:build', 'shunt:minify']);

};
