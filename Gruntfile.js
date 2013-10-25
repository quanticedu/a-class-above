module.exports = function(grunt) {
    

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                options: {
                    frameworks: ['jasmine'],
                    browsers: ['Chrome'],
                    singleRun: false,
                    autoWatch: true,
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
              "spec/**/*.js", "scripts/**/*.js", "doc.md"
            ],            
            options: {
              "out": "doc/",
              "index": 'doc.md'
            }
          }
    });

    grunt.loadNpmTasks('grunt-groc');
    grunt.loadNpmTasks('grunt-karma');
    grunt.registerTask('default', ['karma']);
};
