let gulp = require('gulp');
let browserSync = require('browser-sync');
let reload = browserSync.reload;
let changed = require('gulp-changed');
let data = require('gulp-data');
let gm = require('gulp-gm');
let pug = require('gulp-pug');
let jshint = require('gulp-jshint');
let rimraf = require('rimraf');

// paths for the development and build directories
let paths = {
	app: "./app",
	build: "./app/build"
};

// Some common file paths needed

// index.pug is convenient since we need to build to index.html
// because BrowserSync loads the build directory, so it looks for index.html
let pugFilename = paths.app + '/index.pug';
let cssFilename = paths.app + '/style.css';
let dataFilename = paths.app + '/data.json';
let jsFilesPath = paths.app + '/*.js';
let imgSrcPath = paths.app + '/images/*.JPG';
let imgBuildDir = paths.build + '/images';

// pug task: Pull in image data from the json file and
// compile the pug file into html, and copy to the build folder
function loadPug() {
	let stream = gulp.src(pugFilename)
		.pipe(data(function(file) {
			return require(dataFilename);
		}))
		.pipe(pug())
		.pipe(gulp.dest(paths.build))
		// reload the browser whenever we want to show changes
		.pipe(reload({stream: true}));
	// require() caches the json file, so we need to clear it 
	// from the cache after the task finishes, or else when we
	// call require() on the json file again during the 
	// watch task to get the new file,
	// we get the original cached file instead
	stream.on('end', function() {
		delete require.cache[require.resolve(dataFilename)];
	});
	return stream;
}

// css task: copy stylesheets to the build folder and reload the browser to show
// changes
function css() {
	return gulp.src(cssFilename)
		.pipe(gulp.dest(paths.build))
		.pipe(reload({stream: true}));
}

// scripts task: run JS scripts through JSHint and copy to build folder, reload
// browser to show changes.
// JSHint ignores files listed in the .jshintignore file
function scripts() {
	return gulp.src(jsFilesPath)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(gulp.dest(paths.build))
		.pipe(reload({stream: true}));
}

// GraphicsMagick task: resize images to a set width,
// while the height stays at the original aspect ratio.
// To save time, only process images that have been changed.
let resizedImageWidth = 1800;
function runGM() {
	return gulp.src(imgSrcPath)
		.pipe(changed(imgBuildDir))
		.pipe(gm(function(gmfile) {
			return gmfile.resize(resizedImageWidth);
		}))
		.pipe(gulp.dest(imgBuildDir))
		.pipe(reload({stream: true}));
}

// Watch task: whenever a file is changed, run its corresponding task
function watch(){
	gulp.watch(cssFilename, css);
	gulp.watch([pugFilename, dataFilename], loadPug);
	gulp.watch(jsFilesPath,scripts);

	let imgWatcher = gulp.watch(imgSrcPath);
	// if an image in the folder was added or modified, run the gm task
	imgWatcher.on('add', function(path) {
		console.log(path + ' added!');
		runGM();
	});
	imgWatcher.on('change', function(path) {
		console.log(path + ' changed!');
		runGM();
	});
	// if an image in the folder was deleted, also delete the image with same
	// filename in the build folder
	imgWatcher.on('unlink', function(path) {
		let buildPath = imgBuildDir + '/' +
			path.substring(path.lastIndexOf('\\'));
		console.log(path + ' deleted, attempting to delete ' + buildPath);
		rimraf(buildPath, function(err) {
			if (err) {
				console.log('rimraf error', err);
			}
		});
		reload({stream: true});
	});
}

// Connecting task: BrowserSync on paths.build
function connect() {
    browserSync({
        port: 9000,
        server: {
            baseDir: paths.build
        }
    });
};

// Main tasks

// dev task: build everything
let devTask = gulp.series(gulp.parallel(css, loadPug, scripts), runGM);

// default task: build everything, open BrowserSync, watch build files
exports.default = gulp.series(devTask, gulp.parallel(connect, watch));
