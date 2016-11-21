'use strict';

var gulp = require('gulp');
var mochaPhantomJS = require('gulp-mocha-phantomjs');
var fs = require('fs');

var browserify = require('browserify');
var babelify = require('babelify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');

var port = 8080;
var localhost = require('localhost')('./');

var scripts_to_watch = ['**/*.js', '!node_modules/**/*', '!test/components/**/*', '!test/bundle.js', '!test/specs/index.js'];

gulp.task('localhost', () => {
	localhost.listen(port);
	util.log('Listening on port', util.colors.cyan(port));
});

gulp.task('test_bundle', ['bundle'], testSpecs('test/bundle.html'));

gulp.task('index_tests', () => {
	var root = __dirname.replace(/\\/g, '/') + '/test/specs/';

	// for the given files in the test directory, create an index
	return gulp.src(['test/specs/**/*.js', '!test/specs/index.js'], (err, files) => {
		// Write line to the index file
		let index = files.map(name => 'require(\'' + name.replace(root, './') + '\');');

		fs.writeFileSync('test/specs/index.js', index.join('\n'));
	});
});

gulp.task('watch', ['localhost', 'test_bundle'], () => gulp.watch(scripts_to_watch, {interval: 500}, ['test_bundle']));

gulp.task('close', () => localhost.close());

gulp.task('bundle', () => {

	// Package up the specs directory into a single file called config.js
	return browserify('./test/specs/index.js', {debug: true, paths: './'})
	.transform(babelify)
	.bundle()
	.on('error', util.log.bind(util, 'Browserify Error'))
	.pipe(source('./bundle.js'))
	.pipe(buffer())
	.pipe(sourcemaps.init({loadMaps: true}))
	.pipe(sourcemaps.write('./'))
	.pipe(gulp.dest('./test/'));
});

gulp.task('watch_bundle', () => gulp.watch(scripts_to_watch, {interval: 500}, ['bundle']));

gulp.task('test', ['localhost', 'test_bundle'], () => {
	util.log('Closing localhost:' + port);
	localhost.close();
});

gulp.task('default', ['test']);

function testSpecs(path) {
	return () => {
		var stream = mochaPhantomJS();
		stream.write({path: 'http://localhost:' + port + '/' + path, reporter: 'spec'});
		stream.end();
		return stream;
	};
}
