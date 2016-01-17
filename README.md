# photoessay
Inspired by [Expose](https://github.com/Jack000/Expose), this is a static, responsive photoessay generator using [gulp.js](http://gulpjs.com/) to automate workflow. photoessay generates a site that looks like http://mikeli.me/photos/Taiwan/, from my personal site. The site is essentially a series of full-page photos with an optional title at the top and caption at the bottom.

## Installation

photessay's dependencies are gulp, used to enhance development, and GraphicsMagick, used to resize images so they're small enough for the web.

Install [GraphicsMagick](http://www.graphicsmagick.org/): Linux users please [read this](https://forum.ivorde.com/php-gmagick-no-decode-delegate-for-this-image-format-jpg-t15221.html) for JPEG support.

Install gulp globally using `npm install -g gulp`, and this command needs [npm](https://www.npmjs.com/). gulp also needs [Node.js](https://nodejs.org/) to run.

Then navigate to this repo's base directory and run `npm install` to install gulp libraries from `package.json` that we'll be using.

### Running the example

If installation worked, run `gulp` from the repo's base directory and if successful, your browser will open a new tab to http://localhost:9000 that shows the site; it should look like http://mikeli.me/github/photoessay-example/

## How it works

When you run `gulp`, it does the following:
- create a build directory, `app/build`, which will be the static site
- copies the CSS stylesheet, `app/style.css` to the build
- copies JS files to the build and outputs any errors using [JSHint](http://jshint.com/)
- take images from `app/images` and copies resized versions (using GraphicsMagick) to the build
- take image data from `app/data.json`, pull that into `app/index.jade`, a [Jade file](http://jade-lang.com/), and then compile that `index.html` in the build
- open the build directory in your browser (i.e., run your build's `index.html`) as http://localhost:9000 using [BrowserSync](https://www.browsersync.io/), a cross-browser testing tool
- watch your development files for changes, and when one of them does, run the task to update the build. e.g., when you change a CSS file, gulp will copy that over to the build and use BrowserSync to automatically reload your browsers to reflect the changes you made

For more details, see `gulpfile.js`. When you're ready to deploy, simply upload the `app/build` directory to your website.

### Image data

The site's html is generated from data in `app/data.json`, which has the following variables:
- `defaultAspectRatio`: the default aspect ratio of your photos (width divided by height); useful if most of your photos have the same aspect ratio, like 1.5. The aspect ratio's needed to properly set the height of the images displayed on the site.
- `imageData`: an array containing the file name, caption and title of each image
  - `filename`: base name of the image; the path is taken care of in `app/index.jade`
  - `title` [optional]: title of the image, placed at the top center of the image
  - `caption` [optional]: caption of the image, placed at the bottom of the image
  - `aspectRatio`: aspect ratio of the image; if specified, is used instead of `defaultAspectRatio`

### Lazy loading

Using [bLazy](http://dinbror.dk/blazy/), the images on the site are lazy loaded 1000px before the user scrolls to them.
