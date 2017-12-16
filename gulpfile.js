var gulp         = require('gulp'), // Подключаем Gulp
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync  = require('browser-sync'), // Подключаем Browser Sync
    cleanCSS     = require('gulp-clean-css'), // Подключаем пакет для минификации CSS
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов

gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('app/scss/**/*.scss', !'_*.*') // Берем источник, кроме файлов с нижним подчеркиванием
        .pipe(sass().on('error', sass.logError)) // Преобразуем Sass в CSS посредством gulp-scss
        .pipe(gulp.dest('app/css/fullcss'))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
        .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'app',// Директория для сервера - app
            files: ['scss/**/*.scss', 'js/*.js' , '*.html', '*.*']
        },
        notify: false // Отключаем уведомления
    });
});

var uglifyjs = require('uglify-js');
var composer = require('gulp-uglify/composer');
var pump     = require('pump');

var minify   = composer(uglifyjs, console);

gulp.task('compress', function (cb) {
    // the same options as described above
    var options = {};

    pump([
            gulp.src('app/js/jslib/*.js')
            .pipe(rename({suffix: '.min'})),
            minify(options),
            gulp.dest('app/js')], cb);
});

gulp.task('watch', ['browser-sync', 'compress'], function() {
    gulp.watch('app/scss/**/*.scss', ['sass']); // Наблюдение за scss файлами в папке scss
    gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('build', ['clean', 'sass', 'compress'], function() {

    var buildCss = gulp.src('app/css/*.css')// Переносим CSS в продакшен
        .pipe(gulp.dest('dist/css'));

    var buildFullCss = gulp.src('app/css/fullcss/style.css') // Переносим неминифицированный CSS в продакшен
        .pipe(gulp.dest('dist/css/fullcss'));

    var buildImg = gulp.src('app/img/*.*')// Переносим Картинки в продакшен
        .pipe(gulp.dest('dist/img'));

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/*.js') // Переносим скрипты в продакшен
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
        .pipe(gulp.dest('dist'));
});

gulp.task('clear', function (callback) {
    return cache.clearAll();
});

gulp.task('default', ['watch']);
