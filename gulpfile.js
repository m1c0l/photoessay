var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var changed = require('gulp-changed');
var data = require('gulp-data');
var gm = require('gulp-gm');
var jade = require('gulp-jade');
var jshint = require('gulp-jshint');
var watch = require('gulp-watch');
var rimraf = require('rimraf');
var runSequence = require('run-sequence');

// paths for the development and build directories
var paths = {
	app: "./app",
	build: "./app/build"
};

// Jade task: Pull in image data from the json file and 
// compile the Jade file into html, and copy to the build folder
gulp.task('jade', function() {
	var stream = gulp.src(paths.app + '/index.jade')
		.pipe(data(function(file) {
			return require(paths.app + '/data.json');
		}))
		.pipe(jade())
		.pipe(gulp.dest(paths.build))
		.pipe(reload({stream: true})); // reload the browser whenever we want to show changes
	// require() caches the json file, so we need to clear it 
	// from the cache after the task finishes, or else when we
	// call require() on the json file again during the 
	// watch task to get the new file,
	// we get the original cached file instead
	stream.on('end', function() {
		delete require.cache[require.resolve(paths.app + '/data.json')];
	});
	return stream;
});

// css task: copy stylesheets to the build folder and reload the browser to show changes
gulp.task('css', function() {
	return gulp.src(paths.app + '/style.css')
		.pipe(gulp.dest(paths.build))
		.pipe(reload({stream: true}));
});

// scripts task: run JS scripts through JSHint and copy to build folder, reload browser to show changes
// JSHint ignores files listed in the .jshintignore file
gulp.task('scripts', function() {
	return gulp.src(paths.app + '/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(gulp.dest(paths.build))
		.pipe(reload({stream: true}));
});

// GraphicsMagick task: resize images to a set width,
// while the height stays at the original aspect ratio.
// To save time, only process images that have been changed.
var resizedImageWidth = 1366;
gulp.task('gm', function() {
	return gulp.src(paths.app + '/images/*.JPG')
		.pipe(changed(paths.build + '/images'))
		.pipe(gm(function(gmfile) {
			return gmfile.resize(resizedImageWidth);
		}))
		.pipe(gulp.dest(paths.build + '/images'))
		.pipe(reload({stream: true}));
});

// Watch task: whenever a file is changed, run its corresponding task
gulp.task('watch', function() {
	watch(paths.app + '/style.css', function() {
		gulp.start('css');
	});
	watch([paths.app + '/index.jade', paths.app + '/data.json'], function() {
		gulp.start('jade');
	});
	watch(paths.app + '/*.js', function() {
		gulp.start('scripts');
	});
	// if an image in the folder was added or modified, run the gm task
	watch(paths.app + '/images/*.JPG', {events: ['add', 'change']}, function(file) {
		console.log(file.basename + ' added or changed!');
		gulp.start('gm');
	});
	// if an image in the folder was deleted, also delete the image with same filename in the build folder
	watch(paths.app + '/images/*.JPG', {events: 'unlink'}, function(file) {
		console.log(file.basename + ' deleted!');
		rimraf(paths.build + '/images/' + file.basename, function(err) {
			if (err) {
				console.log('rimraf error', err);
			}
		});
		reload({stream: true}); 
	});
		
});

// Cleaning task: run if you want to delete the build
gulp.task('deleteBuild', function(callback) {
	rimraf(paths.build, callback);
});

// Connecting task: BrowserSync on paths.build
gulp.task('connect', function() {
    browserSync({
        port: 9000,
        server: {
            baseDir: paths.build
        }
    });
});

// Main tasks

// dev task: build everything
gulp.task('dev', function(callback) {
	return runSequence(['css', 'jade', 'scripts'], 'gm', callback);
});

// default task: build everything, open BrowserSync, and then watch files
gulp.task('default', function(callback) {
	return runSequence('dev', 'connect', 'watch', callback);
});