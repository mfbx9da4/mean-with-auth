module.exports = function (config) {
    config.set({
        basePath: '',
        files: [
            'public/js/lib/lib.js',
            '../node_modules/angular-mocks/angular-mocks.js',
            'public/js/app.js',
            'test/*.js',
        ],

        frameworks: ['jasmine'],

        reporters: ['progress', 'mocha', 'coverage'],

        mochaReporter: {
            output: 'full'
        },

        preprocessors: {
          'public/js/*.js': ['coverage']
        },

        coverageReporter: {
          dir: 'coverage',
          reporters: [
            { type: 'lcov', subdir: 'report-lcov' },
          ]
        },

        colors: true,

        browsers: ['PhantomJS'],

        singleRun: false,
        autoWatch: true
    });
};
