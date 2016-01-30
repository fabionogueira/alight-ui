
//carrega o gulp e os plugins
var gulp   = require('gulp');
var uglify = require('gulp-uglify');
var cssnano= require('gulp-cssnano');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var header = require("gulp-header");

var al_version = '0.0.1';
var dist_folder = './../dist/';
var copyright = '/**\n'+
                ' * AlightUI '+al_version+'\n'+
                ' * 2016-01-30, (c) 2016 Fábio Nogueira\n'+
                ' * Released under the MIT License.\n'+
                ' * Full source at https://github.com/fabionogueira/alight-ui\n'+
                '*/\n';

//Arquivos que serão concatenados em al.ui.js
var al_files = {
    core: [
        "./../src/al.core.js",
        "./../src/al.alert.js",
        "./../src/services/HttpService.js",
        "./../src/services/ModuleService.js",
        "./../src/services/ValidatorService.js",
        "./../src/factories/HttpFactory.js",
        "./../src/directives/ngName.js",
        "./../src/directives/ngMask.js",
        "./../src/directives/ngDisabled.js",
        "./../src/directives/ngHide.js",
        "./../src/directives/ngIncludeCache.js",
        "./../src/directives/ngModule.js",
        "./../src/directives/ngModel.js"],
    ui: [
        "./../src/ui/ui-modal.js",
        "./../src/ui/ui-datepicker.js"]
};

//checa o código de todos os arquivos que serão concatenados
gulp.task('al-check', function(){
    return gulp.src(al_files.core.concat(al_files.ui))
        .pipe(jshint())
        .pipe(jshint
        .reporter('default'));
});

//cria al.core.js
gulp.task('al-core', ['al-check'], function(){
    return gulp.src(al_files.core)
        .pipe(concat('al.core.js'))
        .pipe(gulp.dest(dist_folder));
});

//cria al.ui.js
gulp.task('al-ui', ['al-check'], function(){
    return gulp.src(al_files.ui)
        .pipe(concat('al.ui.js'))
        .pipe(gulp.dest(dist_folder));
});

//cria al.core.min.js
gulp.task('al-core-min', ['al-core'], function () {
    return gulp.src(dist_folder+'al.core.js')
        .pipe(rename('al.core.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist_folder));
});

//cria al.ui.min.js
gulp.task('al-ui-min', ['al-ui'], function () {
    return gulp.src(dist_folder+'al.ui.js')
        .pipe(rename('al.ui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist_folder));
});

//minifica al.core.css
gulp.task('al-core-css', function(){
    return gulp.src(['./../src/al.core.css'])
        .pipe(cssnano({discardComments: {removeAll: true}}))
        .pipe(gulp.dest(dist_folder));
});

//minifica al.ui.css
gulp.task('al-ui-css', function(){
    return gulp.src(['./../src/ui/al.ui.css'])
        .pipe(cssnano({discardComments: {removeAll: true}}))
        .pipe(gulp.dest(dist_folder));
});

//copia env.js
gulp.task('copy-env', function(){
    return gulp.src(['./../env.js']).pipe(gulp.dest(dist_folder));
});

//adiciona o copyright nos arquivos al.core.js, al.core.min.js
gulp.task('copyright', ['al-core-min'], function () {
    gulp.src([dist_folder+'al.core.min.js', dist_folder+'al.core.js'])
        .pipe(header(copyright))
        .pipe(gulp.dest(dist_folder));
});

gulp.task('default', ['al-core-min', 'al-ui-min', 'copyright', 'al-core-css', 'al-ui-css', 'copy-env']);
