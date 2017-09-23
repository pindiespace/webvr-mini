    // Gulp.js configuration

    // http://khaidoan.wikidot.com/gulp-page2

    'use strict'

    // Build env.

    const os = require( 'os' );

    // Source and build folders.

    var plat = '',

    oskey = os.platform();

    switch ( os.platform() ) {

        case 'win32': // windows xampp

            plat =  'dist/';

            break;

        case 'darwin' : // mac bitnami wordpress module

            plat = 'dist/';

            break;

        case  'freebsd' : // freeBSD

            plat = 'dist/';

            break;

        case 'linux' :  //linux

            plat = 'dist/';

            break;

        default: 

            plat = 'dist/';

            break;

    };

    console.log( 'Platform is:' + oskey );

    console.log( 'using:' + plat );

    const dir = {

        src: 'src/',

        build: plat

    },

    // Gulp plugins.

    gulp          = require('gulp'),
    gutil         = require('gulp-util'),
    newer         = require('gulp-newer'),
    imagemin      = require('gulp-imagemin'),
    sass          = require('gulp-sass'),
    postcss       = require('gulp-postcss'),
    autoprefixer  = require('gulp-autoprefixer'),
    cssnano       = require('gulp-cssnano'),
    csscomb       = require('gulp-csscomb'),
    deporder      = require('gulp-deporder'),
    concat        = require('gulp-concat'),
    stripdebug    = require('gulp-strip-debug'),
    babel         = require('gulp-babel'),
    uglify        = require('gulp-uglify');

    // Browsersync config

    var browsersync = false;

    /* 
     * ====================================
     * TASK CONFIG
     * ====================================
     */

    // JS copy settings.

    const es6 = {

        src: dir.src + 'es6/**/*',

        build:  dir.build

    };

    // Font copy settings.

    const fonts = {

        src: dir.src + 'fonts/**/*',

        build: dir.build + 'fonts/'

    };

    // Image copy settings.

    const images = {

        src: dir.src + 'img/**/*',

        build: dir.build + 'img/'

    };

    // HTML copy settings.

    const html = {

        src: dir.src + 'html/**/*',

        build: dir.build

    }

    // SASS->CSS processing configuration.

    var css = {

      src         : dir.src + 'scss/style.scss',

      watch       : dir.src + 'scss/**/*',

      build       : dir.build + 'css',

      sassOpts: {

        compress: true, 

        outputStyle: 'compressed',

        //outputStyle     : 'nested',

        imagePath       : img.build,

        precision       : 3,

        errLogToConsole : true

      }, 

      processors: [

        require( 'postcss-assets' ) ( {

          loadPaths: [ 'images/' ],

          basePath: dir.build,

          baseUrl: '/'

        }),

        require( 'autoprefixer' ) ( {

          browsers: ['last 3 versions', '> 2%']

        } ),

        require('css-mqpacker') (),

        require( 'cssnano' ) ( {

          autoprefixer: autoprefixer,

          comments: { removeAllButFirst: true }

          //discardComments: {removeAllButFirst: true},

        } ) ,

        require( 'csscomb' )

      ]

    };

    // JavaScript settings.

    const js = {

      src         : es6.src,

      build       : es6.build,

      filename    : 'webvr-mini.js'

    };

    /* 
     * ====================================
     * TASKS
     * ====================================
     */

    // Languages folder copy task.

    gulp.task( 'fonts', () => {

        return gulp.src( fonts.src )

        .pipe( newer( fonts.build ) )

        .pipe( gulp.dest( fonts.build ) );

    } );

    // Languages folder copy task.

    gulp.task( 'html', () => {

        return gulp.src( html.src )

        .pipe( newer( html.build ) )

        .pipe( gulp.dest( html.build ) );


    } );

    // CSS image copy task.

    gulp.task( 'images', () => {

        return gulp.src( images.src )

        .pipe( newer( images.build ) )

        .pipe( imagemin() )

        .pipe( gulp.dest( images.build ) );

    } );

    // CSS processing.

    gulp.task( 'css', [ 'images' ], () => {

      return gulp.src( css.src )

        .pipe(sass( css.sassOpts) )

        .pipe(postcss( css.processors ) )

        .pipe(gulp.dest( css.build ) )

        .pipe(browsersync ? browsersync.reload( { stream: true } ) : gutil.noop() );

    });

    // JavaScript processing.

    gulp.task('js', () => {

      return gulp.src( js.src )

        // See config for deporder - https://github.com/mkleehammer/gulp-deporder

        .pipe( deporder() )

        .pipe( concat( js.filename ) )

        .pipe( stripdebug() )

        .pipe(babel( {

                presets: [ 'es2015' ]

        } ) )

        .pipe( uglify() )

        .pipe( gulp.dest( js.build ) )

        .pipe( browsersync ? browsersync.reload( { stream: true } ) : gutil.noop() );

    });

    // Watch for CSS, JS changes

    // Browsersync options

    const syncOpts = {

      proxy       : 'localhost:8080/',

      files       : dir.build + '**/*',

      open        : false,

      notify      : false,

      ghostMode   : false,

      ui: {

        port: 8080

      }

    };

    // browser-sync

    gulp.task( 'browsersync', () => {

      if ( browsersync === false ) {

        browsersync = require( 'browser-sync' ).create();

        browsersync.init( syncOpts );

      }

    });

    gulp.task( 'watch', ['browsersync'], () => {

      // ES6 page changes.

      gulp.watch( es6.src, ['es6'], browsersync ? browsersync.reload : {} );

      // image changes.

      gulp.watch( images.src, [ 'img' ] );

        // CSS changes.

      gulp.watch( css.watch, [ 'scss' ] );

      // Fonts changes.

      gulp.watch( fonts.src, [ 'fonts'] );

      // Language changes.

      gulp.watch( languages.src, [ 'html' ] );

    });

    // default task

    gulp.task( 'default', [ 'build', 'watch' ] );

    // run all tasks

    gulp.task( 'build', [ 'js', 'images', 'css', 'js', 'fonts', 'html' ] );

