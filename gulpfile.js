let gulp = require('gulp');
let browserSync = require('browser-sync');
let data = require('gulp-data');
let gm = require('gulp-gm');
let newer = require('gulp-newer');
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
let imgSrcPath = paths.app + '/images/*.{jpg,JPG}';
let imgBuildDir = paths.build + '/images';

let server = browserSync.create();

function reload(done) {
	server.reload();
	done();
}

// pug task: Pull in image data from the json file and
// compile the pug file into html, and copy to the build folder
function loadPug() {
	let stream = gulp.src(pugFilename)
		.pipe(data(function(file) {
			return require(dataFilename);
		}))
		.pipe(pug())
		.pipe(gulp.dest(paths.build));
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
		.pipe(newer(paths.build))
		.pipe(gulp.dest(paths.build));
}

// scripts task: run JS scripts through JSHint and copy to build folder, reload
// browser to show changes.
// JSHint ignores files listed in the .jshintignore file
function scripts() {
	return gulp.src(jsFilesPath)
		.pipe(newer(paths.build))
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(gulp.dest(paths.build));
}

// GraphicsMagick task: resize images to a set width,
// while the height stays at the original aspect ratio.
// To save time, only process images that have been changed.
let resizedImageWidth = 1800;
function runGM() {
	return gulp.src(imgSrcPath)
		.pipe(newer(imgBuildDir))
		.pipe(gm(function(gmfile) {
			return gmfile.resize(resizedImageWidth);
		}))
		.pipe(gulp.dest(imgBuildDir));
}

// Watch task: whenever a file is changed, run its corresponding task
function watch() {
	gulp.watch(cssFilename, gulp.series(css, reload));
	gulp.watch([pugFilename, dataFilename], gulp.series(loadPug, reload));
	gulp.watch(jsFilesPath, gulp.series(scripts, reload));

	// if an image in the folder was added or modified, run the gm task
	gulp.watch(imgSrcPath, {events: ['add', 'change']},
		gulp.series(runGM, reload));
	// if an image in the folder was deleted, also delete the image with same
	// filename in the build folder
	gulp.watch(imgSrcPath).on('unlink', function(path) {
		let buildPath = imgBuildDir + '/' +
			path.substring(path.lastIndexOf('\\'));
		console.log(path + ' deleted, attempting to delete ' + buildPath);
		rimraf(buildPath, function(err) {
			if (err) {
				console.log('rimraf error', err);
			}
		});
		reload();
	});
}

// Connecting task: BrowserSync on paths.build
function connect() {
    server.init({
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
