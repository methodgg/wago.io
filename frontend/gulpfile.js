var gulp = require('gulp');
var scanner = require('i18next-scanner');

gulp.task('i18next', function() {
  return gulp.src(['src/**/*.vue'])
      .pipe(scanner({
          lngs: ['en-US'], // supported languages
          ns: ['translation', 'error'],
          attr: {
            list: ['data-i18n'],
            extensions: ['.html', '.vue']
          },
          func: {
              list: ['i18next.t', 't', '$t'],
              extensions: ['.js', '.vue']
          },
          resource: {
            // the source path is relative to current working directory
            loadPath: 'static/i18n/{{lng}}/{{ns}}.json',

            // the destination path is relative to your `gulp.dest()` path
            savePath: 'i18n/{{lng}}/{{ns}}.json'
          }
      }))
      .pipe(gulp.dest('static'))
});

gulp.task('default', gulp.series('i18next', function(done) { 
  // default task code here
  done()
}))