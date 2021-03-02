module.exports = function(grunt) {

	var source = ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js', '!tests/specs/libs/**/*'];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		bumpup: ['package.json'],
		shunt: {
			build: {
				'dist/hello.js': [
					'src/hello.polyfill.js',
					'src/hello.js',
					'src/hello.chromeapp.js',
					'src/hello.phonegap.js',
					'src/hello.amd.js',
					'src/hello.commonjs.js'
				],
				'dist/hello.all.js': [
					'src/hello.polyfill.js',
					'src/hello.js',
					'src/hello.chromeapp.js',
					'src/hello.phonegap.js',
					'src/modules/dropbox.js',
					'src/modules/facebook.js',
					'src/modules/flickr.js',
					'src/modules/foursquare.js',
					'src/modules/github.js',
					'src/modules/google.js',
					'src/modules/instagram.js',
					'src/modules/joinme.js',
					'src/modules/linkedin.js',
					'src/modules/soundcloud.js',
					'src/modules/spotify.js',
					'src/modules/twitter.js',
					'src/modules/vk.js',
					'src/modules/windows.js',
					'src/modules/yahoo.js',
					'src/hello.amd.js',
					'src/hello.commonjs.js'
				]
			}
		},
		uglify: {
			minify: {
				files: {
					'dist/hello.min.js': ['dist/hello.js'],
					'dist/hello.all.min.js': ['dist/hello.all.js']
				}
			}
		},
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
	grunt.loadNpmTasks('grunt-bumpup');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('shunt');

	grunt.registerTask('deploy', ['shunt:build', 'uglify:minify', 'bumpup', 'updateInitConfig', 'usebanner:build']);
	grunt.registerTask('default', ['shunt:build', 'uglify:minify', 'usebanner:build']);

	grunt.registerTask('updateInitConfig', 'Redefine pkg after change in package.json', function() {
		grunt.config.set('pkg', grunt.file.readJSON('package.json'));
	});
};
