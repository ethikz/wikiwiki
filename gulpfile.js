var gulp = require('gulp'),
    plugin = require('gulp-load-plugins')({camelize:true});
    deploy = require('gulp-gh-pages');


// Paths
// =======================================================

var paths = {
  jade: 'app/**/*.jade',
  scss: 'app/assets/css/**/*.scss',
  js: 'app/assets/js/**/*.js',
  images: 'app/assets/img/**'
};


// HTML
// =======================================================

gulp.task('html', function() {
  return gulp.src(paths.jade)
    .pipe(plugin.jade())
    .pipe(gulp.dest('build'))
    .pipe(plugin.connect.reload());
});


// CSS
// =======================================================

gulp.task('css', function() {
  return gulp.src(paths.scss)
    .pipe(plugin.sass())
    .pipe(plugin.autoprefixer("last 2 version"))
    .pipe(plugin.minifyCss())
    .pipe(gulp.dest('build/assets/css'))
    .pipe(plugin.connect.reload());
});


// JS
// =======================================================

gulp.task('js', function() {
  return gulp.src([
      'app/assets/js/vendor/*.js',
      'app/assets/js/components/*.js',
      'app/assets/js/scripts.js',
    ])
    .pipe(plugin.concat('scripts.min.js'))
    .pipe(plugin.uglify())
    .pipe(gulp.dest('build/assets/js'))
    .pipe(plugin.connect.reload());
});


// Images
// =======================================================

gulp.task('optimizeImages', function() {
  return gulp.src(paths.images)
    .pipe(plugin.newer('build/assets/img'))
    .pipe(plugin.imagemin())
    .pipe(gulp.dest('app/assets/img/'));
});

gulp.task('cleanImages', ['optimizeImages'], function() {
  return gulp.src('build/assets/img')
    .pipe(plugin.clean());
});

gulp.task('copyImages', ['cleanImages'], function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('build/assets/img'));
});


// Watch
// =======================================================

gulp.task('watch', ['compile'], function() {
  gulp.watch(paths.jade, ['html']);
  gulp.watch(paths.scss, ['css']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.images, ['copyImages']);
});


// Server
// =======================================================

gulp.task('connect', function() {
  plugin.connect.server({
    root: 'build',
    port: '8001',
    livereload: true
  });
});


// Deploy
// =======================================================
gulp.task('deploy', function () {
    gulp.src('./build/**/*')
        .pipe(deploy('https://github.com/ethikz/wikiwiki', 'origin'));
});


// Tasks
// =======================================================

gulp.task('default', ['watch', 'connect']);
gulp.task('compile', ['html', 'css', 'js', 'copyImages']);
