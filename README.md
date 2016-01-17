# photoessay
Inspired by [Expose](https://github.com/Jack000/Expose), this is a static photoessay generator using [gulp.js](http://gulpjs.com/) to automate workflow. photoessay generates a site that looks like http://mikeli.me/photos/Taiwan/, from my personal site. The site is essentially a series of full-page photos with an optional title at the top and caption at the bottom.

## Installation

photessay's dependencies are gulp, used to enhance development, and GraphicsMagick, used to resize images so they're small enough for the web.

Install [GraphicsMagick](http://www.graphicsmagick.org/): Linux users please [read this](https://forum.ivorde.com/php-gmagick-no-decode-delegate-for-this-image-format-jpg-t15221.html) for JPEG support.

Install gulp globally using `npm install -g gulp`, and this command needs [npm](https://www.npmjs.com/). gulp also needs [Node.js](https://nodejs.org/) to run.

Then navigate to this repo's base directory and run `npm install` to install gulp libraries that we'll be using.

### Running the example

If installation worked, run `gulp` from the repo's base directory and if successful, your browser will open a new tab to http://localhost:9000 that shows the site.

## How it works

When you run `gulp`, it does the following:
- create a build directory, app/build, which will be the static site
- copies the CSS stylesheet, `app/style.css` to the build
- copies JS files to the build and outputs any errors using [JSHint](http://jshint.com/)
- take images from `app/images` and copies resized versions (using GraphicsMagick) to the build
- take image and caption data from `app/data.json`, pull that into `app/index.jade`, a [Jade file](http://jade-lang.com/), and then compile that `index.html` in the build
- open the build directory in your browser (i.e., run your build's `index.html`) as http://localhost:9000 using [BrowserSync](https://www.browsersync.io/), a cross-browser testing tool
- watch your development files for changes, and when one of them does, run the task to update the build. e.g., when you change a CSS file, gulp will copy that over to the build and use BrowserSync to automatically reload your browsers to reflect the changes you made

For more details, see `gulpfile.js`
