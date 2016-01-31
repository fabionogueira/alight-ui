
//carrega o gulp e os plugins
var gulp   = require('gulp');
var uglify = require('gulp-uglify');
var cssnano= require('gulp-cssnano');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var header = require("gulp-header");

var dist_folder = './../dist/';

var al_core = {
    name  : "al.core",
    source: [
        "./../src/al.core.js",
        "./../src/al.alert.js",
        "./../src/services/HttpService.js",
        "./../src/services/ModuleService.js",
        "./../src/services/ValidatorService.js",
        "./../src/factories/HttpFactory.js",
        "./../src/directives/al-name.js",
        "./../src/directives/al-disabled.js",
        "./../src/directives/al-hide.js",
        "./../src/directives/al-module.js"
    ]
};
var al_directives = {
    name  : "al.directives",
    source: [
        "./../src/directives/al-include-cache.js",
        "./../src/directives/al-mask.js",
        "./../src/directives/al-model.js"
    ]
};
var al_ui = {
    name  : "al.ui",
    source: [
        "./../src/ui/ui-modal.js",
        "./../src/ui/ui-datepicker.js",
        "./../src/ui/ui-pagination.js",
        "./../src/ui/ui-tabs.js"
    ]
};

function concatFiles(config){
    var dist = dist_folder + (config.dest||'');
    
    gulp.task(config.name, function(){
        return gulp.src(config.source)
            .pipe(concat(config.name+'.js'))
            .pipe(gulp.dest(dist));
    });

    gulp.task(config.name+'.min', [config.name], function () {
        return gulp.src(dist + config.name + '.js' )
            .pipe(rename(config.name + '.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest(dist));
    });
}

//checa o código de todos os arquivos que serão concatenados
gulp.task('check-all', function(){
    return gulp.src(al_core.source.concat(al_ui.source, al_directives.source))
        .pipe(jshint())
        .pipe(jshint
        .reporter('default'));
});

//minifica al.core.css
gulp.task('al.core.css', function(){
    return gulp.src(['./../src/al.core.css'])
        .pipe(cssnano({discardComments: {removeAll: true}}))
        .pipe(gulp.dest(dist_folder));
});

//minifica al.ui.css
gulp.task('al.ui.css', function(){
    return gulp.src(['./../src/ui/al.ui.css'])
        .pipe(cssnano({discardComments: {removeAll: true}}))
        .pipe(gulp.dest(dist_folder));
});

//copia env.js
gulp.task('copy-env', function(){
    return gulp.src(['./../src/env.js']).pipe(gulp.dest(dist_folder));
});

//adiciona o copyright nos arquivos al.core.js, al.core.min.js
//gulp.task('copyright', ['al-core-min'], function () {
//    gulp.src([dist_folder+'al.core.min.js', dist_folder+'al.core.js'])
//        .pipe(header(copyright))
//        .pipe(gulp.dest(dist_folder));
//});

concatFiles(al_core);
concatFiles(al_ui);
concatFiles(al_directives);

gulp.task('default', ['al.core.min', 'al.ui.min', 'al.directives.min', 'al.core.css', 'al.ui.css', 'copy-env']);
