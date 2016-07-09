module.exports = function(grunt) {

	var source = ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js', '!tests/specs/libs/**/*'];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		browserify: {
			dist: {
				options: {
					banner: '// hello',
					browserifyOptions: {
						debug: true
					},
					transform: [['babelify', {presets: ['es2015']}]]
				},
				src: ['src/hello.all.js'],
				dest: 'dist/hello.all.js'
			}
		},
		jshint: {
			src: source,
			options: {
				globals: {
					console: true,
					module: true,
					document: true
				},
				sub: true,
				esversion: 6
			}
		},
		jscs: {
			src: source,
			options: {
				config: '.jscsrc'
			}
		},
		mocha_phantomjs: {
			all: ['tests/specs/index.html']
		},
		bumpup: ['package.json'],
		usebanner: {
			build: {
				options: {
					position: 'top',
					banner: '/*! <%= pkg.name %> v<%= pkg.version %> | (c) 2012-<%= (new Date()).getFullYear() %> <%= pkg.author.name %> | <%= pkg.license %> <%= pkg.homepage %>/LICENSE */',
					linebreak: true
				},
				files: {
					src: ['dist/hello.*']
				}
			}
		},
		watch: {
			files: ['src/**/*.js', 'tests/specs/**/*'],
			tasks: ['test']
		}
	});

	grunt.loadNpmTasks('grunt-banner');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-mocha-phantomjs');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('browserstack-runner');

	grunt.registerTask('mocha', ['mocha_phantomjs']);
	grunt.registerTask('test', ['jshint', 'mocha']);
	grunt.registerTask('deploy', ['test', 'bumpup', 'updateInitConfig', 'usebanner:build']);
	grunt.registerTask('default', ['test', 'usebanner:build']);

	grunt.registerTask('updateInitConfig', 'Redefine pkg after change in package.json', function() {
		grunt.config.set('pkg', grunt.file.readJSON('package.json'));
	});
};
