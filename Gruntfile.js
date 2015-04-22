module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js'],
			options: {
				ignores: ['tests/specs/libs/*.js'],
				globals: {
					console: true,
					module: true,
					document: true
				},
				sub: true,
				es3: true
			}
		},
		jscs: {
			src: ['Gruntfile.js', 'src/**/*.js', 'tests/specs/e2e/**/*.js', 'tests/specs/unit/core/hello.api.js'],
			options: {
				config: '.jscsrc'
			}
		},
		mocha_phantomjs: {
			all: ['tests/specs/index.html']
		},
		bumpup: ['package.json', 'bower.json'],
		shunt: {
			docs: {
				'README.md': './index.html'
			},
			build: {
				'dist/hello.js': ['src/hello.js', 'src/hello.legacy.js', 'src/hello.amd.js', 'src/hello.commonjs.js'],
				'dist/hello.all.js': [
					'src/hello.js',
					'src/hello.legacy.js',
					'src/modules/dropbox.js',
					'src/modules/facebook.js',
					'src/modules/flickr.js',
					'src/modules/foursquare.js',
					'src/modules/github.js',
					'src/modules/google.js',
					'src/modules/instagram.js',
					'src/modules/linkedin.js',
					'src/modules/soundcloud.js',
					'src/modules/twitter.js',
					'src/modules/windows.js',
					'src/modules/yahoo.js',
					'src/hello.amd.js',
					'src/hello.commonjs.js'
				]
			},
			minify: {
				'dist/hello.min.js': 'dist/hello.js',
				'dist/hello.all.min.js': 'dist/hello.all.js'
			}
		},
		watch: {
			files: ['src/**/*.js'],
			tasks: ['jscs']
		}
	});

	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('shunt');

	grunt.registerTask('mocha', ['mocha_phantomjs']);
	grunt.registerTask('test', ['jscs', 'jshint', 'mocha']);
	grunt.registerTask('default', ['test', 'shunt:build', 'shunt:minify']);

};
