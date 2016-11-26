

module.exports = function(grunt) {

    grunt.initConfig({
        pot: {
            options: {
                text_domain: 'lang',
                dest: './locale/id_ID/LC_MESSAGES/',
                keywords: [
                    '_:1',
                    'gettext:1'
                ]
            },
            files: {
                src:  [ 
                    '**/*.php',
                    '!node_modules/**/*.php',
                    '!vendor/**/*.php'
                ],
                expand: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-pot')

};