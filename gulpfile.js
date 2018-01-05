'use strict';

const gulp = require('gulp');
const mochaPhantomJS = require('gulp-mocha-phantomjs');
const fs = require('fs');

const browserify = require('browserify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const collapse = require('bundle-collapser/plugin');
const header = require('gulp-header');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const util = require('gulp-util');
const uglify = require('gulp-uglify');
const pkg = require('./package.json');

const port = 8080;
const localhost = require('localhost')('./');

const scripts_to_watch = ['**/*.js', '!node_modules/**/*', '!test/components/**/*', '!test/bundle.js', '!test/specs/index.js'];

gulp.task('localhost', () => {
	localhost.listen(port);
	util.log('Listening on port', util.colors.cyan(port));
});

gulp.task('test_bundle', ['bundle'], testSpecs('test/bundle.html'));

gulp.task('index_tests', () => {
	const root = `${__dirname.replace(/\\/g, '/')}/test/specs/`;

	// for the given files in the test directory, create an index
	return gulp.src(['test/specs/**/*.js', '!test/specs/index.js'], (err, files) => {
		// Write line to the index file
		const index = files.map(name => `require('${name.replace(root, './')  }');`);

		fs.writeFileSync('test/specs/index.js', index.join('\n'));
	});
});

gulp.task('watch', ['localhost', 'test_bundle'], () => gulp.watch(scripts_to_watch, {interval: 500}, ['test_bundle']));

gulp.task('close', () => localhost.close());

gulp.task('bundle', () =>

	// Package up the specs directory into a single file called config.js
	browserify('./test/specs/index.js', {
		debug: true,
		paths: './'
	})
		.transform(babelify, {
			presets: ['es2015', 'stage-0', 'stage-2'], //es2015-node5 allows mixing of commonJs and ES6 exports
			plugins: [
				'add-module-exports' //add-module-exports allows mixing of commonJs and ES6 exports
			],
			sourceMaps: true
		})
		.bundle()
		.on('error', util.log.bind(util, 'Browserify Error'))
		.pipe(source('./bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./test/'))
);

gulp.task('build', () => {

	buildJS('hello.js');
	buildJS('hello.all.js');

});

function buildJS(name) {

	browserify({
		entries: [`src/${name}`],
		debug: true,
		paths: './',
		standalone: 'hello'
	})
		.transform(babelify, {
			presets: ['es2015', 'stage-0', 'stage-2'], //es2015-node5 allows mixing of commonJs and ES6 exports
			plugins: [
				'add-module-exports' //add-module-exports allows mixing of commonJs and ES6 exports
			],
			sourceMaps: true
		})
		.plugin(collapse)
		.bundle()
		.pipe(source(name))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(uglify({
			mangle: true,
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		}))
		.pipe(header(`/*! ${pkg.name} v${pkg.version} | (c) 2012-${(new Date()).getFullYear()} ${pkg.author.name} | ${pkg.license} ${pkg.homepage}/LICENSE */`))
		.on('error', util.log)
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('dist/'));
}

gulp.task('watch_bundle', () => gulp.watch(scripts_to_watch, {interval: 500}, ['bundle']));

gulp.task('test', ['localhost', 'test_bundle'], () => {
	util.log(`Closing localhost:${port}`);
	localhost.close();
});

gulp.task('default', ['test']);

function testSpecs(path) {
	return () => {
		const stream = mochaPhantomJS();
		stream.write({path: `http://localhost:${port}/${path}`, reporter: 'spec'});
		stream.end();
		return stream;
	};
}
