var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    template = require('./dist/core/monkey').default,
    plumber = require('gulp-plumber'),
    tsProject = ts.createProject('tsconfig.json');

function getSrcPath(src) {
    if (process.argv.length < 3) {
        return src;
    }
    src = process.argv[2].substr(7).replace(__dirname + '\\', '').replace('\\', '/');
    return src;
}

function getDistFolder(dist) {
    if (process.argv.length < 3) {
        return dist;
    }
    return 'dist';
}
    
gulp.task('default', async() => {
    await gulp.src(getSrcPath('src/**/*.ts'))
        .pipe(plumber({
            errorHandler() {
                this.emit('end');
            }
        }))
        .pipe(template())
        .pipe(tsProject())
        .pipe(gulp.dest(getDistFolder('dist/')));
});