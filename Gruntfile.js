module.exports = function(grunt) {
    

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                options: {
                    frameworks: ['jasmine'],
                    browsers: ['Chrome'],
                    singleRun: true,
                    files: [
                        'karma/phantomjs-hacks.js',
                        'bower_components/angular/angular.js',
                        'bower_components/angular-mocks/angular-mocks.js',
                        'scripts/a_class_above.js', 
                        'scripts/**/*.js',
                        'spec/**/*.js']
                }
            }
        },
        
        groc: {
            javascript: [
              "scripts/**/*.js", "README.md"
            ],
            options: {
              "out": "doc/"
            }
          }
    });

    grunt.loadNpmTasks('grunt-groc');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('default', ['karma']);
};
