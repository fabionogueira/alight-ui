//carrega o gulp e os plugins
var gulp   = require('gulp');
var uglify = require('gulp-uglify');
var cssnano= require('gulp-cssnano');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');

//Arquivos que serão concatenados
var al_files = [
    "./../src/al.ui.js",
    "./../src/al.ui.alert.js",
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
    "./../src/directives/ngModel.js",
    "./../src/ui/ui-modal.js",
    "./../src/ui/ui-datepicker.js"
];

var dist_folder = './../dist/';
var version = '0.0.1';

//checa o código de todos os arquivos que serão concatenados
gulp.task('al-check', function(){
    return gulp.src(al_files)
        .pipe(jshint())
        .pipe(jshint
        .reporter('default'));
});

    
//cria al.ui.js
gulp.task('al-ui', ['al-check'], function(){
    return gulp.src(al_files)
        .pipe(concat('al.ui.js'))
        .pipe(gulp.dest(dist_folder));
});

//cria al.ui.min.js
gulp.task('al-ui-min', ['al-ui'], function () {
    return gulp.src(dist_folder+'al.ui.js')
        .pipe(rename('al.ui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dist_folder));
});

//cria al.ui.css
gulp.task('al-ui-css', function(){
    return gulp.src(['./../src/al.ui.css'])
        .pipe(cssnano({discardComments: {removeAll: true}}))
        .pipe(gulp.dest(dist_folder));
});

gulp.task('copy-env', function(){
    return gulp.src(['./../env.js']).pipe(gulp.dest(dist_folder));
});

gulp.task('jshint1', function(){
    //checa se o arquivo al.ui.js contém erro
    return gulp.src([dist_folder+'al.ui.js']).pipe(jshint()).pipe(jshint.reporter('default'));
});

gulp.task('jshint2', function(){
    //checa se o arquivo al.ui.js contém erro
    return gulp.src([dist_folder+'al.ui.min.js']).pipe(jshint()).pipe(jshint.reporter('default'));
});

gulp.task('default', ['al-ui-min', 'al-ui-css', 'copy-env']);
