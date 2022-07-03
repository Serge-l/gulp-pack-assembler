const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const rename = require('gulp-rename');
const cleanCss = require('gulp-clean-css');
const del = require('del');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const newer = require('gulp-newer'); 
const browsersync = require('browser-sync').create();

const paths = {
    //каталог с путями

    html: {
        src: './*html',
        dest: 'dist'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'dist/css/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/js'
    },

    images: {
        src: 'src/img/*',
        dest: 'dist/img'
    }
}

function styles() {
    //Обработка стилей( перем папку из объекта путей const paths)
    //ищем файлы scss  и компилируем их в css
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCss())  // минификация css кода - удаление пробелов/ лишних запятых и тд
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.styles.dest)) // переносим файлы в папку dist
        .pipe(browsersync.stream())
    }

function html() {
    //минификация html
    return gulp.src(paths.html.src)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(size({
            showFiles: true
        }))

        .pipe(gulp.dest(paths.html.dest))
        .pipe(browsersync.stream())
}

function img () {
    //сжатие изображений
    return gulp.src(paths.images.src)
    .pipe(newer(paths.images.dest)) //обработка только новых изображений
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.images.dest))
}
function scripts() {
    //обработка скриптов
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(size({
            showFiles: true
        }))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browsersync.stream())

}

function watch() {
    browsersync.init({
        server: {
            baseDir: './dist'
        }
    })
    gulp.watch(paths.html.dest).on('change', browsersync.reload)
    gulp.watch(paths.html.src, html)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
}


function clean() {
    //удаление файлов
    return del(['dist','!dist/img'])
}

const build = gulp.series(clean, gulp.parallel(styles, scripts, img, html), watch)  //последовательное выполнение спика задач

//модули
exports.clean = clean
exports.img = img
exports.styles = styles
exports.html = html
exports.scripts = scripts
exports.watch = watch
exports.build = build
exports.default = build