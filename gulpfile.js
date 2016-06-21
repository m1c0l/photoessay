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

// Some common file paths needed

// index.jade is convenient since we need to build to index.html
// because BrowserSync loads the build directory, so it looks for index.html
var jadeFilename = paths.app + '/index.jade';
var cssFilename = paths.app + '/style.css';
var dataFilename = paths.app + '/data.json';
var jsFilesPath = paths.app + '/*.js';
var imgSrcPath = paths.app + '/images/*.JPG';
var imgBuildDir = paths.build + '/images';

// Jade task: Pull in image data from the json file and 
// compile the Jade file into html, and copy to the build folder
gulp.task('jade', function() {
	var stream = gulp.src(jadeFilename)
		.pipe(data(function(file) {
			return require(dataFilename);
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
		delete require.cache[require.resolve(dataFilename)];
	});
	return stream;
});

// css task: copy stylesheets to the build folder and reload the browser to show changes
gulp.task('css', function() {
	return gulp.src(cssFilename)
		.pipe(gulp.dest(paths.build))
		.pipe(reload({stream: true}));
});

// scripts task: run JS scripts through JSHint and copy to build folder, reload browser to show changes
// JSHint ignores files listed in the .jshintignore file
gulp.task('scripts', function() {
	return gulp.src(jsFilesPath)
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
	return gulp.src(imgSrcPath)
		.pipe(changed(imgBuildDir))
		.pipe(gm(function(gmfile) {
			return gmfile.resize(resizedImageWidth);
		}))
		.pipe(gulp.dest(imgBuildDir))
		.pipe(reload({stream: true}));
});

// Watch task: whenever a file is changed, run its corresponding task
gulp.task('watch', function() {
	watch(cssFilename, function() {
		gulp.start('css');
	});
	watch([jadeFilename, dataFilename], function() {
		gulp.start('jade');
	});
	watch(jsFilesPath, function() {
		gulp.start('scripts');
	});
	// if an image in the folder was added or modified, run the gm task
	watch(imgSrcPath, {events: ['add', 'change']}, function(file) {
		console.log(file.basename + ' added or changed!');
		gulp.start('gm');
	});
	// if an image in the folder was deleted, also delete the image with same filename in the build folder
	watch(imgSrcPath, {events: 'unlink'}, function(file) {
		console.log(file.basename + ' deleted!');
		rimraf(imgBuildDir + '/' + file.basename, function(err) {
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