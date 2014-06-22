// Includes
var gulp = require('gulp');
var compass = require('gulp-compass');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var reactify = require('reactify');


// Set the paths
var paths = {
    styles: {
        src: './src/scss/*.scss',
        dest: './build/css'
    },
    scripts: {
        src: './src/js/**/*.{js,jsx}',
        dest: './build/js'
    },
    images: {
        src: './src/images/*',
        dest: './build/img'
    },
    html: {
        src: './src/*.html',
        dest: './build/'
    }
};

// Convert sassy files in css
gulp.task('compass', function() {
    return gulp.src(paths.styles.src)
        .pipe(plumber())
        .pipe(compass({
            config_file: './config.rb',
            css: 'build/css',
            sass: 'src/scss'
        }))
        .pipe(gulp.dest(paths.styles.dest));
});

// Process images
gulp.task('images', function() {
    return gulp.src(paths.images.src)
        .pipe(plumber())
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest(paths.images.dest));
});

// Process html files
gulp.task('html', function() {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dest));
});


// Build the javascript
// Convert JSX
// Browserify
gulp.task('build-js', function() {
    var bundler = browserify('./src/js/app.js', {basedir: __dirname});
    bundler.transform(reactify);

    var stream = bundler.bundle({debug: !gutil.env.production});

    return stream
        .pipe(source('app.js'))
        .pipe(gulp.dest(paths.scripts.dest));
});

// Starts development local server and watches changes
gulp.task('serve', function() {
    // Start server
    browserSync.init(
        // Reload on build change
        ['build/css/**/*.css', 'build/js/**/*.js', 'build/*.html'], {
        server: {
            baseDir: './build'
        },
        notify: false
    });

    // Watch files
    gulp.watch(paths.styles.src, ['compass']);
    gulp.watch(paths.scripts.src, ['build-js']);
    gulp.watch(paths.images.src, ['images']);
    gulp.watch(paths.html.src, ['html']);
});

// Create tasks
gulp.task('build', ['compass', 'build-js', 'images', 'html']);
gulp.task('default', ['serve', 'build']);
