# photoessay
Inspired by [Expose](https://github.com/Jack000/Expose), this is a static photoessay generator using gulp.js to automate workflow. photoessay generates a site that looks like http://mikeli.me/photos/Taiwan/

photoessay creates a build directory, app/build, which will be the static site. It takes images from app/images and resizes them and then copies them to the build. It takes image and caption data from app/data.json and pulls that into app/index.jade, and then that is compiled into index.html in the build.
