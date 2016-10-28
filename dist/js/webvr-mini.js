/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(3);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/*
	 * app.js
	 * main entry point for this application. Uses 
	 * ES5 syntax (es6 will be transpiled). Central 
	 * point for including both ES5 and ES6 libraries.
	 */
	console.log( 'in app.js' );

	// DEV ENVIRONMENT.

	var env = process.env.WEBPACK_ENV;

	// REQUIRE ALL .es6 files.

	var vrmini = __webpack_require__( 3 );

	// Check ES6 module structure.

	for (var i in vrmini ) {

	    console.log( i + ":" + vrmini[i] );
	}

	/* 
	 * these variables are defined by webpack inputs in package.json, 
	 * and processed to __DEV__ and __RELEASE__ here.
	 * "build": "cross-env BUILD_RELEASE=true BUILD_DEV=false webpack --config webpack-production.config.js -p -p",
	 * "dev": "cross-env BUILD_RELEASE=false BUILD_DEV=true webpack",
	 */

	if ( true ) {

	    console.warn('app.js: in development mode...');

	} else if ( __RELEASE__ === 'true' ) {

	    console.warn('in release mode');

	}

	// EXPOSE IN BROWSER WINDOW OBJECT

	window.vrmini = vrmini;

	console.log("Window.vrmini:" + vrmini );




	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.world = exports.webvr = exports.prim = exports.loadVideo = exports.loadAudio = exports.loadTexture = exports.loadModel = exports.webgl = exports.util = undefined;

	var _util = __webpack_require__(4);

	var _util2 = _interopRequireDefault(_util);

	var _webgl = __webpack_require__(5);

	var _webgl2 = _interopRequireDefault(_webgl);

	var _webvr = __webpack_require__(6);

	var _webvr2 = _interopRequireDefault(_webvr);

	var _loadTexture = __webpack_require__(7);

	var _loadTexture2 = _interopRequireDefault(_loadTexture);

	var _loadModel = __webpack_require__(9);

	var _loadModel2 = _interopRequireDefault(_loadModel);

	var _loadAudio = __webpack_require__(10);

	var _loadAudio2 = _interopRequireDefault(_loadAudio);

	var _loadVideo = __webpack_require__(11);

	var _loadVideo2 = _interopRequireDefault(_loadVideo);

	var _loadFont = __webpack_require__(12);

	var _loadFont2 = _interopRequireDefault(_loadFont);

	var _shaderTexture = __webpack_require__(13);

	var _shaderTexture2 = _interopRequireDefault(_shaderTexture);

	var _shaderColor = __webpack_require__(15);

	var _shaderColor2 = _interopRequireDefault(_shaderColor);

	var _shaderDirlightTexture = __webpack_require__(16);

	var _shaderDirlightTexture2 = _interopRequireDefault(_shaderDirlightTexture);

	var _shaderWater = __webpack_require__(17);

	var _shaderWater2 = _interopRequireDefault(_shaderWater);

	var _shaderMetal = __webpack_require__(18);

	var _shaderMetal2 = _interopRequireDefault(_shaderMetal);

	var _renderer = __webpack_require__(19);

	var _renderer2 = _interopRequireDefault(_renderer);

	var _prim = __webpack_require__(20);

	var _prim2 = _interopRequireDefault(_prim);

	var _world = __webpack_require__(21);

	var _world2 = _interopRequireDefault(_world);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	 * app.es6
	 * es6 entry point, transpiled (via BabelJS) to ES5.
	 */

	console.log('in es6');

	// DEV ENVIRONMENT

	var env = process.env.WEBPACK_ENV;

	// REQUIRE ALL POLYFILLS

	// WebGL math library.

	var glMatrix = __webpack_require__(22);

	if (!glMatrix) {

	    console.error('gl-matrix could\'nt be loaded...');
	} else {

	    console.log('loaded gl-matrix');
	}

	// Import WebVR-Mini libraries. Note: if you don't use super() imports will fail!

	//import Loader from './load-pool';

	// import Shader from './Shader';

	// Collects the shaders in one place.

	// All objects.

	// Import the world (variable object, changes with each VR world).

	// Init Util first to create shortcuts.

	var util = new _util2.default();

	// If we are in dev mode, load any special libraries.

	var webgl = null;

	if (true) {

	    console.log('app.es6: in development mode');

	    // require kronos webgl debug from node_modules
	    // https://github.com/vorg/webgl-debug

	    var debug = __webpack_require__(32);

	    exports.webgl = webgl = new _webgl2.default(false, glMatrix, util, debug);

	    if (debug) {

	        console.log('Loading webgl-debug');
	    } else {

	        console.log('Error loading webgl-debug');
	    }
	} else if (__RELEASE__ === 'true') {

	    // Code only added to release.

	    exports.webgl = webgl = new _webgl2.default(false, glMatrix, util);
	}

	// WebVR needs WebGL.

	var webvr = new _webvr2.default(false, util, glMatrix, webgl);

	// The Prim object needs Loaders.

	var loadModel = new _loadModel2.default(true, util, glMatrix, webgl);

	var loadTexture = new _loadTexture2.default(true, util, glMatrix, webgl);

	var loadAudio = new _loadAudio2.default(true, util, glMatrix, webgl);

	var loadVideo = new _loadVideo2.default(true, util, glMatrix, webgl);

	var loadFont = new _loadFont2.default(true, util, glMatrix, webgl);

	var prim = new _prim2.default(true, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo);

	var shaderTexture = new _shaderTexture2.default(true, util, glMatrix, webgl, prim);

	var shaderColor = new _shaderColor2.default(true, util, glMatrix, webgl, prim);

	var shaderDirlightTexture = new _shaderDirlightTexture2.default(true, util, glMatrix, webgl, prim);

	var renderer = new _renderer2.default(true, util, glMatrix, webgl, shaderTexture, shaderColor, shaderDirlightTexture);

	// Create the world, which needs WebGL, WebVR, and Prim.

	var world = new _world2.default(webgl, prim, renderer, shaderTexture, shaderColor);

	// Export our classes to app.js.

	exports.util = util;
	exports.webgl = webgl;
	exports.loadModel = loadModel;
	exports.loadTexture = loadTexture;
	exports.loadAudio = loadAudio;
	exports.loadVideo = loadVideo;
	exports.prim = prim;
	exports.webvr = webvr;
	exports.world = world;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Util = function () {
	    function Util() {
	        _classCallCheck(this, Util);

	        console.log('in Util');
	    }

	    // Confirm we have a string (after lodash)


	    _createClass(Util, [{
	        key: 'isString',
	        value: function isString(str) {

	            return typeof str == 'string' || isObjectLike(str) && objToString.call(str) == stringTag || false;
	        }

	        // See if we're running in an iframe.

	    }, {
	        key: 'isIFrame',
	        value: function isIFrame() {

	            try {

	                return window.self !== window.top;
	            } catch (e) {

	                return true;
	            }

	            return false;
	        }
	    }, {
	        key: 'isPowerOfTwo',
	        value: function isPowerOfTwo(n) {

	            return (n & n - 1) === 0;
	        }
	    }, {
	        key: 'degToRad',
	        value: function degToRad(degrees) {

	            return degrees * Math.PI / 180;
	        }
	    }, {
	        key: 'getRand',
	        value: function getRand(min, max) {

	            if (max === undefined) {

	                max = min;

	                min = 0;
	            }

	            return min + Math.random() * (max - min);
	        }
	    }, {
	        key: 'getRandInt',
	        value: function getRandInt(range) {

	            return Math.floor(Math.random() * range);
	        }
	    }, {
	        key: 'getFileExtension',
	        value: function getFileExtension(fname) {

	            return fname.slice((fname.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
	        }

	        /** 
	         * Check the values of a Prim.
	         */

	    }, {
	        key: 'primReadout',
	        value: function primReadout(prim) {

	            console.log('prim:' + prim.name + 'type:' + prim.type + ' vertex:' + prim.geometry.vertices.itemSize + ', ' + prim.geometry.vertices.numItems + ', texture:' + prim.geometry.texCoords.itemSize + ', ' + prim.geometry.texCoords.numItems + ', index:' + prim.geometry.indices.itemSize, ', ' + prim.geometry.indices.numItems + ', normals:' + prim.geometry.normals.itemSize + ', ' + prim.geometry.normals.numItems);
	        }
	    }]);

	    return Util;
	}();

	exports.default = Util;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WebGL = function () {

	        /**
	         * References:
	         * LiteGL
	         * @link https://github.com/jagenjo/litegl.js/tree/master/src
	         * GL Tutorial: http://webglfundamentals.org
	         * HTML5 Games code: http://www.wiley.com/WileyCDA/WileyTitle/productCd-1119975085.html
	         * Best Practices
	         * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
	         * WebGL tests:
	         * @link https://www.browserleaks.com/webgl
	         * WebGL cross-browser:
	         * @link http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
	         * Great WebGL Examples:
	         * http://alteredqualia.com/
	         * Toji: https://github.com/toji/webvr-samples
	         * TWGL: @link http://twgljs.org/
	         * @constructor
	         * @param {Object} config a configuration object, set in app.js.
	         */

	        function WebGL(init, glMatrix, util, debug) {
	                _classCallCheck(this, WebGL);

	                console.log('in webGL class');

	                this.gl = null;

	                this.contextCount = 0;

	                this.glVers = 0;

	                this.glMatrix = glMatrix;

	                this.util = util;

	                if (init === true) {

	                        this.init(canvas);
	                }

	                // If we are running in debug mode, save the debug utils into this object.

	                if (debug) {

	                        this.debug = debug;
	                }
	        }

	        /** 
	         * Clear textures from the videocard before starting.
	         */


	        _createClass(WebGL, [{
	                key: 'clearTextures',
	                value: function clearTextures() {

	                        var gl = this.gl;

	                        var len = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

	                        for (var i = 0; i < len; i++) {

	                                gl.activeTexture(gl.TEXTURE0 + i);

	                                gl.bindTexture(gl.TEXTURE_2D, null);

	                                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	                        }

	                        gl.bindBuffer(gl.ARRAY_BUFFER, null);

	                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	                        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

	                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	                }

	                /**
	                 * initialize with a canvas context
	                 * @param {HTMLCanvasElement|String|undefined} canvas a HTML5 <canvas>, id for canvas, or undefined, 
	                 * in which case a <canvas> object is 
	                 * created and added to document.body, an ID value for a tag, or a CanvasDOMobject.
	                 * @param {Function} lostContext callback when WebGL context is lost.
	                 * @param {Function} restoredContext callback when WebGL context is restored.
	                 * @returns {WebGLContext} the WebGL context of the <canvas> object.
	                 */

	        }, {
	                key: 'init',
	                value: function init(canvas, lostContext, restoredContext) {
	                        var _this = this;

	                        if (!canvas) {

	                                canvas = document.createElement('canvas');

	                                canvas.width = 480;

	                                canvas.height = 320;

	                                // This seems to fix a bug in IE 11. TODO: remove extra empty <canvas>.

	                                document.body.appendChild(canvas);
	                        } else if (this.util.isString(canvas)) {

	                                canvas = document.getElementById(canvas);
	                        } else {

	                                canvas = canvas;
	                        }

	                        if (canvas) {

	                                // NOTE: IE10 needs this bound to DOM for the following command to work.

	                                var r = canvas.getBoundingClientRect();

	                                canvas.width = r.width;

	                                canvas.height = r.height;

	                                this.gl = this.createContext(canvas);

	                                if (this.gl) {

	                                        var gl = this.gl;

	                                        /* 
	                                         * Set up listeners for context lost and regained.
	                                         * @link https://www.khronos.org/webgl/wiki/HandlingContextLost
	                                         * Simulate lost and restored context events with:
	                                         * @link https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/restoreContext
	                                         * @link http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
	                                         * gl.isContextLost() also works to check
	                                         */

	                                        canvas.addEventListener('webglcontextlost', function (e) {

	                                                console.error('error: webglcontextlost event, context count:' + _this.contextCount);

	                                                if (lostContext) {

	                                                        _this.gl = null;

	                                                        lostContext(e);
	                                                }

	                                                e.preventDefault();
	                                        }, false);

	                                        canvas.addEventListener('webglcontextrestored', function (e) {

	                                                console.error('error: webglcontextrestored event, context count:' + _this.contextCount);

	                                                if (restoredContext) {

	                                                        restoredContext(e);
	                                                }

	                                                e.preventDefault();
	                                        }, false);

	                                        // Do an initial set of our viewport width and height.

	                                        gl.viewportWidth = canvas.width;

	                                        gl.viewportHeight = canvas.height;

	                                        // listen for <canvas> resize event.

	                                        window.addEventListener('resize', function (e) {

	                                                _this.resizeCanvas();

	                                                e.preventDefault();
	                                        }, false);

	                                        // Default WebGL initializtion and stats, can be over-ridden in your world file.

	                                        if (gl.getParameter && gl.getShaderPrecisionFormat) {

	                                                this.stats = {};

	                                                var stats = this.stats;

	                                                // Check if high precision supported in fragment shader.

	                                                stats.highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision;

	                                                // Max texture size, for gl.texImage2D.                

	                                                stats.maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

	                                                // Max cubemap size, for gl.texImage2D.

	                                                stats.maxCubeSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

	                                                // Max texture size, for gl.renderbufferStorage and canvas width/height.

	                                                stats.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);

	                                                // Max texture units.

	                                                stats.combinedUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

	                                                // Max vertex buffers.

	                                                stats.maxVSattribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

	                                                // Max 4-byte uniforms.

	                                                stats.maxVertexShader = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);

	                                                // Max 4-byte uniforms.

	                                                stats.maxFragmentShader = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
	                                        } else {

	                                                this.stats = false;
	                                        }

	                                        // If we're reloading, clear all current textures in the texture buffers.

	                                        this.clearTextures();

	                                        // Default 3D enables.

	                                        gl.enable(gl.DEPTH_TEST);

	                                        gl.enable(gl.CULL_FACE);

	                                        gl.clearDepth(1.0); // Clear everything

	                                        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

	                                        gl.enable(gl.BLEND); // Allow blending

	                                        // Fog NOT in Webgl use shader
	                                        //http://www.geeks3d.com/20100228/fog-in-glsl-webgl/
	                                        // http://in2gpu.com/2014/07/22/create-fog-shader/
	                                        //gl.enable( gl.FOG );

	                                        // set this for individual objects 
	                                        //gl.blendFunc( gl.SRC_ALPHA, gl.ONE );

	                                        /* 
	                                         * IMPORTANT: tells WebGL to premultiply alphas for <canvas>
	                                         * @link http://stackoverflow.com/questions/39251254/avoid-cpu-side-conversion-with-teximage2d-in-firefox
	                                         */
	                                        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

	                                        gl.clearColor(0.1, 0.1, 0.1, 1.0);

	                                        return this.gl;
	                                } // end of have a gl context

	                                //return this.gl;
	                        } // end of if have a <canvas>

	                        return null;
	                }
	        }, {
	                key: 'stats',
	                value: function stats() {}

	                /** 
	                 * check if we are ready to render
	                 */

	        }, {
	                key: 'ready',
	                value: function ready() {

	                        var gl = this.gl;

	                        //////////////////////////////////console.log('webgl.ready(): this.gl:' + gl + ' this.glMatrix:' + this.glMatrix )

	                        return !!(gl && this.glMatrix);
	                }

	                /** 
	                 * Clear the screen prior to redraw.
	                 */

	        }, {
	                key: 'clear',
	                value: function clear() {

	                        var gl = this.gl;

	                        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	                        /////////////////////gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );
	                }

	                /** 
	                 * Get WebGL canvas only if we've created a gl context.
	                 * @returns {HTMLCanvasElement} canvas the rendering <canvas>.
	                 */

	        }, {
	                key: 'getCanvas',
	                value: function getCanvas() {

	                        return this.gl ? this.gl.canvas : null;
	                }

	                /** 
	                 * Resize the canvas if the window changes size. 
	                 * NOTE: affected by CSS styles.
	                 * TODO: check current CSS style.
	                 * (TWGL)
	                 */

	        }, {
	                key: 'resizeCanvas',
	                value: function resizeCanvas() {

	                        if (this.ready()) {

	                                var f = Math.max(window.devicePixelRatio, 1);

	                                var gl = this.getContext();

	                                var c = this.getCanvas();

	                                var width = c.clientWidth * f | 0;

	                                var height = c.clientHeight * f | 0;

	                                if (c.width !== width || c.height !== height) {

	                                        c.width = width;

	                                        c.height = height;

	                                        gl.viewportWidth = c.width;

	                                        gl.viewportHeight = c.height;

	                                        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

	                                        return true;
	                                }
	                        }

	                        return false;
	                }

	                /** 
	                 * get HTML5 canvas, and a WebGL context. We also scan for multiple 
	                 * contexts being created ( > 1 ) and delete if one is already present.
	                 * @param {Canvas} canvas the HTML5 <canvas> DOM element.
	                 * TODO: PROBLEM IF THERE ARE MULTIPLE CONTEXES ON THE PAGE???????
	                 * @param {HTMLCanvasElement} canvas the rendering <canvas>.
	                 * @returns {WebGLRenderingContext} gl a WebGLRenderingContext.
	                 */

	        }, {
	                key: 'createContext',
	                value: function createContext(canvas) {

	                        if (!window.WebGLRenderingContext) {

	                                console.error('this browser does not support webgl');

	                                return null;
	                        }

	                        var gl = null;

	                        if (gl && this.contextCount > 1) {

	                                // Contexts are normally in garbage, can't be deleted without this!

	                                console.warn('killing context');

	                                this.killContext();

	                                this.contextCount--;

	                                this.gl = null; // just in case
	                        }

	                        var n = ['webgl2', 'experimental-webgl2', 'webgl', 'experimental-webgl'];

	                        var i = 0;

	                        while (i < n.length) {

	                                try {

	                                        if (this.debug) {

	                                                gl = this.debug.makeDebugContext(canvas.getContext(n[i]));

	                                                if (gl) {

	                                                        console.warn('using debug context');

	                                                        break;
	                                                }
	                                        } else {

	                                                gl = canvas.getContext(n[i]);

	                                                if (gl) {

	                                                        console.warn('using release context mode');

	                                                        break;
	                                                }
	                                        }
	                                } catch (e) {

	                                        console.warn('failed to load context:' + n[i]);
	                                }

	                                i++;
	                        } // end of while loop


	                        /*
	                         * If we got a context, assign WebGL version. Note that some 
	                         * experimental versions don't have .getParameter
	                         */

	                        if (gl && typeof gl.getParameter == 'function') {

	                                this.contextCount++;

	                                this.gl = gl;

	                                // Check if this is a full WebGL2 stack

	                                this.glVers = gl.getParameter(gl.VERSION).toLowerCase();

	                                if (i == 1 || i == 3) {

	                                        console.warn('experimental context, .getParameter() may not work');
	                                }

	                                console.log('version:' + gl.getParameter(gl.VERSION));

	                                // Take action, depending on version.

	                                switch (i) {

	                                        case 0:
	                                        case 1:
	                                                //if ( ! gl.TRANSFORM_FEEDBACK ) {
	                                                // revert to 1.0
	                                                //    console.log("TRANSFORM FEEDBACK NOT SUPPORTED")
	                                                //}
	                                                this.glVers = 2.0;
	                                                break;

	                                        case 2:
	                                        case 3:
	                                                this.glVers = 1.0;
	                                                this.addVertexBufferSupport(gl);
	                                                break;

	                                        default:
	                                                break;

	                                }
	                        }

	                        return this.gl;
	                }

	                /** 
	                 * Return the current context.
	                 * @returns {WebGLRenderingContext} gl a WebGLRenderingContext.
	                 */

	        }, {
	                key: 'getContext',
	                value: function getContext() {

	                        if (!this.gl) {

	                                console.warn('warning webgl context not initialized');
	                        }

	                        return this.gl;
	                }

	                /** 
	                 * Kill the current context (complete reset will be needed). Also use to debug 
	                 * when context is lost, and has to be rebuilt.
	                 * @link http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/
	                 * @link https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext
	                 */

	        }, {
	                key: 'killContext',
	                value: function killContext() {

	                        console.log('in killcontext, count:' + this.contextCount);

	                        if (this.contextCount) {

	                                console.log('killing WebGL context, count before:' + this.contextCount);

	                                this.gl.getExtension('WEBGL_lose_context').loseContext();

	                                this.contextCount--;
	                        }
	                }

	                /** 
	                 * Add vertex buffer support to WebGL 1.0
	                 * @param {WebGLRenderingContext} gl a WebGL rendering context (should be 1.x only)l
	                 */

	        }, {
	                key: 'addVertexBufferSupport',
	                value: function addVertexBufferSupport(gl) {

	                        var ext = gl.getExtension('OES_vertex_array_object');

	                        if (ext) {

	                                gl.createVertexArray = function () {

	                                        return ext.createVertexArrayOES();
	                                };

	                                gl.deleteVertexArray = function (v) {

	                                        ext.deleteVertexArrayOES(v);
	                                };

	                                gl.isVertexArray = function (v) {

	                                        return ext.isVertexArrayOES(v);
	                                };

	                                gl.bindVertexArray = function (v) {

	                                        ext.bindVertexArrayOES(v);
	                                };

	                                gl.VERTEX_ARRAY_BINDING = ext.VERTEX_ARRAY_BINDING_OES;
	                        }
	                }

	                /** 
	                 * create a WeGL shader object.
	                 * @param {VERTEX_SHADER | FRAGMENT_SHADER} type type WebGL shader type.
	                 * @param {String} source the shader source, as plain text.
	                 * @returns {WebGLShader} a compiled WebGL shader object.
	                 */

	        }, {
	                key: 'createShader',
	                value: function createShader(type, source) {

	                        var shader = null;

	                        if (!type || !source) {

	                                console.error('createShader: invalid params, type:' + type + ' source:' + source);
	                        } else if (this.ready()) {

	                                var gl = this.gl;

	                                /*
	                                 * remove first EOL, which might come from using <script>...</script> tags,
	                                 * to handle GLSL ES 3.00 (TWGL)
	                                 */
	                                source.replace(/^[ \t]*\n/, '');

	                                if (type === gl.VERTEX_SHADER) {

	                                        shader = gl.createShader(type); // assigned VS
	                                } else if (type === gl.FRAGMENT_SHADER) {

	                                        shader = gl.createShader(type); // assigned FS
	                                } else {

	                                        console.error('createShader: type not recognized:' + type);
	                                }

	                                gl.shaderSource(shader, source);

	                                gl.compileShader(shader);

	                                // Detect shader compile errors.

	                                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

	                                        console.error('createShader:' + gl.getShaderInfoLog(shader));

	                                        shader = null;
	                                }
	                        }

	                        return shader;
	                }
	        }, {
	                key: 'createVertexShader',
	                value: function createVertexShader(source) {

	                        return this.createShader(this.gl.VERTEX_SHADER, source);
	                }
	        }, {
	                key: 'createFragmentShader',
	                value: function createFragmentShader(source) {

	                        return this.createShader(this.gl.FRAGMENT_SHADER, source);
	                }

	                /** 
	                 * Use the Fetch API to get a shader file
	                 */

	        }, {
	                key: 'fetchShader',
	                value: function fetchShader(type, sourceURL) {

	                        var self = this;

	                        fetch(sourceURL, {

	                                method: 'POST',

	                                mode: 'cors',

	                                redirect: 'follow',

	                                headers: new Headers({

	                                        'Content-Type': 'text/plain'

	                                })

	                        }).then(function (response) {

	                                console.log(text);

	                                if (response.ok) {

	                                        return response.text();
	                                }

	                                return false;
	                        }).then(function (source) {

	                                if (source) {

	                                        return self.createShader(type, source);
	                                }
	                        });

	                        return null;
	                }
	        }, {
	                key: 'fetchVertexShader',
	                value: function fetchVertexShader(sourceURL) {

	                        return this.fetchShader(this.gl.VERTEX_SHADER, sourceURL);
	                }
	        }, {
	                key: 'fetchFragmentShader',
	                value: function fetchFragmentShader(sourceURL) {

	                        return this.fetchShader(this.gl.FRAGMENT_SHADER, sourceURL);
	                }

	                /** 
	                 * create shader form script element
	                 * @param {String|DOMElement} tag the script element, or its id
	                 */

	        }, {
	                key: 'createShaderFromTag',
	                value: function createShaderFromTag(tag) {

	                        if (this.util.isString(tag)) {

	                                tag = document.getElementById(tag);
	                        }

	                        if (!tag) {

	                                console.error('createShaderFromTag: not found (' + tag + ')');

	                                return false;
	                        }

	                        var type = null;

	                        if (tag.type == 'x-shader/x-vertex') {

	                                type = this.gl.VERTEX_SHADER;
	                        } else if (tag.type == 'x-shader/x-fragment') {

	                                type = this.gl.FRAGMENT_SHADER;
	                        } else {

	                                console.error('createShaderFromTag: type not found:(' + tag.type + ')');

	                                return null;
	                        }

	                        var source = "";

	                        var c = tag.firstChild;

	                        while (c) {

	                                if (c.nodeType == 3) {

	                                        source += c.textContent;
	                                }

	                                c = c.nextSibling;
	                        }

	                        return this.createShader(type, source);
	                }

	                /** 
	                 * Create WebGL program with shaders. Program not used until 
	                 * we apply gl.useProgram(program).
	                 * @param {gl.VERTEX_SHADER} vShader the vertex shader.
	                 * @param {gl.FRAGMENT_SHADER} fShader the fragment shader.
	                 */

	        }, {
	                key: 'createProgram',
	                value: function createProgram(vs, fs) {

	                        if (!vs || !fs) {

	                                console.error('createProgram: parameter error, vs:' + vs + ' fs:' + fs);

	                                return null;
	                        }

	                        // Wrap the program object to make V8 happy.

	                        var prg = {};

	                        if (this.ready()) {

	                                var gl = this.gl;

	                                var vso = this.createVertexShader(vs.code);

	                                var fso = this.createFragmentShader(fs.code);

	                                var program = gl.createProgram();

	                                gl.attachShader(program, vso);

	                                gl.attachShader(program, fso);

	                                gl.linkProgram(program);

	                                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

	                                        console.error('createProgram:' + gl.getProgramInfoLog(program));

	                                        this.checkShaders(vs, fs, program);
	                                } else {

	                                        prg.shaderProgram = program;

	                                        prg.vsVars = vs.varList, prg.fsVars = fs.varList;
	                                }
	                        }

	                        return prg;
	                }

	                /** 
	                 * Read shader code, and organize the variables in the shader 
	                 * into an object. Abstracts some of the tedious work in setting 
	                 * up shader variables.
	                 * @param {Array} sourceArr array of lines in the shader.
	                 * @returns {Object} an object organizing attribute, uniform, and 
	                 * varying variable names and datatypes.
	                 */

	        }, {
	                key: 'createVarList',
	                value: function createVarList(source) {

	                        var len = source.length;

	                        var sp = ' ';

	                        var list = {};

	                        var varTypes = ['attribute', 'uniform', 'varying'];

	                        if (len) {

	                                for (var i = 0; i < source.length; i++) {

	                                        var s = source[i];

	                                        if (s.indexOf('void main') !== -1) {

	                                                break;
	                                        } else {

	                                                for (var j = 0; j < varTypes.length; j++) {

	                                                        var type = varTypes[j];

	                                                        if (!list[type]) list[type] = {};

	                                                        if (s.indexOf(type) > -1) {

	                                                                //////////////////////////////console.log("SSS1:" + s)

	                                                                //s = s.slice(0, -1); // remove trailing ';'
	                                                                s = s.replace(/;\s*$/, "");

	                                                                ///////////////////////////////console.log("SSS:" + s)

	                                                                s = s.split(sp);

	                                                                //////////////////////////////console.log("FIRST: " + s)

	                                                                var vType = s.shift(); // attribute, uniform, or varying

	                                                                if (!list[vType]) {

	                                                                        list[vType] = {};
	                                                                }

	                                                                /////////////////////////console.log("SECOND AFTER SHIFT:" + vType + " remainder:" + s)

	                                                                var nType = s.shift(); // variable type

	                                                                if (!list[vType][nType]) {

	                                                                        list[vType][nType] = {};
	                                                                }

	                                                                var nName = s.shift(); // variable name

	                                                                if (!list[vType][nType][nName]) {

	                                                                        list[vType][nType][nName] = 'empty';
	                                                                }

	                                                                /////////////////////////console.log("THIRD AFTER SHIFT:" + nType + " remainder:" + s)
	                                                        }
	                                                }
	                                        }
	                                }
	                        }

	                        return list;
	                }

	                /** 
	                 * assign the attribute arrays.
	                 */

	        }, {
	                key: 'setAttributeArrays',
	                value: function setAttributeArrays(shaderProgram, attributes) {

	                        var gl = this.gl;

	                        for (var i in attributes) {

	                                var attb = attributes[i];

	                                // Note: we call glEnableAttribArray only when rendering

	                                for (var j in attb) {

	                                        attb[j] = gl.getAttribLocation(shaderProgram, j);

	                                        //////////console.log('gl.getAttribLocation( shaderProgram, "' + j + '" ) is:' + attb[ j ] );
	                                }
	                        }

	                        return attributes;
	                }
	        }, {
	                key: 'setUniformLocations',
	                value: function setUniformLocations(shaderProgram, uniforms) {

	                        var gl = this.gl;

	                        for (var i in uniforms) {

	                                var unif = uniforms[i];

	                                for (var j in unif) {

	                                        unif[j] = gl.getUniformLocation(shaderProgram, j);

	                                        ////////console.log("gl.getUniformLocation( shaderProgram," + j + ") is:" + unif[ j ] );
	                                }
	                        }

	                        return uniforms;
	                }

	                /** 
	                 * Bind attribute locations.
	                 * @param {WebGLProgram} program a compiled WebGL program.
	                 * @param {Object} attribLocationmap the attributes.
	                 */

	        }, {
	                key: 'bindAttributeLocations',
	                value: function bindAttributeLocations(program, attribLocationMap) {

	                        var gl = this.gl;

	                        if (attribLocationMap) {

	                                for (var attribName in attribLocationMap) {

	                                        console.log('binding attribute:' + attribName + ' to:' + attribLocationMap[attribName]);

	                                        gl.bindAttribLocation(program, attribLocationMap[attribName], attribName);
	                                }
	                        } else {

	                                console.warn('webgl.bindAttributes: no attributes supplied');
	                        }
	                }

	                /** 
	                 * Create associative array with shader attributes.
	                 * NOTE: Only attributes actually used in the shader show.
	                 * @param {WebGLProgram} program a compiled WebGL program.
	                 * @returns {Object} a collection of attributes, with .count = number.
	                 */

	        }, {
	                key: 'getAttributes',
	                value: function getAttributes(program) {

	                        var gl = this.gl;

	                        var attrib = {};

	                        var attribCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

	                        for (var i = 0; i < attribCount; i++) {

	                                var attribInfo = gl.getActiveAttrib(program, i);

	                                /////////console.log("adding attribute:" + attribInfo.name );

	                                attrib[attribInfo.name] = gl.getAttribLocation(program, attribInfo.name);
	                        }

	                        // Store the number of attributes.

	                        attrib.count = attribCount;

	                        return attrib;
	                }

	                /** 
	                 * Create associative array with shader uniforms.
	                 * NOTE: Only attributes actually used in the shader show.
	                 * @param {WebGLProgram} program a compiled WebGL program.
	                 * @returns {Object} a collection of attributes, with .count = number.
	                 */

	        }, {
	                key: 'getUniforms',
	                value: function getUniforms(program) {

	                        var gl = this.gl;

	                        var uniform = {};

	                        var uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

	                        var uniformName = '';

	                        for (var i = 0; i < uniformCount; i++) {

	                                var uniformInfo = gl.getActiveUniform(program, i);

	                                uniformName = uniformInfo.name.replace('[0]', '');

	                                console.log("adding uniform:" + uniformName);

	                                uniform[uniformName] = gl.getUniformLocation(program, uniformName);
	                        }

	                        // Store the number of uniforms.

	                        uniform.count = uniformCount;

	                        return uniform;
	                }

	                /** 
	                 * Create associative array with shader varying variables.
	                 */

	        }, {
	                key: 'getVarying',
	                value: function getVarying(program) {}

	                /** 
	                 * check to see if we're ready to run, after supplying 
	                 * shaders.
	                 */

	        }, {
	                key: 'checkShaders',
	                value: function checkShaders(vs, fs, program) {

	                        var gl = this.gl;

	                        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

	                                // Test the vertex shader

	                                if (vs && !gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {

	                                        console.error('error creating the vertex shader, ' + gl.getShaderInfoLog(vs));
	                                } else if (fs && !gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {

	                                        console.error('error creating the fragment shader, ' + gl.getShaderInfoLog(fs));
	                                } else {

	                                        console.error('error in gl program linking');
	                                }

	                                gl.deleteProgram(program);

	                                return false;
	                        }

	                        return true;
	                }

	                /** 
	                 * Check if our VBO, IBO are ok.
	                 */

	        }, {
	                key: 'checkBufferObjects',
	                value: function checkBufferObjects(bo) {

	                        return bo && bo instanceof ArrayBuffer;
	                }
	        }]);

	        return WebGL;
	}();

	exports.default = WebGL;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var WebVR = function () {
	        function WebVR(init, util, glMatrix, webgl) {
	                _classCallCheck(this, WebVR);

	                console.log('in webVR class');

	                this.util = util;

	                this.glMatrix = glMatrix;

	                this.webgl = webgl;

	                if (this.init === true) {

	                        // Do something.

	                }
	        }

	        _createClass(WebVR, [{
	                key: 'init',
	                value: function init() {}
	        }]);

	        return WebVR;
	}();

	exports.default = WebVR;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _loadPool = __webpack_require__(8);

	var _loadPool2 = _interopRequireDefault(_loadPool);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var LoadTexture = function (_LoadPool) {
	        _inherits(LoadTexture, _LoadPool);

	        /**
	         * Texture loader, using a texture pool.
	        * @link http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html
	         */

	        function LoadTexture(init, util, glMatrix, webgl) {
	                _classCallCheck(this, LoadTexture);

	                console.log('in LoadTexture class');

	                // Init superclass.

	                var MAX_CACHE_IMAGES = 3;

	                // Specific to texture cache.

	                var _this = _possibleConstructorReturn(this, (LoadTexture.__proto__ || Object.getPrototypeOf(LoadTexture)).call(this, init, util, glMatrix, webgl, MAX_CACHE_IMAGES));

	                _this.MAX_TIMEOUT = 10;

	                _this.greyPixel = new Uint8Array([0.5, 0.5, 0.5, 1.0]);

	                if (init) {

	                        // Do something specific to the sublclass.

	                }

	                return _this;
	        }

	        _createClass(LoadTexture, [{
	                key: 'init',
	                value: function init() {}

	                /**
	                 * Sets a texture to a 1x1 pixel color. 
	                 * @param {WebGLRenderingContext} gl the WebGLRenderingContext.
	                 * @param {WebGLTexture} texture the WebGLTexture to set parameters for.
	                 * @param {WebGLParameter} target.
	                 * @memberOf module: webvr-mini/LoadTexture
	                 */

	        }, {
	                key: 'setDefaultTexturePixel',
	                value: function setDefaultTexturePixel(gl, texture, target) {

	                        // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.

	                        var color = this.greyPixel;

	                        if (target === gl.TEXTURE_CUBE_MAP) {

	                                for (var i = 0; i < 6; ++i) {

	                                        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
	                                }
	                        } else if (target === gl.TEXTURE_3D) {

	                                gl.texImage3D(target, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
	                        } else {

	                                gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
	                        }
	                }

	                /** 
	                 * Create a load object wrapper, and start a load.
	                 * POLYMORPHIC FOR LOAD MEDIA TYPE.
	                 * @param {Object} waitObj the unresolved wait object holding load directions for the asset.
	                 * @memberOf module: webvr-mini/LoadTexture
	                 */

	        }, {
	                key: 'createLoadObj',
	                value: function createLoadObj(waitObj) {
	                        var _this2 = this;

	                        var gl = this.webgl.getContext();

	                        var loadObj = {};

	                        loadObj.image = new Image();

	                        loadObj.image.crossOrigin = 'anonymous';

	                        loadObj.callback = waitObj.callback;

	                        loadObj.prim = waitObj.attach; ///////////////////////////

	                        loadObj.busy = true;

	                        // https://www.nczonline.net/blog/2013/09/10/understanding-ecmascript-6-arrow-functions/

	                        loadObj.image.addEventListener('load', function (e) {
	                                return _this2.uploadTexture(loadObj, loadObj.callback);
	                        });

	                        loadObj.image.addEventListener('error', function (e) {
	                                return console.log('error loading image:' + waitObj.source);
	                        }, false);

	                        // Start the loading.

	                        loadObj.image.src = waitObj.source;

	                        this.cacheCt++;

	                        return loadObj;
	                }

	                /** 
	                 * Create a WebGL texture and upload to GPU.
	                 * Note: problems with firefox data, see:
	                 * http://stackoverflow.com/questions/39251254/avoid-cpu-side-conversion-with-teximage2d-in-firefox
	                 * @param {Object} loadObj the loader object containing Image data.
	                 * @param {Function} callback callback function for individual texture load.
	                 * @memberOf module: webvr-mini/LoadTexture
	                 */

	        }, {
	                key: 'uploadTexture',
	                value: function uploadTexture(loadObj, callback) {

	                        ////////////console.log( 'In uploadTexture() for:' + loadObj.prim.name + ' src:' + loadObj.image.src );

	                        var gl = this.webgl.getContext();

	                        var textures = loadObj.prim.textures;

	                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	                        var textureObj = {
	                                image: loadObj.image,
	                                src: loadObj.image.src,
	                                texture: gl.createTexture()
	                        };

	                        gl.bindTexture(gl.TEXTURE_2D, textureObj.texture);

	                        // Use image, or default to single-color texture if image is not present.

	                        if (textureObj.image) {

	                                //////////console.log( 'binding image:' + textureObj.image.src );

	                                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image);

	                                // TODO: WHEN TO USE gl.renderBufferStorage()???
	                        } else {

	                                console.error('no loadObj.image for:' + textureObj.image.src + ', using default pixel texture');

	                                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.greyPixel);
	                        }

	                        if (this.util.isPowerOfTwo(textureObj.image.width) && this.util.isPowerOfTwo(textureObj.image.height)) {

	                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

	                                gl.generateMipmap(gl.TEXTURE_2D);
	                        } else {

	                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	                        }

	                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

	                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	                        gl.bindTexture(gl.TEXTURE_2D, null);

	                        textures.push(textureObj);

	                        window.prim = loadObj.prim;

	                        // Clear the object for re-use.

	                        loadObj.busy = false;

	                        // Send this to update for re-use .

	                        this.update(loadObj);
	                }

	                /** 
	                 * Upload a cubemap texture.
	                 * @memberOf module: webvr-mini/LoadTexture
	                 */

	        }, {
	                key: 'uploadCubeTexture',
	                value: function uploadCubeTexture() {}

	                /** 
	                 * Upload a 3d texture.
	                 * @memberOf module: webvr-mini/LoadTexture
	                 */

	        }, {
	                key: 'upload3DTexture',
	                value: function upload3DTexture() {}

	                // load() and update() are defined in the superclass.

	        }]);

	        return LoadTexture;
	}(_loadPool2.default);

	exports.default = LoadTexture;

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var LoadPool = function () {

	        /**
	         * Base loader class. We don't use promise.all since we want to keep a 
	         * limited pool of loaders, which accept a larger number of waitObjs. As 
	         * each loadObj completes a load, it checks the queue to see if there is 
	         * another loadObj neededing a load.
	         */

	        function LoadPool(init, util, glMatrix, webgl, MAX_CACHE) {
	                _classCallCheck(this, LoadPool);

	                console.log('in LoadPool class');

	                this.util = util;

	                this.webgl = webgl;

	                this.glMatrix = glMatrix;

	                this.MAX_CACHE = MAX_CACHE; // from subclass

	                this.loadCache = new Array(MAX_CACHE);

	                this.waitCache = []; // Could be hundreds

	                this.waitCt = 0; // wait cache pointer

	                this.loadCt = 0; // load cache pointer

	                this.ready = false;
	        }

	        /** 
	         * Add to the queue of unresolved wait objects, an object holding
	         * directions for loading the asset and callback(s).
	         * @param {String} source the image path.
	         * @param {Function} callback callback function ofr individual waiter.
	         */


	        _createClass(LoadPool, [{
	                key: 'createWaitObj',
	                value: function createWaitObj(source, attach, callback) {

	                        /////////////console.log( 'creating wait object...' + source );

	                        this.loadCt++;

	                        this.waitCache.push({

	                                source: source,

	                                attach: attach,

	                                callback: callback

	                        });
	                }

	                // Create LoadObject is specific to subclass.

	                // UploadXXX is specific to subclass.

	                /** 
	                 * Update the queue.
	                 */

	        }, {
	                key: 'update',
	                value: function update(loadObj) {

	                        /////////////console.log( 'in loadTexture.update()' );

	                        var waitCache = this.waitCache;

	                        var wLen = waitCache.length;

	                        if (wLen < 1) {

	                                console.log('all assets loaded for:' + loadObj.prim.name);

	                                this.ready = true;

	                                return;
	                        }

	                        this.ready = false;

	                        // Check if there is an available loadCache

	                        var i = 0;

	                        var loadCache = this.loadCache;

	                        var lLen = loadCache.length;

	                        var waitObj = waitCache[0];

	                        /////////console.log( 'in update(), have a waitObj waiting...' + waitObj.attach.name + ' src:' + waitObj.source );

	                        if (loadObj && loadObj.busy === false) {

	                                //////////console.log( 're-using a loader object:' + ' loadObj:' + loadObj  );

	                                loadObj.prim = waitObj.attach;

	                                loadObj.image.src = waitObj.source;

	                                waitCache.shift();
	                        } else {

	                                for (i; i < lLen; i++) {

	                                        if (!loadCache[i]) {

	                                                //////////console.log( 'creating a new Loader object at cache pos:' + i );

	                                                loadCache[i] = this.createLoadObj(waitObj);

	                                                waitCache.shift();

	                                                break;
	                                        }
	                                }
	                        }
	                } // end of update

	                /** 
	                 * load objects into the waiting queue. This can happen very quickly. 
	                 * images are queue for loading, with callback for each load, and 
	                 * final callback. We use custom code here instead of a Promise for 
	                 * brevity and flexibility.
	                 * @param {String} source the path to the image file
	                 * @param {Function} callback each time an image is loaded.
	                 * @param {Function} finalCallback (optional) the callback executed when all objects are loaded.
	                 */

	        }, {
	                key: 'load',
	                value: function load(source, attach, callback, finalCallback) {

	                        // Push a load request onto the queue.

	                        this.createWaitObj(source, attach, callback);

	                        // Start loading, if space available.

	                        this.update();
	                }
	        }]);

	        return LoadPool;
	}();

	exports.default = LoadPool;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _loadPool = __webpack_require__(8);

	var _loadPool2 = _interopRequireDefault(_loadPool);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var LoadModel = function (_LoadPool) {
	    _inherits(LoadModel, _LoadPool);

	    /**
	     * Base loader class.
	     */

	    function LoadModel(init, util, glMatrix, webgl) {
	        _classCallCheck(this, LoadModel);

	        console.log('in LoadModel class');

	        return _possibleConstructorReturn(this, (LoadModel.__proto__ || Object.getPrototypeOf(LoadModel)).call(this, init, util, glMatrix, webgl));
	    }

	    _createClass(LoadModel, [{
	        key: 'init',
	        value: function init() {}
	    }]);

	    return LoadModel;
	}(_loadPool2.default);

	exports.default = LoadModel;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _loadPool = __webpack_require__(8);

	var _loadPool2 = _interopRequireDefault(_loadPool);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var LoadAudio = function (_LoadPool) {
	        _inherits(LoadAudio, _LoadPool);

	        /**
	         * Base loader class.
	         * @link https://www.html5rocks.com/en/tutorials/webaudio/intro/
	         * @link http://mdn.github.io/fetch-examples/fetch-array-buffer/
	         */

	        function LoadAudio(init, util, glMatrix, webgl) {
	                _classCallCheck(this, LoadAudio);

	                console.log('in LoadAudio class');

	                var MAX_CACHE_AUDIO = 3;

	                var _this = _possibleConstructorReturn(this, (LoadAudio.__proto__ || Object.getPrototypeOf(LoadAudio)).call(this, init, util, glMatrix, webgl, MAX_CACHE_AUDIO));

	                _this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	                _this.sources = {};

	                if (init === true) {}

	                return _this;
	        }

	        _createClass(LoadAudio, [{
	                key: 'uploadAudio',
	                value: function uploadAudio(loadObj, callback) {

	                        var audio = loadObj.prim.audio;

	                        var audioObj = {
	                                audio: loadObj.audio,
	                                src: loadObj.src
	                        };

	                        // TODO: set audio volume, etc.

	                        audio.push(audioObj);

	                        // Clear the object for re-use.

	                        loadObj.busy = false;

	                        this.update(loadObj);
	                }
	        }, {
	                key: 'createLoadObj',
	                value: function createLoadObj(waitObj) {

	                        loadObj = {};

	                        loadObj.src = waitObj.source;

	                        loadObj.audio = this.audioCtx.createBufferSource();

	                        var req = new Request(waitObj.source);

	                        // TODO: SET CORS and mime type

	                        fetch(req).then(function (response) {

	                                if (!response.ok) {

	                                        throw Error(response.statusText);
	                                }

	                                return response.arrayBuffer();
	                        }).then(function (buffer) {

	                                if (!buffer) {

	                                        throw Error('no audio arrayBuffer');
	                                }

	                                this.audioCtx.decodeAudioData(buffer, function (decodedData) {

	                                        loadObj.audio.buffer = decodedData;

	                                        loadObj.audio.connect(this.audioCtx.destination);

	                                        // Attach to prim.

	                                        this.update(loadObj);
	                                });
	                        }).catch(function (err) {

	                                console.error(err);
	                        });
	                }
	        }]);

	        return LoadAudio;
	}(_loadPool2.default);

	exports.default = LoadAudio;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _loadPool = __webpack_require__(8);

	var _loadPool2 = _interopRequireDefault(_loadPool);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var LoadVideo = function (_LoadPool) {
	    _inherits(LoadVideo, _LoadPool);

	    /**
	     * Base loader class.
	     */

	    function LoadVideo(init, util, glMatrix, webgl) {
	        _classCallCheck(this, LoadVideo);

	        console.log('in LoadVideo class');

	        return _possibleConstructorReturn(this, (LoadVideo.__proto__ || Object.getPrototypeOf(LoadVideo)).call(this, init, util, glMatrix, webgl));
	    }

	    _createClass(LoadVideo, [{
	        key: 'init',
	        value: function init() {}
	    }]);

	    return LoadVideo;
	}(_loadPool2.default);

	exports.default = LoadVideo;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _loadPool = __webpack_require__(8);

	var _loadPool2 = _interopRequireDefault(_loadPool);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var LoadFont = function (_LoadPool) {
	        _inherits(LoadFont, _LoadPool);

	        /** 
	         * Load and configure fonts for use.
	         * Working with fonts:
	         * @link https://www.html5rocks.com/en/tutorials/webgl/million_letters/
	         */

	        function LoadFont(init, util, glMatrix, webgl) {
	                _classCallCheck(this, LoadFont);

	                console.log('in LoadFont class');

	                // Init superclass.

	                var MAX_CACHE_FONTS = 3;

	                return _possibleConstructorReturn(this, (LoadFont.__proto__ || Object.getPrototypeOf(LoadFont)).call(this, init, util, glMatrix, webgl, MAX_CACHE_FONTS));
	        }

	        return LoadFont;
	}(_loadPool2.default);

	exports.default = LoadFont;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	            value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _shader = __webpack_require__(14);

	var _shader2 = _interopRequireDefault(_shader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ShaderTexture = function (_Shader) {
	            _inherits(ShaderTexture, _Shader);

	            function ShaderTexture(init, util, glMatrix, webgl, prim) {
	                        _classCallCheck(this, ShaderTexture);

	                        var _this = _possibleConstructorReturn(this, (ShaderTexture.__proto__ || Object.getPrototypeOf(ShaderTexture)).call(this, init, util, glMatrix, webgl, prim));

	                        console.log('In ShaderTexture class');

	                        return _this;
	            }

	            /** 
	             * --------------------------------------------------------------------
	             * VERTEX SHADER 1
	             * a default-lighting textured object vertex shader.
	             * - vertex position
	             * - texture coordinate
	             * - model-view matrix
	             * - projection matrix
	             * --------------------------------------------------------------------
	             */


	            _createClass(ShaderTexture, [{
	                        key: 'vsSrc',
	                        value: function vsSrc() {

	                                    var s = ['attribute vec3 aVertexPosition;', 'attribute vec2 aTextureCoord;', 'uniform mat4 uMVMatrix;', 'uniform mat4 uPMatrix;', 'varying vec2 vTextureCoord;', 'void main(void) {', '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);', '    vTextureCoord = aTextureCoord;', '}'];

	                                    return {

	                                                code: s.join('\n'),

	                                                varList: this.webgl.createVarList(s)

	                                    };
	                        }

	                        /** 
	                         * a default-lighting textured object fragment shader.
	                         * - varying texture coordinate
	                         * - texture 2D sampler
	                         */

	            }, {
	                        key: 'fsSrc',
	                        value: function fsSrc() {

	                                    var s = [

	                                    // 'precision mediump float;',

	                                    this.floatp, 'varying vec2 vTextureCoord;', 'uniform sampler2D uSampler;', 'void main(void) {', '    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));', '}'];

	                                    return {

	                                                code: s.join('\n'),

	                                                varList: this.webgl.createVarList(s)

	                                    };
	                        }

	                        /** 
	                         * --------------------------------------------------------------------
	                         * Vertex Shader 1, using texture buffer.
	                         * --------------------------------------------------------------------
	                         */

	            }, {
	                        key: 'init',
	                        value: function init(objList) {

	                                    // DESTRUCTING DID NOT WORK!
	                                    //[gl, canvas, mat4, vec3, pMatrix, mvMatrix, program ] = this.setup();

	                                    var arr = this.setup();
	                                    var gl = arr[0];
	                                    var canvas = arr[1];
	                                    var mat4 = arr[2];
	                                    var mat3 = arr[3];
	                                    var vec3 = arr[4];
	                                    var pMatrix = arr[5];
	                                    var mvMatrix = arr[6];
	                                    var program = arr[7];
	                                    var vsVars = arr[8];
	                                    var fsVars = arr[9];

	                                    // Attach objects.

	                                    var shaderProgram = program.shaderProgram;

	                                    window.vs1Vars = vsVars; /////////////////////////////////////////////////////////

	                                    program.renderList = objList || [];

	                                    // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
	                                    // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
	                                    // TODO: http://max-limper.de/tech/batchedrendering.html

	                                    // Update object position, motion.

	                                    program.update = function (obj) {

	                                                // Standard Model-View (mvMatrix) updates, per Prim.

	                                                obj.setMV(mvMatrix);

	                                                // Custom updates go here.
	                                    };

	                                    // Rendering.

	                                    program.render = function () {

	                                                //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

	                                                gl.useProgram(shaderProgram);

	                                                // Reset perspective matrix.

	                                                mat4.perspective(pMatrix, Math.PI * 0.4, canvas.width / canvas.height, 0.1, 100.0); // right

	                                                // Begin program loop

	                                                for (var i = 0, len = program.renderList.length; i < len; i++) {

	                                                            var obj = program.renderList[i];

	                                                            // Only render if we have at least one texture loaded.

	                                                            if (!obj.textures[0] || !obj.textures[0].texture) continue;

	                                                            // Update Model-View matrix with standard Prim values.

	                                                            program.update(obj, mvMatrix);

	                                                            // Bind vertex buffer.

	                                                            gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.vertices.buffer);
	                                                            gl.enableVertexAttribArray(vsVars.attribute.vec3.aVertexPosition);
	                                                            gl.vertexAttribPointer(vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0);

	                                                            // Bind Textures buffer (could have multiple bindings here).

	                                                            gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.texCoords.buffer);
	                                                            gl.enableVertexAttribArray(vsVars.attribute.vec2.aTextureCoord);
	                                                            gl.vertexAttribPointer(vsVars.attribute.vec2.aTextureCoord, obj.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0);

	                                                            gl.activeTexture(gl.TEXTURE0);
	                                                            gl.bindTexture(gl.TEXTURE_2D, null);
	                                                            gl.bindTexture(gl.TEXTURE_2D, obj.textures[0].texture);

	                                                            // Set fragment shader sampler uniform.

	                                                            gl.uniform1i(fsVars.uniform.sampler2D.uSampler, 0); //STRANGE

	                                                            // Set perspective and model-view matrix uniforms.

	                                                            gl.uniformMatrix4fv(vsVars.uniform.mat4.uPMatrix, false, pMatrix);
	                                                            gl.uniformMatrix4fv(vsVars.uniform.mat4.uMVMatrix, false, mvMatrix);

	                                                            // Bind index buffer.

	                                                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer);

	                                                            // Draw elements.

	                                                            gl.drawElements(gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);
	                                                }
	                                    };

	                                    return program;
	                        }
	            }]);

	            return ShaderTexture;
	}(_shader2.default);

	exports.default = ShaderTexture;

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Shader = function () {

	        /* 
	         * Renderers.
	         * GREAT description of model, view, projection matrix
	         * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
	         * 
	         * Using vertex arrays:
	         * @link http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
	         * 
	         * WebGL Stack
	         * @link https://github.com/stackgl
	         * 
	         * Some shaders
	         * https://github.com/jwagner/terrain
	         * 
	         * Superfast Advanced Batch Processing
	         * http://max-limper.de/tech/batchedrendering.html
	         * 
	         * GLSL Sandbox
	         * http://mrdoob.com/projects/glsl_sandbox/
	         * 
	         * Basic MVC
	         * https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
	         */

	        function Shader(init, util, glMatrix, webgl, prim) {
	                _classCallCheck(this, Shader);

	                console.log('In Shader class');

	                this.webgl = webgl;

	                this.util = util;

	                this.prim = prim;

	                this.glMatrix = glMatrix;

	                this.pMatrix = this.glMatrix.mat4.create();

	                this.mvMatrix = this.glMatrix.mat4.create();

	                this.mvMatrixStack = this.glMatrix.mat4.create();

	                this.floatp = '';

	                if (this.webgl.stats.highp) {

	                        this.floatp = 'precision highp float;';
	                } else {

	                        this.floatp = 'precision mediump float;';
	                }

	                // If we need to load a vertext and fragment shader files (in text format), put their paths in derived classes.

	                this.vertexShaderFile = null;

	                this.fragmentShaderFile = null;
	        }

	        /* 
	          * MATRIX OPERATIONS
	          * Mostly with glMatrix
	          */

	        _createClass(Shader, [{
	                key: 'mvPushMatrix',
	                value: function mvPushMatrix() {

	                        var mat4 = this.glMatrix.mat4;

	                        var copy = mat4.create();

	                        mat4.set(this.mvMatrix, copy);

	                        mvMatrixStack.push(copy);
	                }
	        }, {
	                key: 'mvPopMatrix',
	                value: function mvPopMatrix() {

	                        if (this.mvMatrixStack.length == 0) {

	                                throw 'Invalid popMatrix!';
	                        }

	                        mvMatrix = this.mvMatrixStack.pop();
	                }

	                /** 
	                 * set up our program object, using WebGL. We wrap the 'naked' WebGL 
	                 * program object, and add additional properties to the wrapper. 
	                 * 
	                 * Individual shaders use these variables to construct a program wrapper 
	                 * object containing the GLProgram, plus properties, plus update() and 
	                 * render() functions.
	                 */

	        }, {
	                key: 'setup',
	                value: function setup() {

	                        // Compile shaders and create WebGL program using webgl object.

	                        var program = null;

	                        if (this.vertexShaderFile && this.this.fragmentShaderFile) {

	                                program = this.webgl.createProgram(this.webgl.fetchVertexShader(this.vertexShaderFile), this.webgl.fetchFragmentShader(this.fragmentShaderFile));
	                        } else {

	                                program = this.webgl.createProgram(this.vsSrc(), this.fsSrc());
	                        }

	                        // Return references to our properties, and assign uniform and attribute locations using webgl object.

	                        return [this.webgl.getContext(), this.webgl.getCanvas(), this.glMatrix.mat4, this.glMatrix.mat3, this.glMatrix.vec3, this.glMatrix.mat4.create(), // perspective

	                        this.glMatrix.mat4.create(), // model-view

	                        program, {
	                                attribute: this.webgl.setAttributeArrays(program.shaderProgram, program.vsVars.attribute),

	                                uniform: this.webgl.setUniformLocations(program.shaderProgram, program.vsVars.uniform)

	                        }, {

	                                uniform: this.webgl.setUniformLocations(program.shaderProgram, program.fsVars.uniform)

	                        }];
	                }
	        }]);

	        return Shader;
	}();

	exports.default = Shader;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _shader = __webpack_require__(14);

	var _shader2 = _interopRequireDefault(_shader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ShaderColor = function (_Shader) {
	        _inherits(ShaderColor, _Shader);

	        function ShaderColor(init, util, glMatrix, webgl, prim) {
	                _classCallCheck(this, ShaderColor);

	                var _this = _possibleConstructorReturn(this, (ShaderColor.__proto__ || Object.getPrototypeOf(ShaderColor)).call(this, init, util, glMatrix, webgl, prim));

	                console.log('In ShaderColor class');

	                return _this;
	        }

	        _createClass(ShaderColor, [{
	                key: 'vsSrc',
	                value: function vsSrc() {

	                        var s = ['attribute vec3 aVertexPosition;', 'attribute vec4 aVertexColor;', 'uniform mat4 uMVMatrix;', 'uniform mat4 uPMatrix;', 'varying lowp vec4 vColor;', 'void main(void) {', '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);', '    vColor = aVertexColor;', '}'];

	                        return {

	                                code: s.join('\n'),

	                                varList: this.webgl.createVarList(s)

	                        };
	                }
	        }, {
	                key: 'fsSrc',
	                value: function fsSrc() {

	                        var s = ['varying lowp vec4 vColor;', 'void main(void) {',

	                        //'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',

	                        'gl_FragColor = vColor;', '}'];

	                        return {

	                                code: s.join('\n'),

	                                varList: this.webgl.createVarList(s)

	                        };
	                }

	                /** 
	                 * --------------------------------------------------------------------
	                 * Vertex Shader 2, using color buffer but not texture.
	                 * --------------------------------------------------------------------
	                 */

	        }, {
	                key: 'init',
	                value: function init(objList) {

	                        // DESTRUCTING DID NOT WORK!
	                        //[gl, canvas, mat4, vec3, pMatrix, mvMatrix, program ] = this.setup();

	                        var arr = this.setup();
	                        var gl = arr[0];
	                        var canvas = arr[1];
	                        var mat4 = arr[2];
	                        var mat3 = arr[3];
	                        var vec3 = arr[4];
	                        var pMatrix = arr[5];
	                        var mvMatrix = arr[6];
	                        var program = arr[7];
	                        var vsVars = arr[8];
	                        var fsVars = arr[9];

	                        // Attach objects.

	                        var shaderProgram = program.shaderProgram;

	                        window.vs2Vars = vsVars; /////////////////////////////////////////////////////////

	                        var counter = 0;

	                        program.renderList = objList || [];

	                        // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html

	                        // Update object position, motion.

	                        program.update = function (obj) {

	                                // Standard mvMatrix updates.

	                                obj.setMV(mvMatrix);

	                                // Custom updates go here.
	                        };

	                        // Rendering.

	                        program.render = function () {

	                                //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

	                                gl.useProgram(shaderProgram);

	                                // Reset perspective matrix.

	                                mat4.perspective(pMatrix, Math.PI * 0.4, canvas.width / canvas.height, 0.1, 100.0); // right

	                                // Loop through assigned objects.

	                                for (var i = 0, len = program.renderList.length; i < len; i++) {

	                                        var obj = program.renderList[i];

	                                        // Update Model-View matrix with standard Prim values.

	                                        program.update(obj, mvMatrix);

	                                        // Bind vertex buffer.

	                                        gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.vertices.buffer);
	                                        gl.enableVertexAttribArray(vsVars.attribute.vec3.aVertexPosition);
	                                        gl.vertexAttribPointer(vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0);

	                                        // Bind color buffer.

	                                        gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.colors.buffer);
	                                        gl.enableVertexAttribArray(vsVars.attribute.vec4.aVertexColor);
	                                        gl.vertexAttribPointer(vsVars.attribute.vec4.aVertexColor, obj.geometry.colors.itemSize, gl.FLOAT, false, 0, 0);
	                                        //gl.disableVertexAttribArray( vsVars.attribute.vec4.aVertexColor );

	                                        // Bind indices buffer.

	                                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer);

	                                        // Set perspective and model-view matrix uniforms.

	                                        gl.uniformMatrix4fv(vsVars.uniform.mat4.uPMatrix, false, pMatrix);
	                                        gl.uniformMatrix4fv(vsVars.uniform.mat4.uMVMatrix, false, mvMatrix);

	                                        // Draw elements.

	                                        gl.drawElements(gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);
	                                }
	                        };

	                        return program;
	                }
	        }]);

	        return ShaderColor;
	}(_shader2.default);

	exports.default = ShaderColor;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	            value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _shader = __webpack_require__(14);

	var _shader2 = _interopRequireDefault(_shader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ShaderDirlightTexture = function (_Shader) {
	            _inherits(ShaderDirlightTexture, _Shader);

	            function ShaderDirlightTexture(init, util, glMatrix, webgl, prim) {
	                        _classCallCheck(this, ShaderDirlightTexture);

	                        var _this = _possibleConstructorReturn(this, (ShaderDirlightTexture.__proto__ || Object.getPrototypeOf(ShaderDirlightTexture)).call(this, init, util, glMatrix, webgl, prim));

	                        console.log('In ShaderTexture class');

	                        return _this;
	            }

	            /** 
	             * --------------------------------------------------------------------
	             * VERTEX SHADER 3
	             * a directionally-lit textured object vertex shader.
	             * @link http://learningwebgl.com/blog/?p=684
	             * StackGL
	             * @link https://github.com/stackgl
	             * phong lighting
	             * @link https://github.com/stackgl/glsl-lighting-walkthrough
	             * - vertex position
	             * - texture coordinate
	             * - model-view matrix
	             * - projection matrix
	             * --------------------------------------------------------------------
	             */


	            _createClass(ShaderDirlightTexture, [{
	                        key: 'vsSrc',
	                        value: function vsSrc() {

	                                    var s = ['attribute vec3 aVertexPosition;', 'attribute vec3 aVertexNormal;', 'attribute vec2 aTextureCoord;', 'uniform mat4 uMVMatrix;', 'uniform mat4 uPMatrix;', 'uniform mat3 uNMatrix;', 'uniform vec3 uAmbientColor;', 'uniform vec3 uLightingDirection;', 'uniform vec3 uDirectionalColor;', 'uniform bool uUseLighting;', // TODO: remove?

	                                    'varying vec2 vTextureCoord;', 'varying vec3 vLightWeighting;', 'void main(void) {', '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);', '    vTextureCoord = aTextureCoord;', '   if(!uUseLighting) {', '       vLightWeighting = vec3(1.0, 1.0, 1.0);', '   } else {', '       vec3 transformedNormal = uNMatrix * aVertexNormal;', '       float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);', '       vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;', '   }', '}'];

	                                    return {

	                                                code: s.join('\n'),

	                                                varList: this.webgl.createVarList(s)

	                                    };
	                        }

	                        /** 
	                         * a default-lighting textured object fragment shader.
	                         * - varying texture coordinate
	                         * - texture 2D sampler
	                         */

	            }, {
	                        key: 'fsSrc',
	                        value: function fsSrc() {

	                                    var s = [

	                                    //'precision mediump float;',

	                                    this.floatp, 'varying vec2 vTextureCoord;', 'varying vec3 vLightWeighting;', 'uniform sampler2D uSampler;', 'void main(void) {', '    vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));', '    gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);', '}'];

	                                    return {

	                                                code: s.join('\n'),

	                                                varList: this.webgl.createVarList(s)

	                                    };
	                        }

	                        /** 
	                         * --------------------------------------------------------------------
	                         * Vertex Shader 3, using texture buffer and lighting.
	                         * --------------------------------------------------------------------
	                         */

	            }, {
	                        key: 'init',
	                        value: function init(objList) {

	                                    // DESTRUCTING DID NOT WORK!
	                                    //[gl, canvas, mat4, vec3, pMatrix, mvMatrix, program ] = this.setup();

	                                    var arr = this.setup();
	                                    var gl = arr[0];
	                                    var canvas = arr[1];
	                                    var mat4 = arr[2];
	                                    var mat3 = arr[3];
	                                    var vec3 = arr[4];
	                                    var pMatrix = arr[5];
	                                    var mvMatrix = arr[6];
	                                    var program = arr[7];
	                                    var vsVars = arr[8];
	                                    var fsVars = arr[9];

	                                    // Shorter reference.

	                                    var shaderProgram = program.shaderProgram;

	                                    window.vs3Vars = vsVars; /////////////////////////////////////////////////////////


	                                    // TODO: TEMPORARY ADD LIGHTING CONTROL

	                                    var lighting = true;

	                                    var ambient = [0.1, 0.1, 0.1]; // ambient colors WORKING

	                                    var lightingDirection = [//TODO: REDO
	                                    -0.25, -0.5, -0.1];

	                                    var directionalColor = [0.7, 0.7, 0.7];

	                                    var nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

	                                    var adjustedLD = vec3.create(); // TODO: redo

	                                    // Attach objects.

	                                    program.renderList = objList || [];

	                                    // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
	                                    // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
	                                    // TODO: http://max-limper.de/tech/batchedrendering.html

	                                    // Update object position, motion.

	                                    program.update = function (obj) {

	                                                // Standard mvMatrix updates.

	                                                obj.setMV(mvMatrix);

	                                                // Compute lighting normals.

	                                                vec3.normalize(adjustedLD, lightingDirection);

	                                                vec3.scale(adjustedLD, adjustedLD, -1);

	                                                // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

	                                                mat3.normalFromMat4(nMatrix, mvMatrix);

	                                                // glmat3 library
	                                                //mat4.normalFromMat4( nMatrix, mvMatrix );

	                                                // Custom updates go here, make local references to vsVars and fsVars.
	                                    };

	                                    // Rendering.

	                                    program.render = function () {

	                                                //console.log( 'gl:' + gl + ' canvas:' + canvas + ' mat4:' + mat4 + ' vec3:' + vec3 + ' pMatrix:' + pMatrix + ' mvMatrix:' + mvMatrix + ' program:' + program );

	                                                gl.useProgram(shaderProgram);

	                                                // Reset perspective matrix.

	                                                mat4.perspective(pMatrix, Math.PI * 0.4, canvas.width / canvas.height, 0.1, 100.0); // right

	                                                // Begin program loop

	                                                for (var i = 0, len = program.renderList.length; i < len; i++) {

	                                                            var obj = program.renderList[i];

	                                                            // Only render if we have at least one texture loaded.

	                                                            if (!obj.textures[0] || !obj.textures[0].texture) continue;

	                                                            // Update Model-View matrix with standard Prim values.

	                                                            program.update(obj, mvMatrix);

	                                                            // Bind vertex buffer.

	                                                            gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.vertices.buffer);
	                                                            gl.enableVertexAttribArray(vsVars.attribute.vec3.aVertexPosition);
	                                                            gl.vertexAttribPointer(vsVars.attribute.vec3.aVertexPosition, obj.geometry.vertices.itemSize, gl.FLOAT, false, 0, 0);

	                                                            // Bind normals buffer.
	                                                            gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.normals.buffer);
	                                                            gl.enableVertexAttribArray(vsVars.attribute.vec3.aVertexNormal);
	                                                            gl.vertexAttribPointer(vsVars.attribute.vec3.aVertexNormal, obj.geometry.normals.itemSize, gl.FLOAT, false, 0, 0);

	                                                            // Bind Textures buffer (could have multiple bindings here).

	                                                            gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometry.texCoords.buffer);
	                                                            gl.enableVertexAttribArray(vsVars.attribute.vec2.aTextureCoord);
	                                                            gl.vertexAttribPointer(vsVars.attribute.vec2.aTextureCoord, obj.geometry.texCoords.itemSize, gl.FLOAT, false, 0, 0);

	                                                            gl.activeTexture(gl.TEXTURE0);
	                                                            gl.bindTexture(gl.TEXTURE_2D, null);
	                                                            gl.bindTexture(gl.TEXTURE_2D, obj.textures[0].texture);

	                                                            // Set fragment shader sampler uniform.

	                                                            gl.uniform1i(fsVars.uniform.sampler2D.uSampler, 0);

	                                                            // Lighting flag.

	                                                            gl.uniform1i(vsVars.uniform.bool.uUseLighting, lighting);

	                                                            if (lighting) {

	                                                                        gl.uniform3f(vsVars.uniform.vec3.uAmbientColor, ambient[0], ambient[1], ambient[2]);

	                                                                        gl.uniform3fv(vsVars.uniform.vec3.uLightingDirection, adjustedLD);

	                                                                        gl.uniform3f(vsVars.uniform.vec3.uDirectionalColor, directionalColor[0], directionalColor[1], directionalColor[2]);
	                                                            }

	                                                            // Normals matrix uniform

	                                                            gl.uniformMatrix3fv(vsVars.uniform.mat3.uNMatrix, false, nMatrix);

	                                                            // Set perspective and model-view matrix uniforms.

	                                                            gl.uniformMatrix4fv(vsVars.uniform.mat4.uPMatrix, false, pMatrix);
	                                                            gl.uniformMatrix4fv(vsVars.uniform.mat4.uMVMatrix, false, mvMatrix);

	                                                            // Bind index buffer.

	                                                            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.geometry.indices.buffer);

	                                                            // Draw elements.

	                                                            gl.drawElements(gl.TRIANGLES, obj.geometry.indices.numItems, gl.UNSIGNED_SHORT, 0);
	                                                }
	                                    };

	                                    return program;
	                        }
	            }]);

	            return ShaderDirlightTexture;
	}(_shader2.default);

	exports.default = ShaderDirlightTexture;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _shader = __webpack_require__(14);

	var _shader2 = _interopRequireDefault(_shader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ShaderWater = function (_Shader) {
	    _inherits(ShaderWater, _Shader);

	    function ShaderWater(init, util, glMatrix, webgl, prim) {
	        _classCallCheck(this, ShaderWater);

	        var _this = _possibleConstructorReturn(this, (ShaderWater.__proto__ || Object.getPrototypeOf(ShaderWater)).call(this, init, util, glMatrix, webgl, prim));

	        console.log('In ShaderWater class');

	        return _this;
	    }

	    /** 
	     * --------------------------------------------------------------------
	     * VERTEX SHADER 3
	     * a directionally-lit textured object vertex shader.
	     * @link http://learningwebgl.com/blog/?p=684
	     * - vertex position
	     * - texture coordinate
	     * - model-view matrix
	     * - projection matrix
	     * --------------------------------------------------------------------
	     */

	    return ShaderWater;
	}(_shader2.default);

	exports.default = ShaderWater;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _shader = __webpack_require__(14);

	var _shader2 = _interopRequireDefault(_shader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ShaderMetal = function (_Shader) {
	    _inherits(ShaderMetal, _Shader);

	    function ShaderMetal(init, util, glMatrix, webgl, prim) {
	        _classCallCheck(this, ShaderMetal);

	        var _this = _possibleConstructorReturn(this, (ShaderMetal.__proto__ || Object.getPrototypeOf(ShaderMetal)).call(this, init, util, glMatrix, webgl, prim));

	        console.log('In ShaderMetal class');

	        return _this;
	    }

	    /** 
	     * --------------------------------------------------------------------
	     * VERTEX SHADER 3
	     * a directionally-lit textured object vertex shader.
	     * @link http://learningwebgl.com/blog/?p=684
	     * - vertex position
	     * - texture coordinate
	     * - model-view matrix
	     * - projection matrix
	     * --------------------------------------------------------------------
	     */

	    return ShaderMetal;
	}(_shader2.default);

	exports.default = ShaderMetal;

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Renderer = function Renderer(init, util, glMatrix, webgl, shaderTexture, shaderColor, shaderDirlightTexture) {
	        _classCallCheck(this, Renderer);

	        console.log('In Renderer class');

	        this.webgl = webgl;

	        this.util = webgl.util;

	        this.glmatrix = glMatrix;

	        this.shaderTexture = shaderTexture;

	        this.shaderColor = shaderColor;

	        this.shaderDirlightTexture = shaderDirlightTexture;

	        if (this.init) {}
	}

	// Specialized render manipulations go below.


	;

	exports.default = Renderer;

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var prim = function () {

	        /** 
	         * Create object primitives, and return vertex and index data 
	         * suitable for creating a VBO and IBO.
	         */

	        function prim(init, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo) {
	                _classCallCheck(this, prim);

	                console.log('in Prim class');

	                this.util = util;

	                this.webgl = webgl;

	                this.glMatrix = glMatrix;

	                this.loadModel = loadModel;

	                this.loadTexture = loadTexture;

	                this.loadAudio = loadAudio;

	                this.loadVideo = loadVideo;

	                this.objs = [];

	                this.type = {

	                        POINT: 'POINT',

	                        LINE: 'LINE',

	                        PLANE: 'PLANE',

	                        POLY: 'POLY',

	                        CUBE: 'CUBE',

	                        SPHERE: 'SPHERE',

	                        ICOSPHERE: 'ICOSPHERE',

	                        DOME: 'DOME',

	                        CONE: 'CONE',

	                        CYLINDER: 'CYLINDER',

	                        SHAPE: 'SHAPE',

	                        TERRAIN: 'TERRAIN'

	                };
	        }

	        /** 
	         * Unique object id
	         * @link https://jsfiddle.net/briguy37/2MVFd/
	         */


	        _createClass(prim, [{
	                key: 'setId',
	                value: function setId() {

	                        var d = new Date().getTime();

	                        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {

	                                var r = (d + Math.random() * 16) % 16 | 0;

	                                d = Math.floor(d / 16);

	                                return (c == 'x' ? r : r & 0x3 | 0x8).toString(16);
	                        });

	                        return uuid;
	                }

	                /** 
	                 * Get the big array with all vertex data
	                 */

	        }, {
	                key: 'setVertexData',
	                value: function setVertexData(vertices) {

	                        vertices = [];

	                        var len = this.objs.length;

	                        for (var i in this.objs) {

	                                vertices = vertices.concat(this.objs[i].vertices);
	                        }

	                        return vertices;
	                }

	                /** 
	                 * get the big array with all index data
	                 */

	        }, {
	                key: 'setIndexData',
	                value: function setIndexData(indices) {

	                        indices = [];

	                        var len = this.objs.length;

	                        for (var i in this.objs) {

	                                indices = indices.concat(this.objs[i].indices);
	                        }

	                        return indices;
	                }
	        }, {
	                key: 'createBuffers',
	                value: function createBuffers(gl, vertices, indices, texCoords, normals, colors) {

	                        // Vertex Buffer Object.

	                        if (!vertices) {

	                                console.log('no vertices present, creating default');

	                                vertices = new Float32Array([0, 0, 0]);
	                        }

	                        var vBuffer = gl.createBuffer();

	                        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

	                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	                        if (!indices) {

	                                console.log('no indices present, creating default');

	                                indices = new Uint16Array([1]);
	                        }

	                        // Index buffer.

	                        var iBuffer = gl.createBuffer();

	                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);

	                        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	                        if (!normals) {

	                                console.log('no normals, present, creating default');

	                                normals = new Float32Array([0, 1, 0]);
	                        }

	                        // Normals buffer.

	                        var nBuffer = gl.createBuffer();

	                        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);

	                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

	                        if (!texCoords) {

	                                console.warn('no texture present, creating default');

	                                texCoords = new Float32Array([0, 0]);
	                        }

	                        // Texture Buffer.

	                        var tBuffer = gl.createBuffer();

	                        gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);

	                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

	                        if (!colors) {

	                                console.warn('no colors present, creating default');

	                                colors = new Float32Array([0.2, 0.5, 0.2, 1.0]);
	                        }

	                        var cBuffer = gl.createBuffer();

	                        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

	                        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	                        // Return a complete object. TODO: don't really need vertices except for debugging.

	                        return {

	                                vertices: {

	                                        data: vertices,

	                                        buffer: vBuffer,

	                                        itemSize: 3,

	                                        numItems: vertices.length / 3
	                                },

	                                texCoords: {

	                                        data: texCoords,

	                                        buffer: tBuffer,

	                                        itemSize: 2,

	                                        numItems: texCoords.length / 2

	                                },

	                                colors: {

	                                        data: colors,

	                                        buffer: cBuffer,

	                                        itemSize: 4,

	                                        numItems: colors.length / 4

	                                },

	                                normals: {

	                                        data: normals,

	                                        buffer: nBuffer,

	                                        itemSize: 3,

	                                        numItems: normals.length / 3

	                                },

	                                indices: {

	                                        data: indices,

	                                        buffer: iBuffer,

	                                        itemSize: 1,

	                                        numItems: indices.length

	                                }

	                        };
	                }

	                /** 
	                 * GEOMETRIES
	                 */

	                /** 
	                 * Scale vertices directly, without changing position.
	                 */

	        }, {
	                key: 'scale',
	                value: function scale(vertices, _scale) {

	                        var oldPos = this.getCenter(vertices);

	                        for (var i = 0, len = vertices.length; i < len; i++) {

	                                vertices[i] *= _scale;
	                        }

	                        this.move(vertices, oldPos);
	                }

	                /** 
	                 * Move vertices directly in geometry.
	                 * NOTE: normally, you will want to use a matrix transform.
	                 */

	        }, {
	                key: 'move',
	                value: function move(vertices, pos) {

	                        var center = this.getCenter(vertices);

	                        var delta = [center[0] - pos[0], center[1] - pos[1], center[2] = pos[2]];

	                        for (var i = 0, len = vertices.length; i < len; i += 3) {

	                                vertices[i] = delta[0];

	                                vertices[i + 1] = delta[1];

	                                vertices[i + 2] = delta[2];
	                        }
	                }

	                /** 
	                 * Get the bounding box of a shape by getting the largest and 
	                 * smallest vertices in coordinate space.
	                 */

	        }, {
	                key: 'boundingBox',
	                value: function boundingBox(vertices) {

	                        var biggest = [0, 0, 0];

	                        var smallest = [0, 0, 0];

	                        var minX = void 0,
	                            minY = void 0,
	                            minZ = void 0,
	                            maxX = void 0,
	                            maxY = void 0,
	                            maxZ = void 0;

	                        for (var i = 0, len = vertices.length; i < len; i += 3) {

	                                minX = Math.min(vertices[i], minX);
	                                minY = Math.min(vertices[i + 1], minY);
	                                minZ = Math.min(vertices[i + 2], minZ);

	                                maxX = Math.max(vertices[i], maxX);
	                                maxY = Math.max(vertices[i + 1], maxY);
	                                maxZ = Math.max(vertices[i + 2], maxZ);
	                        }

	                        // Create cube points.

	                        // TODO: not complete.

	                        var box = [];

	                        return box;
	                }

	                /** 
	                 * Get the center of a shape.
	                 */

	        }, {
	                key: 'getCenter',
	                value: function getCenter(vertices) {

	                        var box = this.boundingBox(vertices);

	                        // find the centroid point (not necessarily part of the shape).
	                }

	                /** 
	                 * Compute normals for a 3d object.
	                 * Adapted from BabylonJS
	                 * https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
	                 */

	        }, {
	                key: 'computeNormals',
	                value: function computeNormals(vertices, indices, normals) {

	                        var index = 0;

	                        var p1p2x = 0.0;

	                        var p1p2y = 0.0;

	                        var p1p2z = 0.0;

	                        var p3p2x = 0.0;

	                        var p3p2y = 0.0;

	                        var p3p2z = 0.0;

	                        var faceNormalx = 0.0;

	                        var faceNormaly = 0.0;

	                        var faceNormalz = 0.0;

	                        var length = 0.0;

	                        var i1 = 0;
	                        var i2 = 0;
	                        var i3 = 0;

	                        for (index = 0; index < vertices.length; index++) {
	                                normals[index] = 0.0;
	                        }

	                        // indice triplet = 1 face

	                        var nbFaces = indices.length / 3;

	                        for (index = 0; index < nbFaces; index++) {
	                                i1 = indices[index * 3]; // get the indexes of each vertex of the face
	                                i2 = indices[index * 3 + 1];
	                                i3 = indices[index * 3 + 2];
	                                p1p2x = vertices[i1 * 3] - vertices[i2 * 3]; // compute two vectors per face
	                                p1p2y = vertices[i1 * 3 + 1] - vertices[i2 * 3 + 1];
	                                p1p2z = vertices[i1 * 3 + 2] - vertices[i2 * 3 + 2];
	                                p3p2x = vertices[i3 * 3] - vertices[i2 * 3];
	                                p3p2y = vertices[i3 * 3 + 1] - vertices[i2 * 3 + 1];
	                                p3p2z = vertices[i3 * 3 + 2] - vertices[i2 * 3 + 2];
	                                faceNormalx = p1p2y * p3p2z - p1p2z * p3p2y; // compute the face normal with cross product
	                                faceNormaly = p1p2z * p3p2x - p1p2x * p3p2z;
	                                faceNormalz = p1p2x * p3p2y - p1p2y * p3p2x;
	                                length = Math.sqrt(faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz);
	                                length = length === 0 ? 1.0 : length;
	                                faceNormalx /= length; // normalize this normal
	                                faceNormaly /= length;
	                                faceNormalz /= length;

	                                //////////////console.log( 'faceNormalx:' + faceNormalx + ' faceNormalx:' + faceNormaly + ' faceNormalz:' + faceNormalz);
	                                normals[i1 * 3] += faceNormalx; // accumulate all the normals per face
	                                normals[i1 * 3 + 1] += faceNormaly;
	                                normals[i1 * 3 + 2] += faceNormalz;
	                                normals[i2 * 3] += faceNormalx;
	                                normals[i2 * 3 + 1] += faceNormaly;
	                                normals[i2 * 3 + 2] += faceNormalz;
	                                normals[i3 * 3] += faceNormalx;
	                                normals[i3 * 3 + 1] += faceNormaly;
	                                normals[i3 * 3 + 2] += faceNormalz;
	                        }

	                        // last normalization of each normal

	                        for (index = 0; index < normals.length / 3; index++) {
	                                faceNormalx = normals[index * 3];
	                                faceNormaly = normals[index * 3 + 1];
	                                faceNormalz = normals[index * 3 + 2];
	                                length = Math.sqrt(faceNormalx * faceNormalx + faceNormaly * faceNormaly + faceNormalz * faceNormalz);
	                                length = length === 0 ? 1.0 : length;
	                                faceNormalx /= length;
	                                faceNormaly /= length;
	                                faceNormalz /= length;
	                                normals[index * 3] = faceNormalx;
	                                normals[index * 3 + 1] = faceNormaly;
	                                normals[index * 3 + 2] = faceNormalz;
	                        }
	                }

	                /** 
	                 * WebGL point.
	                 */

	        }, {
	                key: 'geometryPoint',
	                value: function geometryPoint(prim) {}

	                /** 
	                 * WebGL line.
	                 */

	        }, {
	                key: 'geometryLine',
	                value: function geometryLine(prim) {}

	                /** 
	                 * Plane (non-infinite)
	                 */

	        }, {
	                key: 'geometryPlane',
	                value: function geometryPlane(prim) {}

	                /** 
	                 * Polygon (flat)
	                 */

	        }, {
	                key: 'geometryPoly',
	                value: function geometryPoly(prim) {}

	                /** 
	                 * Create a cube geometry of a given size (units) centered 
	                 * on a point.
	                 * @param {GLMatrix.Vec3} center a 3d vector defining the center.
	                 * @param {Size} width, height, depth, with 1.0 (unit) max size
	                 * @param {Number} scale relative to unit size (1, 1, 1).
	                  name = 'unknown', scale = 1.0, dimensions, position, acceleration, rotation, textureImage, color
	                 */

	        }, {
	                key: 'geometryCube',
	                value: function geometryCube(prim) {

	                        var gl = this.webgl.getContext();

	                        var x = prim.dimensions[0] / 2;

	                        var y = prim.dimensions[1] / 2;

	                        var z = prim.dimensions[2] / 2;

	                        // Create cube geometry.

	                        var vertices = [
	                        // Front face
	                        -1.0, -1.0, 1.0, // bottomleft
	                        1.0, -1.0, 1.0, // bottomright
	                        1.0, 1.0, 1.0, // topright
	                        -1.0, 1.0, 1.0, // topleft
	                        // Back face
	                        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
	                        // Top face
	                        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
	                        // Bottom face
	                        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
	                        // Right face
	                        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
	                        // Left face
	                        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];

	                        var indices = [0, 1, 2, 0, 2, 3, // Front face
	                        4, 5, 6, 4, 6, 7, // Back face
	                        8, 9, 10, 8, 10, 11, // Top face
	                        12, 13, 14, 12, 14, 15, // Bottom face
	                        16, 17, 18, 16, 18, 19, // Right face //can't go to 30
	                        20, 21, 22, 20, 22, 23 // Left face
	                        ];

	                        var texCoords = [
	                        // Front face
	                        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	                        // Back face
	                        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
	                        // Top face
	                        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
	                        // Bottom face
	                        1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
	                        // Right face
	                        1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
	                        // Left face
	                        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

	                        var normals = [
	                        // Front face
	                        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
	                        // Back face
	                        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
	                        // Top face
	                        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
	                        // Bottom face
	                        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
	                        // Right face
	                        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
	                        // Left face
	                        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0];

	                        var colors = [
	                        // Front face
	                        1.0, 1.0, 1.0, 1.0, // white
	                        1.0, 0.0, 0.0, 1.0, // red
	                        0.0, 1.0, 0.0, 1.0, // green
	                        0.0, 0.0, 1.0, 1.0, // blue
	                        // Back face
	                        1.0, 1.0, 1.0, 1.0, // white
	                        1.0, 0.0, 0.0, 1.0, // red
	                        0.0, 1.0, 0.0, 1.0, // green
	                        0.0, 0.0, 1.0, 1.0, // blue
	                        // Top face
	                        1.0, 1.0, 1.0, 1.0, // white
	                        1.0, 0.0, 0.0, 1.0, // red
	                        0.0, 1.0, 0.0, 1.0, // green
	                        0.0, 0.0, 1.0, 1.0, // blue
	                        // Bottom face
	                        1.0, 1.0, 1.0, 1.0, // white
	                        1.0, 0.0, 0.0, 1.0, // red
	                        0.0, 1.0, 0.0, 1.0, // green
	                        0.0, 0.0, 1.0, 1.0, // blue
	                        // Right face
	                        1.0, 1.0, 1.0, 1.0, // white
	                        1.0, 0.0, 0.0, 1.0, // red
	                        0.0, 1.0, 0.0, 1.0, // green
	                        0.0, 0.0, 1.0, 1.0, // blue
	                        // Left face
	                        1.0, 1.0, 1.0, 1.0, // white
	                        1.0, 0.0, 0.0, 1.0, // red
	                        0.0, 1.0, 0.0, 1.0, // green
	                        0.0, 0.0, 1.0, 1.0 // blue
	                        ];

	                        return this.createBuffers(gl, vertices, indices, texCoords, normals, colors);
	                }

	                /** 
	                 * Sphere with polar points.
	                 * http://learningwebgl.com/blog/?p=1253
	                 */

	        }, {
	                key: 'geometrySphere',
	                value: function geometrySphere(prim) {}
	                /*
	                var vertexPositionData = [];
	                    var normalData = [];
	                    var textureCoordData = [];
	                    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
	                      var theta = latNumber * Math.PI / latitudeBands;
	                      var sinTheta = Math.sin(theta);
	                      var cosTheta = Math.cos(theta);
	                
	                      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
	                        var phi = longNumber * 2 * Math.PI / longitudeBands;
	                        var sinPhi = Math.sin(phi);
	                        var cosPhi = Math.cos(phi);
	                
	                        var x = cosPhi * sinTheta;
	                        var y = cosTheta;
	                        var z = sinPhi * sinTheta;
	                        var u = 1 - (longNumber / longitudeBands);
	                        var v = 1 - (latNumber / latitudeBands);
	                
	                        normalData.push(x);
	                        normalData.push(y);
	                        normalData.push(z);
	                        textureCoordData.push(u);
	                        textureCoordData.push(v);
	                        vertexPositionData.push(radius * x);
	                        vertexPositionData.push(radius * y);
	                        vertexPositionData.push(radius * z);
	                      }
	                    }
	                Now that we have the vertices, we need to stitch them together by generating a list of vertex indices that contains sequences of six values, each representing a square expressed as a pair of triangles. Here's the code:
	                
	                    var indexData = [];
	                    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
	                      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
	                        var first = (latNumber * (longitudeBands + 1)) + longNumber;
	                        var second = first + longitudeBands + 1;
	                        indexData.push(first);
	                        indexData.push(second);
	                        indexData.push(first + 1);
	                
	                        indexData.push(second);
	                        indexData.push(second + 1);
	                        indexData.push(first + 1);
	                      }
	                    }
	                */


	                /** 
	                 * Icosphere, iterated from icosohedron.
	                 */

	        }, {
	                key: 'geometryIcoSphere',
	                value: function geometryIcoSphere(prim) {}
	                /*
	                      var sideOrientation = options.sideOrientation || BABYLON.Mesh.DEFAULTSIDE;
	                    var radius = options.radius || 1;
	                    var flat = (options.flat === undefined) ? true : options.flat;
	                    var subdivisions = options.subdivisions || 4;
	                    var radiusX = options.radiusX || radius;
	                    var radiusY = options.radiusY || radius;
	                    var radiusZ = options.radiusZ || radius;
	                    var t = (1 + Math.sqrt(5)) / 2;
	                    // 12 vertex x,y,z
	                    var ico_vertices = [
	                        -1, t, -0, 1, t, 0, -1, -t, 0, 1, -t, 0,
	                        0, -1, -t, 0, 1, -t, 0, -1, t, 0, 1, t,
	                        t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, -1 // v8-11
	                    ];
	                    // index of 3 vertex makes a face of icopshere
	                    var ico_indices = [
	                        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 12, 22, 23,
	                        1, 5, 20, 5, 11, 4, 23, 22, 13, 22, 18, 6, 7, 1, 8,
	                        14, 21, 4, 14, 4, 2, 16, 13, 6, 15, 6, 19, 3, 8, 9,
	                        4, 21, 5, 13, 17, 23, 6, 13, 22, 19, 6, 18, 9, 8, 1
	                    ];
	                    // vertex for uv have aliased position, not for UV
	                    var vertices_unalias_id = [
	                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
	                        // vertex alias
	                        0,
	                        2,
	                        3,
	                        3,
	                        3,
	                        4,
	                        7,
	                        8,
	                        9,
	                        9,
	                        10,
	                        11 // 23: B + 12
	                    ];
	                    // uv as integer step (not pixels !)
	                    var ico_vertexuv = [
	                        5, 1, 3, 1, 6, 4, 0, 0,
	                        5, 3, 4, 2, 2, 2, 4, 0,
	                        2, 0, 1, 1, 6, 0, 6, 2,
	                        // vertex alias (for same vertex on different faces)
	                        0, 4,
	                        3, 3,
	                        4, 4,
	                        3, 1,
	                        4, 2,
	                        4, 4,
	                        0, 2,
	                        1, 1,
	                        2, 2,
	                        3, 3,
	                        1, 3,
	                        2, 4 // 23: B + 12
	                    ];
	                    // Vertices[0, 1, ...9, A, B] : position on UV plane
	                    // '+' indicate duplicate position to be fixed (3,9:0,2,3,4,7,8,A,B)
	                    // First island of uv mapping
	                    // v = 4h          3+  2
	                    // v = 3h        9+  4
	                    // v = 2h      9+  5   B
	                    // v = 1h    9   1   0
	                    // v = 0h  3   8   7   A
	                    //     u = 0 1 2 3 4 5 6  *a
	                    // Second island of uv mapping
	                    // v = 4h  0+  B+  4+
	                    // v = 3h    A+  2+
	                    // v = 2h  7+  6   3+
	                    // v = 1h    8+  3+
	                    // v = 0h
	                    //     u = 0 1 2 3 4 5 6  *a
	                    // Face layout on texture UV mapping
	                    // ============
	                    // \ 4  /\ 16 /   ======
	                    //  \  /  \  /   /\ 11 /
	                    //   \/ 7  \/   /  \  /
	                    //    =======  / 10 \/
	                    //   /\ 17 /\  =======
	                    //  /  \  /  \ \ 15 /\
	                    // / 8  \/ 12 \ \  /  \
	                    // ============  \/ 6  \
	                    // \ 18 /\  ============
	                    //  \  /  \ \ 5  /\ 0  /
	                    //   \/ 13 \ \  /  \  /
	                    //   =======  \/ 1  \/
	                    //       =============
	                    //      /\ 19 /\  2 /\
	                    //     /  \  /  \  /  \
	                    //    / 14 \/ 9  \/  3 \
	                    //   ===================
	                    // uv step is u:1 or 0.5, v:cos(30)=sqrt(3)/2, ratio approx is 84/97
	                    var ustep = 138 / 1024;
	                    var vstep = 239 / 1024;
	                    var uoffset = 60 / 1024;
	                    var voffset = 26 / 1024;
	                    // Second island should have margin, not to touch the first island
	                    // avoid any borderline artefact in pixel rounding
	                    var island_u_offset = -40 / 1024;
	                    var island_v_offset = +20 / 1024;
	                    // face is either island 0 or 1 :
	                    // second island is for faces : [4, 7, 8, 12, 13, 16, 17, 18]
	                    var island = [
	                        0, 0, 0, 0, 1,
	                        0, 0, 1, 1, 0,
	                        0, 0, 1, 1, 0,
	                        0, 1, 1, 1, 0 //  15 - 19
	                    ];
	                    var indices = [];
	                    var positions = [];
	                    var normals = [];
	                    var uvs = [];
	                    var current_indice = 0;
	                    // prepare array of 3 vector (empty) (to be worked in place, shared for each face)
	                    var face_vertex_pos = new Array(3);
	                    var face_vertex_uv = new Array(3);
	                    var v012;
	                    for (v012 = 0; v012 < 3; v012++) {
	                        face_vertex_pos[v012] = BABYLON.Vector3.Zero();
	                        face_vertex_uv[v012] = BABYLON.Vector2.Zero();
	                    }
	                    // create all with normals
	                    for (var face = 0; face < 20; face++) {
	                        // 3 vertex per face
	                        for (v012 = 0; v012 < 3; v012++) {
	                            // look up vertex 0,1,2 to its index in 0 to 11 (or 23 including alias)
	                            var v_id = ico_indices[3 * face + v012];
	                            // vertex have 3D position (x,y,z)
	                            face_vertex_pos[v012].copyFromFloats(ico_vertices[3 * vertices_unalias_id[v_id]], ico_vertices[3 * vertices_unalias_id[v_id] + 1], ico_vertices[3 * vertices_unalias_id[v_id] + 2]);
	                            // Normalize to get normal, then scale to radius
	                            face_vertex_pos[v012].normalize().scaleInPlace(radius);
	                            // uv Coordinates from vertex ID
	                            face_vertex_uv[v012].copyFromFloats(ico_vertexuv[2 * v_id] * ustep + uoffset + island[face] * island_u_offset, ico_vertexuv[2 * v_id + 1] * vstep + voffset + island[face] * island_v_offset);
	                        }
	                        // Subdivide the face (interpolate pos, norm, uv)
	                        // - pos is linear interpolation, then projected to sphere (converge polyhedron to sphere)
	                        // - norm is linear interpolation of vertex corner normal
	                        //   (to be checked if better to re-calc from face vertex, or if approximation is OK ??? )
	                        // - uv is linear interpolation
	                        //
	                        // Topology is as below for sub-divide by 2
	                        // vertex shown as v0,v1,v2
	                        // interp index is i1 to progress in range [v0,v1[
	                        // interp index is i2 to progress in range [v0,v2[
	                        // face index as  (i1,i2)  for /\  : (i1,i2),(i1+1,i2),(i1,i2+1)
	                        //            and (i1,i2)' for \/  : (i1+1,i2),(i1+1,i2+1),(i1,i2+1)
	                        //
	                        //
	                        //                    i2    v2
	                        //                    ^    ^
	                        //                   /    / \
	                        //                  /    /   \
	                        //                 /    /     \
	                        //                /    / (0,1) \
	                        //               /    #---------\
	                        //              /    / \ (0,0)'/ \
	                        //             /    /   \     /   \
	                        //            /    /     \   /     \
	                        //           /    / (0,0) \ / (1,0) \
	                        //          /    #---------#---------\
	                        //              v0                    v1
	                        //
	                        //              --------------------> i1
	                        //
	                        // interp of (i1,i2):
	                        //  along i2 :  x0=lerp(v0,v2, i2/S) <---> x1=lerp(v1,v2, i2/S)
	                        //  along i1 :  lerp(x0,x1, i1/(S-i2))
	                        //
	                        // centroid of triangle is needed to get help normal computation
	                        //  (c1,c2) are used for centroid location
	                        var interp_vertex = function (i1, i2, c1, c2) {
	                            // vertex is interpolated from
	                            //   - face_vertex_pos[0..2]
	                            //   - face_vertex_uv[0..2]
	                            var pos_x0 = BABYLON.Vector3.Lerp(face_vertex_pos[0], face_vertex_pos[2], i2 / subdivisions);
	                            var pos_x1 = BABYLON.Vector3.Lerp(face_vertex_pos[1], face_vertex_pos[2], i2 / subdivisions);
	                            var pos_interp = (subdivisions === i2) ? face_vertex_pos[2] : BABYLON.Vector3.Lerp(pos_x0, pos_x1, i1 / (subdivisions - i2));
	                            pos_interp.normalize();
	                            var vertex_normal;
	                            if (flat) {
	                                // in flat mode, recalculate normal as face centroid normal
	                                var centroid_x0 = BABYLON.Vector3.Lerp(face_vertex_pos[0], face_vertex_pos[2], c2 / subdivisions);
	                                var centroid_x1 = BABYLON.Vector3.Lerp(face_vertex_pos[1], face_vertex_pos[2], c2 / subdivisions);
	                                vertex_normal = BABYLON.Vector3.Lerp(centroid_x0, centroid_x1, c1 / (subdivisions - c2));
	                            }
	                            else {
	                                // in smooth mode, recalculate normal from each single vertex position
	                                vertex_normal = new BABYLON.Vector3(pos_interp.x, pos_interp.y, pos_interp.z);
	                            }
	                            // Vertex normal need correction due to X,Y,Z radius scaling
	                            vertex_normal.x /= radiusX;
	                            vertex_normal.y /= radiusY;
	                            vertex_normal.z /= radiusZ;
	                            vertex_normal.normalize();
	                            var uv_x0 = BABYLON.Vector2.Lerp(face_vertex_uv[0], face_vertex_uv[2], i2 / subdivisions);
	                            var uv_x1 = BABYLON.Vector2.Lerp(face_vertex_uv[1], face_vertex_uv[2], i2 / subdivisions);
	                            var uv_interp = (subdivisions === i2) ? face_vertex_uv[2] : BABYLON.Vector2.Lerp(uv_x0, uv_x1, i1 / (subdivisions - i2));
	                            positions.push(pos_interp.x * radiusX, pos_interp.y * radiusY, pos_interp.z * radiusZ);
	                            normals.push(vertex_normal.x, vertex_normal.y, vertex_normal.z);
	                            uvs.push(uv_interp.x, uv_interp.y);
	                            // push each vertex has member of a face
	                            // Same vertex can bleong to multiple face, it is pushed multiple time (duplicate vertex are present)
	                            indices.push(current_indice);
	                            current_indice++;
	                        };
	                        for (var i2 = 0; i2 < subdivisions; i2++) {
	                            for (var i1 = 0; i1 + i2 < subdivisions; i1++) {
	                                // face : (i1,i2)  for /\  :
	                                // interp for : (i1,i2),(i1+1,i2),(i1,i2+1)
	                                interp_vertex(i1, i2, i1 + 1.0 / 3, i2 + 1.0 / 3);
	                                interp_vertex(i1 + 1, i2, i1 + 1.0 / 3, i2 + 1.0 / 3);
	                                interp_vertex(i1, i2 + 1, i1 + 1.0 / 3, i2 + 1.0 / 3);
	                                if (i1 + i2 + 1 < subdivisions) {
	                                    // face : (i1,i2)' for \/  :
	                                    // interp for (i1+1,i2),(i1+1,i2+1),(i1,i2+1)
	                                    interp_vertex(i1 + 1, i2, i1 + 2.0 / 3, i2 + 2.0 / 3);
	                                    interp_vertex(i1 + 1, i2 + 1, i1 + 2.0 / 3, i2 + 2.0 / 3);
	                                    interp_vertex(i1, i2 + 1, i1 + 2.0 / 3, i2 + 2.0 / 3);
	                                }
	                            }
	                        }
	                    }
	                    // Sides
	                    VertexData._ComputeSides(sideOrientation, positions, indices, normals, uvs);
	                    // Result
	                    var vertexData = new VertexData();
	                    vertexData.indices = indices;
	                    vertexData.positions = positions;
	                    vertexData.normals = normals;
	                    vertexData.uvs = uvs;
	                    return vertexData;
	                };
	                */

	                /** 
	                 * Half-sphere, refined icosohedron
	                 */

	        }, {
	                key: 'geometryDome',
	                value: function geometryDome(prim) {}

	                /** 
	                 * Cone
	                 */

	        }, {
	                key: 'geometryCone',
	                value: function geometryCone(prim) {}

	                /** 
	                 * Cylinder
	                 */

	        }, {
	                key: 'geometryCylinder',
	                value: function geometryCylinder(prim) {}

	                /** 
	                 * Generic 3d shape (e.g. collada model).
	                 * @link https://dannywoodz.wordpress.com/2014/12/16/webgl-from-scratch-loading-a-mesh/
	                 * https://github.com/jagenjo/litegl.js/blob/master/src/mesh.js
	                 */

	        }, {
	                key: 'geometryMesh',
	                value: function geometryMesh(prim) {}

	                /** 
	                 * Create a heightMap
	                 */

	        }, {
	                key: 'initHeightMap',
	                value: function initHeightMap(dimensions, divisions) {

	                        var vec3 = this.glMatrix.vec3;

	                        var hm = [];

	                        for (var i = 0; i < divisions[0]; i++) {
	                                // x

	                                for (var j = 0; j < divisions[2]; j++) {
	                                        // z

	                                        hm.push(0.0);
	                                }
	                        }

	                        return hm;
	                }

	                /** 
	                 * Generate an elevation map of a given width and height.
	                 */

	        }, {
	                key: 'elevationMap',
	                value: function elevationMap(width, height) {

	                        var m = [];

	                        for (var i = 0; i < width; i++) {
	                                // x

	                                for (var j = 0; j < height; j++) {
	                                        // z

	                                        m.push(0.0);
	                                }
	                        }

	                        return m;
	                }

	                /** 
	                 * Indices calculations:
	                 * http://www.3dgep.com/multi-textured-terrain-in-opengl/
	                 */

	        }, {
	                key: 'geometryTerrain',
	                value: function geometryTerrain(prim) {

	                        var gl = this.webgl.getContext();

	                        var vec4 = this.glMatrix.vec4;

	                        var vec3 = this.glMatrix.vec3;

	                        var vec2 = this.glMatrix.vec2;

	                        var vertices = [];
	                        var indices = [];
	                        var texCoords = [];
	                        var normals = [];
	                        var colors = [];

	                        var i = void 0,
	                            j = void 0,
	                            len = void 0,
	                            index = void 0;

	                        var dimensions = prim.dimensions;

	                        var divisions = prim.divisions;

	                        var width = dimensions[0];

	                        var height = dimensions[2];

	                        var terrainWidth = width - 1;
	                        var terrainHeight = height - 1;

	                        var halfTerrainWidth = terrainWidth * 0.5;
	                        var halfTerrainHeight = terrainHeight * 0.5;

	                        var S = void 0,
	                            T = void 0,
	                            X = void 0,
	                            Y = void 0,
	                            Z = void 0;

	                        var r = void 0,
	                            g = void 0,
	                            b = void 0;

	                        if (!prim.heightMap) {

	                                prim.heightMap = this.elevationMap(dimensions[0], dimensions[2]); // x, z
	                        }

	                        var ct = 0;

	                        for (j = 0; j < height; ++j) {
	                                // row, j

	                                for (i = 0; i < width; ++i) {
	                                        // col, i

	                                        index = j * width + i;

	                                        S = i / (width - 1);
	                                        T = j / (height - 1);

	                                        X = S * terrainWidth - halfTerrainWidth;

	                                        Y = prim.heightMap[ct++] / 255;

	                                        Z = T * terrainHeight - halfTerrainHeight;

	                                        vertices.push(X, Y, Z);

	                                        normals.push(0, 0, 0);

	                                        texCoords.push(S, T);

	                                        r = Y;

	                                        b = 1 - Y;

	                                        g = 1.0 - Math.abs(r - b);

	                                        colors.push(r, g, b, 1.0);
	                                }
	                        }

	                        // Indices.
	                        index = 0;

	                        for (j = 0; j < terrainHeight - 1; j++) {

	                                for (i = 0; i < terrainWidth - 1; i++) {

	                                        var vertexIndex = row * terrainWidth + i;

	                                        indices.push(
	                                        // Top triangle (T0)
	                                        vertexIndex, // V0
	                                        vertexIndex + terrainWidth + 1, // V3
	                                        vertexIndex + 1, // V1
	                                        // Bottom triangle (T1)
	                                        vertexIndex, // V0
	                                        vertexIndex + terrainWidth, // V2
	                                        vertexIndex + terrainWidth + 1 // V3
	                                        );
	                                }
	                        }

	                        // Normals.

	                        for (i = 0, len = indices.length; i < len; i += 3) {

	                                var v1 = void 0,
	                                    v2 = void 0,
	                                    v3 = void 0,
	                                    v4 = void 0,
	                                    cross = void 0;

	                                v0 = vertices[indices[i + 0]];
	                                v1 = vertices[indices[i + 1]];
	                                v2 = vertices[indices[i + 2]];
	                                v3 = vec3.subtract(v3.create(), v2, v0);
	                                v4 = vec3.subtract(v3.create(), v3, v1, v0);

	                                var normal = vec3.normalize(vec3.cross(v4, v3));

	                                normals[indices[i + 0]] += normal;
	                                normals[indices[i + 1]] += normal;
	                                normals[indices[i + 2]] += normal;
	                        }

	                        for (i = 0, len = normals.length; i < len; ++i) {

	                                normals[i] = vec3.normalize(normals[i], normals[i]);

	                                normals[i] = 1.0; ///////////////////////////////////////////NOTE CHANGE
	                        }

	                        return this.createBuffers(gl, vertices, indices, texCoords, normals, colors);
	                }

	                /** 
	                 * Terrain generated via a heightmap. HeightMap MUST match 
	                 * divisions in X and Z coordinates.
	                 * https://github.com/BabylonJS/Babylon.js/blob/3fe3372053ac58505dbf7a2a6f3f52e3b92670c8/src/Mesh/babylon.mesh.vertexData.js
	                 * TODO: assumes a square Prim!!!!!!!!!!!!!
	                 */

	        }, {
	                key: 'geometryTerr',
	                value: function geometryTerr(prim) {

	                        /*
	                        // # P.xy store the position for which we want to calculate the normals
	                        // # height() here is a function that return the height at a point in the terrain
	                        // read neightbor heights using an arbitrary small offset
	                        vec3 off = vec3(1.0, 1.0, 0.0);
	                        float hL = height(P.xy - off.xz);
	                        float hR = height(P.xy + off.xz);
	                        float hD = height(P.xy - off.zy);
	                        float hU = height(P.xy + off.zy);
	                        // deduce terrain normal
	                        N.x = hL - hR;
	                        N.y = hD - hU;
	                        N.z = 2.0;
	                        N = normalize(N);
	                        http://stackoverflow.com/questions/13983189/opengl-how-to-calculate-normals-in-a-terrain-height-grid
	                        */

	                        var gl = this.webgl.getContext();

	                        var vec4 = this.glMatrix.vec4;

	                        var vec3 = this.glMatrix.vec3;

	                        var vec2 = this.glMatrix.vec2;

	                        var vertices = [];
	                        var indices = [];
	                        var texCoords = [];
	                        var normals = [];
	                        var colors = [];

	                        var row = void 0,
	                            col = void 0;

	                        var width = prim.dimensions[0];

	                        var height = prim.dimensions[2];

	                        var divisions = prim.divisions;

	                        var subdivisionsX = prim.divisions[0] || 1;

	                        var subdivisionsZ = prim.divisions[2] || prim.divisions[0] || 1;

	                        if (!prim.heightMap) {

	                                console.warn('terrain:' + prim.name + ' no heightmap, creating default');

	                                prim.heightMap = this.initHeightMap(prim.dimensions, prim.divisions);
	                        }

	                        // Create vector heightmap and default colors.

	                        var ct = 0;

	                        for (row = 0; row <= subdivisionsZ; row++) {

	                                for (col = 0; col <= subdivisionsX; col++) {

	                                        // TODO: COMPUTE Y RELATIVE TO SAMPLE FROM HEIGHTMAP

	                                        var y = prim.heightMap[ct++] / 256; /////// MAX HEIGHT = HEIGHT OF SIM

	                                        if (isNaN(y)) {
	                                                y = 0;
	                                        }

	                                        //console.log('row:' + row  + ' col:' + col + ' width:' + width + ' height:' + height + ' subdivisionsX:' + subdivisionsZ + ' subdivisionsZ:' + subdivisionsZ)

	                                        vertices.push(col * width / subdivisionsX - width / 2.0, y, (subdivisionsZ - row) * height / subdivisionsZ - height / 2.0);

	                                        //console.warn("row:" + row + " col:" + col + " VERTICES.length:" + vertices.length)

	                                        // Default normals.

	                                        normals.push(0, 1.0, 0);

	                                        // Texture coordinates.

	                                        texCoords.push(col / subdivisionsX, 1.0 - row / subdivisionsX);

	                                        // Default colors.

	                                        var r = y;

	                                        var b = 1 - y;

	                                        var g = 1.0 - Math.abs(r - b);

	                                        colors.push(r, g, b, 1.0);
	                                }
	                        }

	                        // Indices.

	                        for (row = 0; row < subdivisionsZ; row++) {

	                                for (col = 0; col < subdivisionsX; col++) {

	                                        indices.push(col + 1 + (row + 1) * (subdivisionsX + 1));
	                                        indices.push(col + 1 + row * (subdivisionsX + 1));
	                                        indices.push(col + row * (subdivisionsX + 1));
	                                        indices.push(col + (row + 1) * (subdivisionsX + 1));
	                                        indices.push(col + 1 + (row + 1) * (subdivisionsX + 1));
	                                        indices.push(col + row * (subdivisionsX + 1));
	                                }
	                        }

	                        // Normals.

	                        this.computeNormals(vertices, indices, normals);

	                        return this.createBuffers(gl, vertices, indices, texCoords, normals, colors);
	                }

	                /** 
	                 * Set a material for a prim.
	                 * @link http://webglfundamentals.org/webgl/lessons/webgl-less-code-more-fun.html
	                 * didn't use chroma (but could)
	                 * @link https://github.com/gka/chroma.js/blob/gh-pages/src/index.md
	                 */

	        }, {
	                key: 'setMaterial',
	                value: function setMaterial(prim) {

	                        return {

	                                u_colorMult: 0,

	                                u_diffuse: [1, 1, 1], //TODO: should be textures[0]

	                                u_specular: [1, 1, 1, 1],

	                                u_shininess: this.util.getRand(500),

	                                u_specularFactor: this.util.getRand(1) // TODO: MAY NOT BE RIGHT

	                        };
	                }

	                /** 
	                 * Create an standard 3d object.
	                 * @param {String} name assigned name of object (not necessarily unique).
	                 * @param {Number} scale size relative to unit vector (1,1,1).
	                 * @param {GLMatrix.vec3} position location of center of object.
	                 * @param {GLMatrix.vec3} acceleration movement vector (acceleration) of object.
	                 * @param {GLMatrix.vec3} rotation rotation vector (spin) around center of object.
	                 * @param {String} textureImage the path to an image used to create a texture.
	                 * @param {GLMatrix.vec4} color the default color of the object.
	                 */

	        }, {
	                key: 'createPrim',
	                value: function createPrim() {
	                        var name = arguments.length <= 0 || arguments[0] === undefined ? 'unknown' : arguments[0];
	                        var scale = arguments.length <= 1 || arguments[1] === undefined ? 1.0 : arguments[1];
	                        var dimensions = arguments[2];
	                        var divisions = arguments[3];
	                        var position = arguments[4];
	                        var acceleration = arguments[5];
	                        var rotation = arguments[6];
	                        var angular = arguments[7];
	                        var textureImage = arguments[8];
	                        var color = arguments[9];


	                        var gl = this.webgl.getContext();

	                        var glMatrix = this.glMatrix;

	                        var vec3 = this.glMatrix.vec3;

	                        var mat4 = this.glMatrix.mat4;

	                        var prim = {};

	                        prim.id = this.setId();

	                        prim.name = name;

	                        prim.scale = scale;

	                        prim.dimensions = dimensions || vec3.fromValues(1, 1, 1);

	                        prim.divisions = divisions || vec3.fromValues(1, 1, 1);

	                        prim.position = position || vec3.create();

	                        prim.acceleration = acceleration || vec3.create();

	                        // The absolute .rotation object includes rotation on x, y, z axis

	                        prim.rotation = rotation || vec3.create();

	                        // The acceleration object indicates velocity on angular motion in x, y, z

	                        prim.angular = angular || vec3.create();

	                        // The orbit defines a center that the object orbits around, and orbital velocity.

	                        prim.orbitRadius = 0.0;

	                        prim.orbitAngular = 0.0;

	                        // Waypoints for scripted motion.

	                        prim.waypoints = [];

	                        // Store multiple textures for one Prim.

	                        prim.textures = [];

	                        // Store multiple sounds for one Prim.

	                        prim.audio = [];

	                        // Store multiple videos for one Prim.

	                        prim.video = [];

	                        // Multiple textures per Prim. Rendering defines how textures for each Prim type are used.

	                        for (var i = 0; i < textureImage.length; i++) {

	                                this.loadTexture.load(textureImage[i], prim);
	                        }

	                        // Define Prim material (only one material type at a time per Prim ).

	                        prim.material = this.setMaterial();

	                        // Define Prim light (it glows) not how it is lit.

	                        this.light = {
	                                direction: [1, 1, 1],
	                                color: [255, 255, 255]
	                        };

	                        // Parent Node.

	                        prim.parentNode = null;

	                        // Child Prim array.

	                        prim.children = [];

	                        // Standard Prim properties for position, translation, rotation, orbits. Used by shader/renderer objects (e.g. shaderTexture).

	                        // Note: should use scale matrix
	                        // TODO: @link https://nickdesaulniers.github.io/RawWebGL/#/16

	                        prim.setMV = function (mvMatrix) {

	                                var p = prim;

	                                mat4.identity(mvMatrix);

	                                var z = -5;

	                                // Translate.

	                                vec3.add(p.position, p.position, p.acceleration);

	                                mat4.translate(mvMatrix, mvMatrix, [p.position[0], p.position[1], z + p.position[2]]);

	                                // If orbiting, set orbit.

	                                // Rotate.

	                                vec3.add(p.rotation, p.rotation, p.angular);

	                                mat4.rotate(mvMatrix, mvMatrix, p.rotation[0], [1, 0, 0]);
	                                mat4.rotate(mvMatrix, mvMatrix, p.rotation[1], [0, 1, 0]);
	                                mat4.rotate(mvMatrix, mvMatrix, p.rotation[2], [0, 0, 1]);

	                                return mvMatrix;
	                        };

	                        prim.renderId = -1; // NOT ASSIGNED. TODO: Assign a renderer to each Prim.

	                        // Prim transforms.

	                        return prim;
	                }

	                /** 
	                 * create a Cube object.
	                 * @param {String} name of object
	                 * @param {Number} scale
	                 */

	        }, {
	                key: 'createCube',
	                value: function createCube(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color) {

	                        var cube = this.createPrim(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color);

	                        cube.geometry = this.geometryCube(cube);

	                        cube.type = this.type.CUBE;

	                        this.util.primReadout(cube);

	                        this.objs.push(cube);

	                        return cube;
	                }
	        }, {
	                key: 'createIcoSphere',
	                value: function createIcoSphere(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color) {

	                        var icoSphere = this.createPrim(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color);

	                        icoSphere.geometry = this.geometryIcoSphere(icoSphere);

	                        icoSphere.type = this.type.ICOSPHERE;

	                        this.util.primReadout(icoSphere);

	                        this.objs.push(icoSphere);

	                        return icoSphere;
	                }
	        }, {
	                key: 'createDome',
	                value: function createDome(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color) {

	                        var dome = this.createPrim(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color);

	                        dome.geometry = this.geometryDome(dome);

	                        dome.type = this.type.DOME;

	                        this.util.primReadout(dome);

	                        this.objs.push(dome);

	                        return dome;
	                }
	        }, {
	                key: 'createTerrain',
	                value: function createTerrain(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color, heightMap) {

	                        var terrain = this.createPrim(name, scale, dimensions, divisions, position, acceleration, rotation, angular, textureImage, color);

	                        if (heightMap) {

	                                terrain.heightMap = heightMap;
	                        } else {

	                                terrain.heightMap = null;
	                        }

	                        terrain.geometry = this.geometryTerrain(terrain);

	                        terrain.type = this.type.TERRAIN;

	                        this.util.primReadout(terrain);

	                        this.objs.push(terrain);

	                        return terrain;
	                }
	        }]);

	        return prim;
	}();

	exports.default = prim;

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var world = function () {

	        /** 
	         * The World class creates the scene, and should be uniquely 
	         * written for each instance using the WebVR-Mini library.
	         * Required functions:
	         * getVS() - the vertex shader.
	         * getFS() - get the fragment shader.
	         * rer() - update on rer of <canvas>.
	         * render() - rendering loop.
	         * init() - create the world for this first time.
	         * constructor() - initialize, passing in WebVR-Mini object.
	         */

	        /** 
	         * constructor.
	         * @param {WeVRMini} webvr the webvr module.
	         */
	        function world(webgl, prim, renderer) {
	                _classCallCheck(this, world);

	                console.log('in World class');

	                this.webgl = webgl;

	                this.util = webgl.util;

	                this.prim = prim;

	                this.renderer = renderer;

	                this.canvas = webgl.getCanvas();

	                this.glMatrix = webgl.glMatrix;

	                this.pMatrix = this.glMatrix.mat4.create();

	                this.mvMatrix = this.glMatrix.mat4.create();

	                this.last = performance.now();

	                this.counter = 0;

	                // Bind the render loop (best current method)

	                this.render = this.render.bind(this);
	        }

	        /**
	         * Handle resize event for the World dimensions.
	         * @param {Number} width world width (x-axis) in units.
	         * @param {Number} height world height (y-axis) in units.
	         * @param {Number} depth world depth (z-axis) in units.
	         */


	        _createClass(world, [{
	                key: 'resize',
	                value: function resize(width, height, depth) {}

	                /** 
	                 * Create the world. Load shader/renderer objects, and 
	                 * create objects to render in the world.
	                 */

	        }, {
	                key: 'init',
	                value: function init() {

	                        var vec3 = this.glMatrix.vec3;

	                        var vec4 = this.glMatrix.vec4;

	                        var util = this.util;

	                        // TEXTURED SHADER.

	                        this.textureObjList = [];

	                        this.textureObjList.push(this.prim.createCube('first cube', // name
	                        1.0, // scale
	                        vec3.fromValues(1, 1, 1), // dimensions
	                        vec3.fromValues(1, 1, 1), // divisions
	                        vec3.fromValues(0, 0, 0), // position (absolute)
	                        vec3.fromValues(0, 0, 0), // acceleration in x, y, z
	                        vec3.fromValues(util.degToRad(0), util.degToRad(0), util.degToRad(0)), // rotation (absolute)
	                        vec3.fromValues(util.degToRad(1), util.degToRad(1), util.degToRad(1)), // angular velocity in x, y, x
	                        ['img/crate.png', 'img/webvr-logo1.png'], // texture image
	                        vec4.fromValues(0.5, 1.0, 0.2, 1.0)));

	                        this.textureObjList.push(this.prim.createCube('toji cube', 1.0, vec3.fromValues(1, 1, 1), // dimensions
	                        vec3.fromValues(1, 1, 1), // divisions
	                        vec3.fromValues(5, 1, -3), // position (absolute)
	                        vec3.fromValues(0, 0, 0), // acceleration in x, y, z
	                        vec3.fromValues(util.degToRad(40), util.degToRad(0), util.degToRad(0)), // rotation (absolute)
	                        vec3.fromValues(util.degToRad(0), util.degToRad(1), util.degToRad(0)), // angular velocity in x, y, x
	                        ['img/webvr-logo2.png'], vec4.fromValues(0.5, 1.0, 0.2, 1.0) // color
	                        ));

	                        this.vs1 = this.renderer.shaderTexture.init(this.textureObjList);

	                        // COLORED SHADER.

	                        this.colorObjList = [];

	                        this.colorObjList.push(this.prim.createCube('colored cube', 1.0, vec3.fromValues(1, 1, 1), // dimensions
	                        vec3.fromValues(1, 1, 1), // divisions
	                        vec3.fromValues(-1, 2, -3), // position (absolute)
	                        vec3.fromValues(0, 0, 0), // acceleration in x, y, z
	                        vec3.fromValues(util.degToRad(20), util.degToRad(0), util.degToRad(0)), // rotation (absolute)
	                        vec3.fromValues(util.degToRad(0), util.degToRad(1), util.degToRad(0)), // angular velocity in x, y, x
	                        ['img/webvr-logo3.png'], // texture present, NOT USED
	                        vec4.fromValues(0.5, 1.0, 0.2, 1.0) // color
	                        ));

	                        this.vs2 = this.renderer.shaderColor.init(this.colorObjList);

	                        // LIT TEXTURE SHADER.

	                        this.dirlightTextureObjList = [];

	                        this.dirlightTextureObjList.push(this.prim.createCube('lit cube', 1.0, vec3.fromValues(1, 1, 1), // dimensions
	                        vec3.fromValues(1, 1, 1), // divisions
	                        vec3.fromValues(-3, -2, -3), // position (absolute)
	                        vec3.fromValues(0, 0, 0), // acceleration in x, y, z
	                        vec3.fromValues(util.degToRad(20), util.degToRad(0), util.degToRad(0)), // rotation (absolute)
	                        vec3.fromValues(util.degToRad(0), util.degToRad(1), util.degToRad(0)), // angular velocity in x, y, x
	                        ['img/webvr-logo4.png'], // texture present, NOT USED
	                        vec4.fromValues(0.5, 1.0, 0.2, 1.0) // color
	                        ));

	                        var heightMap = [39, 159, 227, 15, 211, 206, 250, 110, 26, 6, 144, 71, 7, 117, 97, 46, 239, 14, 249, 13, 225, 26, 28, 197, 174, 58, 79, 25, 88, 236, 45, 243, 203, 240, 195, 100, 187, 12, 202, 167, 207, 209, 138, 33, 219, 152, 154, 55, 137, 238, 196, 209, 37, 27, 240, 97, 46, 220, 114, 52, 193, 78, 170, 163];

	                        this.dirlightTextureObjList.push(this.prim.createTerrain('terrain', 1.0, vec3.fromValues(2, 2, 2), // dimensions
	                        vec3.fromValues(100, 255, 100), // divisions
	                        vec3.fromValues(1.5, -3.5, -2), // position (absolute)
	                        vec3.fromValues(0, 0, 0), // acceleration in x, y, z
	                        vec3.fromValues(util.degToRad(0), util.degToRad(0), util.degToRad(0)), // rotation (absolute)
	                        vec3.fromValues(util.degToRad(0), util.degToRad(0), util.degToRad(0)), // angular velocity in x, y, x
	                        ['img/mozvr-logo1.png'], // texture present, NOT USED
	                        vec4.fromValues(0.5, 1.0, 0.2, 1.0), // color
	                        null //heightMap                              // heightmap
	                        ));

	                        window.terrain = this.dirlightTextureObjList[1];

	                        this.vs3 = this.renderer.shaderDirlightTexture.init(this.dirlightTextureObjList);

	                        // Finished object creation, start rendering...

	                        this.render();
	                }

	                /**
	                 * Create objects specific to this world.
	                 */

	        }, {
	                key: 'create',
	                value: function create() {}

	                /** 
	                 * Update world.related properties, e.g. a HUD or framrate readout.
	                 */

	        }, {
	                key: 'update',
	                value: function update() {

	                        // fps calculation.

	                        var now = performance.now();

	                        var delta = now - this.last;

	                        this.last = now;

	                        this.counter++;

	                        if (this.counter > 300) {

	                                this.counter = 0;

	                                /////////console.log( 'delta:' + parseInt( 1000 / delta ) + ' fps' );
	                        }
	                }

	                /** 
	                 * render the world. Update Prims locally, then call shader/renderer 
	                 * objects to do rendering. this.render was bound (ES5 method) in 
	                 * the constructor.
	                 */

	        }, {
	                key: 'render',
	                value: function render() {

	                        this.update();

	                        this.webgl.clear();

	                        // TODO: Don't render until we update in the correct order.

	                        this.vs3.render();

	                        this.vs2.render();

	                        this.vs1.render();

	                        requestAnimationFrame(this.render);
	                }
	        }]);

	        return world;
	}();

	exports.default = world;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview gl-matrix - High performance matrix and vector operations
	 * @author Brandon Jones
	 * @author Colin MacKenzie IV
	 * @version 2.3.2
	 */

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */
	// END HEADER

	exports.glMatrix = __webpack_require__(23);
	exports.mat2 = __webpack_require__(24);
	exports.mat2d = __webpack_require__(25);
	exports.mat3 = __webpack_require__(26);
	exports.mat4 = __webpack_require__(27);
	exports.quat = __webpack_require__(28);
	exports.vec2 = __webpack_require__(31);
	exports.vec3 = __webpack_require__(29);
	exports.vec4 = __webpack_require__(30);

/***/ },
/* 23 */
/***/ function(module, exports) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	/**
	 * @class Common utilities
	 * @name glMatrix
	 */
	var glMatrix = {};

	// Configuration Constants
	glMatrix.EPSILON = 0.000001;
	glMatrix.ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
	glMatrix.RANDOM = Math.random;
	glMatrix.ENABLE_SIMD = false;

	// Capability detection
	glMatrix.SIMD_AVAILABLE = (glMatrix.ARRAY_TYPE === Float32Array) && ('SIMD' in this);
	glMatrix.USE_SIMD = glMatrix.ENABLE_SIMD && glMatrix.SIMD_AVAILABLE;

	/**
	 * Sets the type of array used when creating new vectors and matrices
	 *
	 * @param {Type} type Array type, such as Float32Array or Array
	 */
	glMatrix.setMatrixArrayType = function(type) {
	    glMatrix.ARRAY_TYPE = type;
	}

	var degree = Math.PI / 180;

	/**
	* Convert Degree To Radian
	*
	* @param {Number} Angle in Degrees
	*/
	glMatrix.toRadian = function(a){
	     return a * degree;
	}

	/**
	 * Tests whether or not the arguments have approximately the same value, within an absolute
	 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less 
	 * than or equal to 1.0, and a relative tolerance is used for larger values)
	 * 
	 * @param {Number} a The first number to test.
	 * @param {Number} b The second number to test.
	 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
	 */
	glMatrix.equals = function(a, b) {
		return Math.abs(a - b) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a), Math.abs(b));
	}

	module.exports = glMatrix;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);

	/**
	 * @class 2x2 Matrix
	 * @name mat2
	 */
	var mat2 = {};

	/**
	 * Creates a new identity mat2
	 *
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};

	/**
	 * Creates a new mat2 initialized with values from an existing matrix
	 *
	 * @param {mat2} a matrix to clone
	 * @returns {mat2} a new 2x2 matrix
	 */
	mat2.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};

	/**
	 * Copy the values from one mat2 to another
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};

	/**
	 * Set a mat2 to the identity matrix
	 *
	 * @param {mat2} out the receiving matrix
	 * @returns {mat2} out
	 */
	mat2.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};

	/**
	 * Create a new mat2 with the given values
	 *
	 * @param {Number} m00 Component in column 0, row 0 position (index 0)
	 * @param {Number} m01 Component in column 0, row 1 position (index 1)
	 * @param {Number} m10 Component in column 1, row 0 position (index 2)
	 * @param {Number} m11 Component in column 1, row 1 position (index 3)
	 * @returns {mat2} out A new 2x2 matrix
	 */
	mat2.fromValues = function(m00, m01, m10, m11) {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m10;
	    out[3] = m11;
	    return out;
	};

	/**
	 * Set the components of a mat2 to the given values
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {Number} m00 Component in column 0, row 0 position (index 0)
	 * @param {Number} m01 Component in column 0, row 1 position (index 1)
	 * @param {Number} m10 Component in column 1, row 0 position (index 2)
	 * @param {Number} m11 Component in column 1, row 1 position (index 3)
	 * @returns {mat2} out
	 */
	mat2.set = function(out, m00, m01, m10, m11) {
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m10;
	    out[3] = m11;
	    return out;
	};


	/**
	 * Transpose the values of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a1 = a[1];
	        out[1] = a[2];
	        out[2] = a1;
	    } else {
	        out[0] = a[0];
	        out[1] = a[2];
	        out[2] = a[1];
	        out[3] = a[3];
	    }
	    
	    return out;
	};

	/**
	 * Inverts a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

	        // Calculate the determinant
	        det = a0 * a3 - a2 * a1;

	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;
	    
	    out[0] =  a3 * det;
	    out[1] = -a1 * det;
	    out[2] = -a2 * det;
	    out[3] =  a0 * det;

	    return out;
	};

	/**
	 * Calculates the adjugate of a mat2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the source matrix
	 * @returns {mat2} out
	 */
	mat2.adjoint = function(out, a) {
	    // Caching this value is nessecary if out == a
	    var a0 = a[0];
	    out[0] =  a[3];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] =  a0;

	    return out;
	};

	/**
	 * Calculates the determinant of a mat2
	 *
	 * @param {mat2} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2.determinant = function (a) {
	    return a[0] * a[3] - a[2] * a[1];
	};

	/**
	 * Multiplies two mat2's
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the first operand
	 * @param {mat2} b the second operand
	 * @returns {mat2} out
	 */
	mat2.multiply = function (out, a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    return out;
	};

	/**
	 * Alias for {@link mat2.multiply}
	 * @function
	 */
	mat2.mul = mat2.multiply;

	/**
	 * Rotates a mat2 by the given angle
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2} out
	 */
	mat2.rotate = function (out, a, rad) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = a0 *  c + a2 * s;
	    out[1] = a1 *  c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    return out;
	};

	/**
	 * Scales the mat2 by the dimensions in the given vec2
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat2} out
	 **/
	mat2.scale = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    return out;
	};

	/**
	 * Creates a matrix from a given angle
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2.identity(dest);
	 *     mat2.rotate(dest, dest, rad);
	 *
	 * @param {mat2} out mat2 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2} out
	 */
	mat2.fromRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = c;
	    out[1] = s;
	    out[2] = -s;
	    out[3] = c;
	    return out;
	}

	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2.identity(dest);
	 *     mat2.scale(dest, dest, vec);
	 *
	 * @param {mat2} out mat2 receiving operation result
	 * @param {vec2} v Scaling vector
	 * @returns {mat2} out
	 */
	mat2.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = v[1];
	    return out;
	}

	/**
	 * Returns a string representation of a mat2
	 *
	 * @param {mat2} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2.str = function (a) {
	    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};

	/**
	 * Returns Frobenius norm of a mat2
	 *
	 * @param {mat2} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat2.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
	};

	/**
	 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
	 * @param {mat2} L the lower triangular matrix 
	 * @param {mat2} D the diagonal matrix 
	 * @param {mat2} U the upper triangular matrix 
	 * @param {mat2} a the input matrix to factorize
	 */

	mat2.LDU = function (L, D, U, a) { 
	    L[2] = a[2]/a[0]; 
	    U[0] = a[0]; 
	    U[1] = a[1]; 
	    U[3] = a[3] - L[2] * U[1]; 
	    return [L, D, U];       
	}; 

	/**
	 * Adds two mat2's
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the first operand
	 * @param {mat2} b the second operand
	 * @returns {mat2} out
	 */
	mat2.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    return out;
	};

	/**
	 * Subtracts matrix b from matrix a
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the first operand
	 * @param {mat2} b the second operand
	 * @returns {mat2} out
	 */
	mat2.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    return out;
	};

	/**
	 * Alias for {@link mat2.subtract}
	 * @function
	 */
	mat2.sub = mat2.subtract;

	/**
	 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param {mat2} a The first matrix.
	 * @param {mat2} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat2.exactEquals = function (a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
	};

	/**
	 * Returns whether or not the matrices have approximately the same elements in the same position.
	 *
	 * @param {mat2} a The first matrix.
	 * @param {mat2} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat2.equals = function (a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)));
	};

	/**
	 * Multiply each element of the matrix by a scalar.
	 *
	 * @param {mat2} out the receiving matrix
	 * @param {mat2} a the matrix to scale
	 * @param {Number} b amount to scale the matrix's elements by
	 * @returns {mat2} out
	 */
	mat2.multiplyScalar = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    return out;
	};

	/**
	 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
	 *
	 * @param {mat2} out the receiving vector
	 * @param {mat2} a the first operand
	 * @param {mat2} b the second operand
	 * @param {Number} scale the amount to scale b's elements by before adding
	 * @returns {mat2} out
	 */
	mat2.multiplyScalarAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    return out;
	};

	module.exports = mat2;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);

	/**
	 * @class 2x3 Matrix
	 * @name mat2d
	 * 
	 * @description 
	 * A mat2d contains six elements defined as:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty]
	 * </pre>
	 * This is a short form for the 3x3 matrix:
	 * <pre>
	 * [a, c, tx,
	 *  b, d, ty,
	 *  0, 0, 1]
	 * </pre>
	 * The last row is ignored so the array is shorter and operations are faster.
	 */
	var mat2d = {};

	/**
	 * Creates a new identity mat2d
	 *
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(6);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};

	/**
	 * Creates a new mat2d initialized with values from an existing matrix
	 *
	 * @param {mat2d} a matrix to clone
	 * @returns {mat2d} a new 2x3 matrix
	 */
	mat2d.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(6);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};

	/**
	 * Copy the values from one mat2d to another
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    return out;
	};

	/**
	 * Set a mat2d to the identity matrix
	 *
	 * @param {mat2d} out the receiving matrix
	 * @returns {mat2d} out
	 */
	mat2d.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	};

	/**
	 * Create a new mat2d with the given values
	 *
	 * @param {Number} a Component A (index 0)
	 * @param {Number} b Component B (index 1)
	 * @param {Number} c Component C (index 2)
	 * @param {Number} d Component D (index 3)
	 * @param {Number} tx Component TX (index 4)
	 * @param {Number} ty Component TY (index 5)
	 * @returns {mat2d} A new mat2d
	 */
	mat2d.fromValues = function(a, b, c, d, tx, ty) {
	    var out = new glMatrix.ARRAY_TYPE(6);
	    out[0] = a;
	    out[1] = b;
	    out[2] = c;
	    out[3] = d;
	    out[4] = tx;
	    out[5] = ty;
	    return out;
	};

	/**
	 * Set the components of a mat2d to the given values
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {Number} a Component A (index 0)
	 * @param {Number} b Component B (index 1)
	 * @param {Number} c Component C (index 2)
	 * @param {Number} d Component D (index 3)
	 * @param {Number} tx Component TX (index 4)
	 * @param {Number} ty Component TY (index 5)
	 * @returns {mat2d} out
	 */
	mat2d.set = function(out, a, b, c, d, tx, ty) {
	    out[0] = a;
	    out[1] = b;
	    out[2] = c;
	    out[3] = d;
	    out[4] = tx;
	    out[5] = ty;
	    return out;
	};

	/**
	 * Inverts a mat2d
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the source matrix
	 * @returns {mat2d} out
	 */
	mat2d.invert = function(out, a) {
	    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
	        atx = a[4], aty = a[5];

	    var det = aa * ad - ab * ac;
	    if(!det){
	        return null;
	    }
	    det = 1.0 / det;

	    out[0] = ad * det;
	    out[1] = -ab * det;
	    out[2] = -ac * det;
	    out[3] = aa * det;
	    out[4] = (ac * aty - ad * atx) * det;
	    out[5] = (ab * atx - aa * aty) * det;
	    return out;
	};

	/**
	 * Calculates the determinant of a mat2d
	 *
	 * @param {mat2d} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat2d.determinant = function (a) {
	    return a[0] * a[3] - a[1] * a[2];
	};

	/**
	 * Multiplies two mat2d's
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the first operand
	 * @param {mat2d} b the second operand
	 * @returns {mat2d} out
	 */
	mat2d.multiply = function (out, a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	    out[0] = a0 * b0 + a2 * b1;
	    out[1] = a1 * b0 + a3 * b1;
	    out[2] = a0 * b2 + a2 * b3;
	    out[3] = a1 * b2 + a3 * b3;
	    out[4] = a0 * b4 + a2 * b5 + a4;
	    out[5] = a1 * b4 + a3 * b5 + a5;
	    return out;
	};

	/**
	 * Alias for {@link mat2d.multiply}
	 * @function
	 */
	mat2d.mul = mat2d.multiply;

	/**
	 * Rotates a mat2d by the given angle
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2d} out
	 */
	mat2d.rotate = function (out, a, rad) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        s = Math.sin(rad),
	        c = Math.cos(rad);
	    out[0] = a0 *  c + a2 * s;
	    out[1] = a1 *  c + a3 * s;
	    out[2] = a0 * -s + a2 * c;
	    out[3] = a1 * -s + a3 * c;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	};

	/**
	 * Scales the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.scale = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0 * v0;
	    out[1] = a1 * v0;
	    out[2] = a2 * v1;
	    out[3] = a3 * v1;
	    out[4] = a4;
	    out[5] = a5;
	    return out;
	};

	/**
	 * Translates the mat2d by the dimensions in the given vec2
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to translate
	 * @param {vec2} v the vec2 to translate the matrix by
	 * @returns {mat2d} out
	 **/
	mat2d.translate = function(out, a, v) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
	        v0 = v[0], v1 = v[1];
	    out[0] = a0;
	    out[1] = a1;
	    out[2] = a2;
	    out[3] = a3;
	    out[4] = a0 * v0 + a2 * v1 + a4;
	    out[5] = a1 * v0 + a3 * v1 + a5;
	    return out;
	};

	/**
	 * Creates a matrix from a given angle
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2d.identity(dest);
	 *     mat2d.rotate(dest, dest, rad);
	 *
	 * @param {mat2d} out mat2d receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat2d} out
	 */
	mat2d.fromRotation = function(out, rad) {
	    var s = Math.sin(rad), c = Math.cos(rad);
	    out[0] = c;
	    out[1] = s;
	    out[2] = -s;
	    out[3] = c;
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}

	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2d.identity(dest);
	 *     mat2d.scale(dest, dest, vec);
	 *
	 * @param {mat2d} out mat2d receiving operation result
	 * @param {vec2} v Scaling vector
	 * @returns {mat2d} out
	 */
	mat2d.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = v[1];
	    out[4] = 0;
	    out[5] = 0;
	    return out;
	}

	/**
	 * Creates a matrix from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat2d.identity(dest);
	 *     mat2d.translate(dest, dest, vec);
	 *
	 * @param {mat2d} out mat2d receiving operation result
	 * @param {vec2} v Translation vector
	 * @returns {mat2d} out
	 */
	mat2d.fromTranslation = function(out, v) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    out[4] = v[0];
	    out[5] = v[1];
	    return out;
	}

	/**
	 * Returns a string representation of a mat2d
	 *
	 * @param {mat2d} a matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat2d.str = function (a) {
	    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
	};

	/**
	 * Returns Frobenius norm of a mat2d
	 *
	 * @param {mat2d} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat2d.frob = function (a) { 
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
	}; 

	/**
	 * Adds two mat2d's
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the first operand
	 * @param {mat2d} b the second operand
	 * @returns {mat2d} out
	 */
	mat2d.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    out[4] = a[4] + b[4];
	    out[5] = a[5] + b[5];
	    return out;
	};

	/**
	 * Subtracts matrix b from matrix a
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the first operand
	 * @param {mat2d} b the second operand
	 * @returns {mat2d} out
	 */
	mat2d.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    out[4] = a[4] - b[4];
	    out[5] = a[5] - b[5];
	    return out;
	};

	/**
	 * Alias for {@link mat2d.subtract}
	 * @function
	 */
	mat2d.sub = mat2d.subtract;

	/**
	 * Multiply each element of the matrix by a scalar.
	 *
	 * @param {mat2d} out the receiving matrix
	 * @param {mat2d} a the matrix to scale
	 * @param {Number} b amount to scale the matrix's elements by
	 * @returns {mat2d} out
	 */
	mat2d.multiplyScalar = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    out[4] = a[4] * b;
	    out[5] = a[5] * b;
	    return out;
	};

	/**
	 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
	 *
	 * @param {mat2d} out the receiving vector
	 * @param {mat2d} a the first operand
	 * @param {mat2d} b the second operand
	 * @param {Number} scale the amount to scale b's elements by before adding
	 * @returns {mat2d} out
	 */
	mat2d.multiplyScalarAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    out[4] = a[4] + (b[4] * scale);
	    out[5] = a[5] + (b[5] * scale);
	    return out;
	};

	/**
	 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param {mat2d} a The first matrix.
	 * @param {mat2d} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat2d.exactEquals = function (a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
	};

	/**
	 * Returns whether or not the matrices have approximately the same elements in the same position.
	 *
	 * @param {mat2d} a The first matrix.
	 * @param {mat2d} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat2d.equals = function (a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
	    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
	            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
	            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)));
	};

	module.exports = mat2d;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);

	/**
	 * @class 3x3 Matrix
	 * @name mat3
	 */
	var mat3 = {};

	/**
	 * Creates a new identity mat3
	 *
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(9);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};

	/**
	 * Copies the upper-left 3x3 values into the given mat3.
	 *
	 * @param {mat3} out the receiving 3x3 matrix
	 * @param {mat4} a   the source 4x4 matrix
	 * @returns {mat3} out
	 */
	mat3.fromMat4 = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[4];
	    out[4] = a[5];
	    out[5] = a[6];
	    out[6] = a[8];
	    out[7] = a[9];
	    out[8] = a[10];
	    return out;
	};

	/**
	 * Creates a new mat3 initialized with values from an existing matrix
	 *
	 * @param {mat3} a matrix to clone
	 * @returns {mat3} a new 3x3 matrix
	 */
	mat3.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(9);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};

	/**
	 * Copy the values from one mat3 to another
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};

	/**
	 * Create a new mat3 with the given values
	 *
	 * @param {Number} m00 Component in column 0, row 0 position (index 0)
	 * @param {Number} m01 Component in column 0, row 1 position (index 1)
	 * @param {Number} m02 Component in column 0, row 2 position (index 2)
	 * @param {Number} m10 Component in column 1, row 0 position (index 3)
	 * @param {Number} m11 Component in column 1, row 1 position (index 4)
	 * @param {Number} m12 Component in column 1, row 2 position (index 5)
	 * @param {Number} m20 Component in column 2, row 0 position (index 6)
	 * @param {Number} m21 Component in column 2, row 1 position (index 7)
	 * @param {Number} m22 Component in column 2, row 2 position (index 8)
	 * @returns {mat3} A new mat3
	 */
	mat3.fromValues = function(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
	    var out = new glMatrix.ARRAY_TYPE(9);
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m10;
	    out[4] = m11;
	    out[5] = m12;
	    out[6] = m20;
	    out[7] = m21;
	    out[8] = m22;
	    return out;
	};

	/**
	 * Set the components of a mat3 to the given values
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {Number} m00 Component in column 0, row 0 position (index 0)
	 * @param {Number} m01 Component in column 0, row 1 position (index 1)
	 * @param {Number} m02 Component in column 0, row 2 position (index 2)
	 * @param {Number} m10 Component in column 1, row 0 position (index 3)
	 * @param {Number} m11 Component in column 1, row 1 position (index 4)
	 * @param {Number} m12 Component in column 1, row 2 position (index 5)
	 * @param {Number} m20 Component in column 2, row 0 position (index 6)
	 * @param {Number} m21 Component in column 2, row 1 position (index 7)
	 * @param {Number} m22 Component in column 2, row 2 position (index 8)
	 * @returns {mat3} out
	 */
	mat3.set = function(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m10;
	    out[4] = m11;
	    out[5] = m12;
	    out[6] = m20;
	    out[7] = m21;
	    out[8] = m22;
	    return out;
	};

	/**
	 * Set a mat3 to the identity matrix
	 *
	 * @param {mat3} out the receiving matrix
	 * @returns {mat3} out
	 */
	mat3.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	};

	/**
	 * Transpose the values of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a12 = a[5];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a01;
	        out[5] = a[7];
	        out[6] = a02;
	        out[7] = a12;
	    } else {
	        out[0] = a[0];
	        out[1] = a[3];
	        out[2] = a[6];
	        out[3] = a[1];
	        out[4] = a[4];
	        out[5] = a[7];
	        out[6] = a[2];
	        out[7] = a[5];
	        out[8] = a[8];
	    }
	    
	    return out;
	};

	/**
	 * Inverts a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],

	        b01 = a22 * a11 - a12 * a21,
	        b11 = -a22 * a10 + a12 * a20,
	        b21 = a21 * a10 - a11 * a20,

	        // Calculate the determinant
	        det = a00 * b01 + a01 * b11 + a02 * b21;

	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;

	    out[0] = b01 * det;
	    out[1] = (-a22 * a01 + a02 * a21) * det;
	    out[2] = (a12 * a01 - a02 * a11) * det;
	    out[3] = b11 * det;
	    out[4] = (a22 * a00 - a02 * a20) * det;
	    out[5] = (-a12 * a00 + a02 * a10) * det;
	    out[6] = b21 * det;
	    out[7] = (-a21 * a00 + a01 * a20) * det;
	    out[8] = (a11 * a00 - a01 * a10) * det;
	    return out;
	};

	/**
	 * Calculates the adjugate of a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the source matrix
	 * @returns {mat3} out
	 */
	mat3.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];

	    out[0] = (a11 * a22 - a12 * a21);
	    out[1] = (a02 * a21 - a01 * a22);
	    out[2] = (a01 * a12 - a02 * a11);
	    out[3] = (a12 * a20 - a10 * a22);
	    out[4] = (a00 * a22 - a02 * a20);
	    out[5] = (a02 * a10 - a00 * a12);
	    out[6] = (a10 * a21 - a11 * a20);
	    out[7] = (a01 * a20 - a00 * a21);
	    out[8] = (a00 * a11 - a01 * a10);
	    return out;
	};

	/**
	 * Calculates the determinant of a mat3
	 *
	 * @param {mat3} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat3.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8];

	    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
	};

	/**
	 * Multiplies two mat3's
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the first operand
	 * @param {mat3} b the second operand
	 * @returns {mat3} out
	 */
	mat3.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],

	        b00 = b[0], b01 = b[1], b02 = b[2],
	        b10 = b[3], b11 = b[4], b12 = b[5],
	        b20 = b[6], b21 = b[7], b22 = b[8];

	    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
	    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
	    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

	    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
	    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
	    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

	    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
	    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
	    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
	    return out;
	};

	/**
	 * Alias for {@link mat3.multiply}
	 * @function
	 */
	mat3.mul = mat3.multiply;

	/**
	 * Translate a mat3 by the given vector
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to translate
	 * @param {vec2} v vector to translate by
	 * @returns {mat3} out
	 */
	mat3.translate = function(out, a, v) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],
	        x = v[0], y = v[1];

	    out[0] = a00;
	    out[1] = a01;
	    out[2] = a02;

	    out[3] = a10;
	    out[4] = a11;
	    out[5] = a12;

	    out[6] = x * a00 + y * a10 + a20;
	    out[7] = x * a01 + y * a11 + a21;
	    out[8] = x * a02 + y * a12 + a22;
	    return out;
	};

	/**
	 * Rotates a mat3 by the given angle
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat3} out
	 */
	mat3.rotate = function (out, a, rad) {
	    var a00 = a[0], a01 = a[1], a02 = a[2],
	        a10 = a[3], a11 = a[4], a12 = a[5],
	        a20 = a[6], a21 = a[7], a22 = a[8],

	        s = Math.sin(rad),
	        c = Math.cos(rad);

	    out[0] = c * a00 + s * a10;
	    out[1] = c * a01 + s * a11;
	    out[2] = c * a02 + s * a12;

	    out[3] = c * a10 - s * a00;
	    out[4] = c * a11 - s * a01;
	    out[5] = c * a12 - s * a02;

	    out[6] = a20;
	    out[7] = a21;
	    out[8] = a22;
	    return out;
	};

	/**
	 * Scales the mat3 by the dimensions in the given vec2
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to rotate
	 * @param {vec2} v the vec2 to scale the matrix by
	 * @returns {mat3} out
	 **/
	mat3.scale = function(out, a, v) {
	    var x = v[0], y = v[1];

	    out[0] = x * a[0];
	    out[1] = x * a[1];
	    out[2] = x * a[2];

	    out[3] = y * a[3];
	    out[4] = y * a[4];
	    out[5] = y * a[5];

	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    return out;
	};

	/**
	 * Creates a matrix from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.translate(dest, dest, vec);
	 *
	 * @param {mat3} out mat3 receiving operation result
	 * @param {vec2} v Translation vector
	 * @returns {mat3} out
	 */
	mat3.fromTranslation = function(out, v) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 1;
	    out[5] = 0;
	    out[6] = v[0];
	    out[7] = v[1];
	    out[8] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from a given angle
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.rotate(dest, dest, rad);
	 *
	 * @param {mat3} out mat3 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat3} out
	 */
	mat3.fromRotation = function(out, rad) {
	    var s = Math.sin(rad), c = Math.cos(rad);

	    out[0] = c;
	    out[1] = s;
	    out[2] = 0;

	    out[3] = -s;
	    out[4] = c;
	    out[5] = 0;

	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat3.identity(dest);
	 *     mat3.scale(dest, dest, vec);
	 *
	 * @param {mat3} out mat3 receiving operation result
	 * @param {vec2} v Scaling vector
	 * @returns {mat3} out
	 */
	mat3.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;

	    out[3] = 0;
	    out[4] = v[1];
	    out[5] = 0;

	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 1;
	    return out;
	}

	/**
	 * Copies the values from a mat2d into a mat3
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat2d} a the matrix to copy
	 * @returns {mat3} out
	 **/
	mat3.fromMat2d = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = 0;

	    out[3] = a[2];
	    out[4] = a[3];
	    out[5] = 0;

	    out[6] = a[4];
	    out[7] = a[5];
	    out[8] = 1;
	    return out;
	};

	/**
	* Calculates a 3x3 matrix from the given quaternion
	*
	* @param {mat3} out mat3 receiving operation result
	* @param {quat} q Quaternion to create matrix from
	*
	* @returns {mat3} out
	*/
	mat3.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,

	        xx = x * x2,
	        yx = y * x2,
	        yy = y * y2,
	        zx = z * x2,
	        zy = z * y2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;

	    out[0] = 1 - yy - zz;
	    out[3] = yx - wz;
	    out[6] = zx + wy;

	    out[1] = yx + wz;
	    out[4] = 1 - xx - zz;
	    out[7] = zy - wx;

	    out[2] = zx - wy;
	    out[5] = zy + wx;
	    out[8] = 1 - xx - yy;

	    return out;
	};

	/**
	* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
	*
	* @param {mat3} out mat3 receiving operation result
	* @param {mat4} a Mat4 to derive the normal matrix from
	*
	* @returns {mat3} out
	*/
	mat3.normalFromMat4 = function (out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,

	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	    if (!det) { 
	        return null; 
	    }
	    det = 1.0 / det;

	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

	    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

	    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

	    return out;
	};

	/**
	 * Returns a string representation of a mat3
	 *
	 * @param {mat3} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat3.str = function (a) {
	    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
	                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' + 
	                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
	};

	/**
	 * Returns Frobenius norm of a mat3
	 *
	 * @param {mat3} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat3.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
	};

	/**
	 * Adds two mat3's
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the first operand
	 * @param {mat3} b the second operand
	 * @returns {mat3} out
	 */
	mat3.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    out[4] = a[4] + b[4];
	    out[5] = a[5] + b[5];
	    out[6] = a[6] + b[6];
	    out[7] = a[7] + b[7];
	    out[8] = a[8] + b[8];
	    return out;
	};

	/**
	 * Subtracts matrix b from matrix a
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the first operand
	 * @param {mat3} b the second operand
	 * @returns {mat3} out
	 */
	mat3.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    out[4] = a[4] - b[4];
	    out[5] = a[5] - b[5];
	    out[6] = a[6] - b[6];
	    out[7] = a[7] - b[7];
	    out[8] = a[8] - b[8];
	    return out;
	};

	/**
	 * Alias for {@link mat3.subtract}
	 * @function
	 */
	mat3.sub = mat3.subtract;

	/**
	 * Multiply each element of the matrix by a scalar.
	 *
	 * @param {mat3} out the receiving matrix
	 * @param {mat3} a the matrix to scale
	 * @param {Number} b amount to scale the matrix's elements by
	 * @returns {mat3} out
	 */
	mat3.multiplyScalar = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    out[4] = a[4] * b;
	    out[5] = a[5] * b;
	    out[6] = a[6] * b;
	    out[7] = a[7] * b;
	    out[8] = a[8] * b;
	    return out;
	};

	/**
	 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
	 *
	 * @param {mat3} out the receiving vector
	 * @param {mat3} a the first operand
	 * @param {mat3} b the second operand
	 * @param {Number} scale the amount to scale b's elements by before adding
	 * @returns {mat3} out
	 */
	mat3.multiplyScalarAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    out[4] = a[4] + (b[4] * scale);
	    out[5] = a[5] + (b[5] * scale);
	    out[6] = a[6] + (b[6] * scale);
	    out[7] = a[7] + (b[7] * scale);
	    out[8] = a[8] + (b[8] * scale);
	    return out;
	};

	/*
	 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param {mat3} a The first matrix.
	 * @param {mat3} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat3.exactEquals = function (a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && 
	           a[3] === b[3] && a[4] === b[4] && a[5] === b[5] &&
	           a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
	};

	/**
	 * Returns whether or not the matrices have approximately the same elements in the same position.
	 *
	 * @param {mat3} a The first matrix.
	 * @param {mat3} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat3.equals = function (a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = a[6], b7 = b[7], b8 = b[8];
	    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
	            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
	            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
	            Math.abs(a6 - b6) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
	            Math.abs(a7 - b7) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
	            Math.abs(a8 - b8) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a8), Math.abs(b8)));
	};


	module.exports = mat3;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);

	/**
	 * @class 4x4 Matrix
	 * @name mat4
	 */
	var mat4 = {
	  scalar: {},
	  SIMD: {},
	};

	/**
	 * Creates a new identity mat4
	 *
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(16);
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};

	/**
	 * Creates a new mat4 initialized with values from an existing matrix
	 *
	 * @param {mat4} a matrix to clone
	 * @returns {mat4} a new 4x4 matrix
	 */
	mat4.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(16);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};

	/**
	 * Copy the values from one mat4 to another
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[4] = a[4];
	    out[5] = a[5];
	    out[6] = a[6];
	    out[7] = a[7];
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};

	/**
	 * Create a new mat4 with the given values
	 *
	 * @param {Number} m00 Component in column 0, row 0 position (index 0)
	 * @param {Number} m01 Component in column 0, row 1 position (index 1)
	 * @param {Number} m02 Component in column 0, row 2 position (index 2)
	 * @param {Number} m03 Component in column 0, row 3 position (index 3)
	 * @param {Number} m10 Component in column 1, row 0 position (index 4)
	 * @param {Number} m11 Component in column 1, row 1 position (index 5)
	 * @param {Number} m12 Component in column 1, row 2 position (index 6)
	 * @param {Number} m13 Component in column 1, row 3 position (index 7)
	 * @param {Number} m20 Component in column 2, row 0 position (index 8)
	 * @param {Number} m21 Component in column 2, row 1 position (index 9)
	 * @param {Number} m22 Component in column 2, row 2 position (index 10)
	 * @param {Number} m23 Component in column 2, row 3 position (index 11)
	 * @param {Number} m30 Component in column 3, row 0 position (index 12)
	 * @param {Number} m31 Component in column 3, row 1 position (index 13)
	 * @param {Number} m32 Component in column 3, row 2 position (index 14)
	 * @param {Number} m33 Component in column 3, row 3 position (index 15)
	 * @returns {mat4} A new mat4
	 */
	mat4.fromValues = function(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
	    var out = new glMatrix.ARRAY_TYPE(16);
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m03;
	    out[4] = m10;
	    out[5] = m11;
	    out[6] = m12;
	    out[7] = m13;
	    out[8] = m20;
	    out[9] = m21;
	    out[10] = m22;
	    out[11] = m23;
	    out[12] = m30;
	    out[13] = m31;
	    out[14] = m32;
	    out[15] = m33;
	    return out;
	};

	/**
	 * Set the components of a mat4 to the given values
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {Number} m00 Component in column 0, row 0 position (index 0)
	 * @param {Number} m01 Component in column 0, row 1 position (index 1)
	 * @param {Number} m02 Component in column 0, row 2 position (index 2)
	 * @param {Number} m03 Component in column 0, row 3 position (index 3)
	 * @param {Number} m10 Component in column 1, row 0 position (index 4)
	 * @param {Number} m11 Component in column 1, row 1 position (index 5)
	 * @param {Number} m12 Component in column 1, row 2 position (index 6)
	 * @param {Number} m13 Component in column 1, row 3 position (index 7)
	 * @param {Number} m20 Component in column 2, row 0 position (index 8)
	 * @param {Number} m21 Component in column 2, row 1 position (index 9)
	 * @param {Number} m22 Component in column 2, row 2 position (index 10)
	 * @param {Number} m23 Component in column 2, row 3 position (index 11)
	 * @param {Number} m30 Component in column 3, row 0 position (index 12)
	 * @param {Number} m31 Component in column 3, row 1 position (index 13)
	 * @param {Number} m32 Component in column 3, row 2 position (index 14)
	 * @param {Number} m33 Component in column 3, row 3 position (index 15)
	 * @returns {mat4} out
	 */
	mat4.set = function(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
	    out[0] = m00;
	    out[1] = m01;
	    out[2] = m02;
	    out[3] = m03;
	    out[4] = m10;
	    out[5] = m11;
	    out[6] = m12;
	    out[7] = m13;
	    out[8] = m20;
	    out[9] = m21;
	    out[10] = m22;
	    out[11] = m23;
	    out[12] = m30;
	    out[13] = m31;
	    out[14] = m32;
	    out[15] = m33;
	    return out;
	};


	/**
	 * Set a mat4 to the identity matrix
	 *
	 * @param {mat4} out the receiving matrix
	 * @returns {mat4} out
	 */
	mat4.identity = function(out) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	};

	/**
	 * Transpose the values of a mat4 not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.scalar.transpose = function(out, a) {
	    // If we are transposing ourselves we can skip a few steps but have to cache some values
	    if (out === a) {
	        var a01 = a[1], a02 = a[2], a03 = a[3],
	            a12 = a[6], a13 = a[7],
	            a23 = a[11];

	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a01;
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a02;
	        out[9] = a12;
	        out[11] = a[14];
	        out[12] = a03;
	        out[13] = a13;
	        out[14] = a23;
	    } else {
	        out[0] = a[0];
	        out[1] = a[4];
	        out[2] = a[8];
	        out[3] = a[12];
	        out[4] = a[1];
	        out[5] = a[5];
	        out[6] = a[9];
	        out[7] = a[13];
	        out[8] = a[2];
	        out[9] = a[6];
	        out[10] = a[10];
	        out[11] = a[14];
	        out[12] = a[3];
	        out[13] = a[7];
	        out[14] = a[11];
	        out[15] = a[15];
	    }

	    return out;
	};

	/**
	 * Transpose the values of a mat4 using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.SIMD.transpose = function(out, a) {
	    var a0, a1, a2, a3,
	        tmp01, tmp23,
	        out0, out1, out2, out3;

	    a0 = SIMD.Float32x4.load(a, 0);
	    a1 = SIMD.Float32x4.load(a, 4);
	    a2 = SIMD.Float32x4.load(a, 8);
	    a3 = SIMD.Float32x4.load(a, 12);

	    tmp01 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
	    tmp23 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
	    out0  = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
	    out1  = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
	    SIMD.Float32x4.store(out, 0,  out0);
	    SIMD.Float32x4.store(out, 4,  out1);

	    tmp01 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
	    tmp23 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
	    out2  = SIMD.Float32x4.shuffle(tmp01, tmp23, 0, 2, 4, 6);
	    out3  = SIMD.Float32x4.shuffle(tmp01, tmp23, 1, 3, 5, 7);
	    SIMD.Float32x4.store(out, 8,  out2);
	    SIMD.Float32x4.store(out, 12, out3);

	    return out;
	};

	/**
	 * Transpse a mat4 using SIMD if available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.transpose = glMatrix.USE_SIMD ? mat4.SIMD.transpose : mat4.scalar.transpose;

	/**
	 * Inverts a mat4 not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.scalar.invert = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32,

	        // Calculate the determinant
	        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	    if (!det) {
	        return null;
	    }
	    det = 1.0 / det;

	    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

	    return out;
	};

	/**
	 * Inverts a mat4 using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.SIMD.invert = function(out, a) {
	  var row0, row1, row2, row3,
	      tmp1,
	      minor0, minor1, minor2, minor3,
	      det,
	      a0 = SIMD.Float32x4.load(a, 0),
	      a1 = SIMD.Float32x4.load(a, 4),
	      a2 = SIMD.Float32x4.load(a, 8),
	      a3 = SIMD.Float32x4.load(a, 12);

	  // Compute matrix adjugate
	  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
	  row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
	  row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
	  row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);
	  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
	  row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
	  row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
	  row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

	  tmp1   = SIMD.Float32x4.mul(row2, row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor0 = SIMD.Float32x4.mul(row1, tmp1);
	  minor1 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
	  minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
	  minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(row1, row2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
	  minor3 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
	  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
	  minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  row2   = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
	  minor2 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
	  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
	  minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(row0, row1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
	  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
	  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

	  tmp1   = SIMD.Float32x4.mul(row0, row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
	  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
	  minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

	  tmp1   = SIMD.Float32x4.mul(row0, row2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
	  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
	  minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

	  // Compute matrix determinant
	  det   = SIMD.Float32x4.mul(row0, minor0);
	  det   = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 2, 3, 0, 1), det);
	  det   = SIMD.Float32x4.add(SIMD.Float32x4.swizzle(det, 1, 0, 3, 2), det);
	  tmp1  = SIMD.Float32x4.reciprocalApproximation(det);
	  det   = SIMD.Float32x4.sub(
	               SIMD.Float32x4.add(tmp1, tmp1),
	               SIMD.Float32x4.mul(det, SIMD.Float32x4.mul(tmp1, tmp1)));
	  det   = SIMD.Float32x4.swizzle(det, 0, 0, 0, 0);
	  if (!det) {
	      return null;
	  }

	  // Compute matrix inverse
	  SIMD.Float32x4.store(out, 0,  SIMD.Float32x4.mul(det, minor0));
	  SIMD.Float32x4.store(out, 4,  SIMD.Float32x4.mul(det, minor1));
	  SIMD.Float32x4.store(out, 8,  SIMD.Float32x4.mul(det, minor2));
	  SIMD.Float32x4.store(out, 12, SIMD.Float32x4.mul(det, minor3));
	  return out;
	}

	/**
	 * Inverts a mat4 using SIMD if available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.invert = glMatrix.USE_SIMD ? mat4.SIMD.invert : mat4.scalar.invert;

	/**
	 * Calculates the adjugate of a mat4 not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.scalar.adjoint = function(out, a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	    out[0]  =  (a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22));
	    out[1]  = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
	    out[2]  =  (a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12));
	    out[3]  = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
	    out[4]  = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
	    out[5]  =  (a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22));
	    out[6]  = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
	    out[7]  =  (a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12));
	    out[8]  =  (a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21));
	    out[9]  = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
	    out[10] =  (a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11));
	    out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
	    out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
	    out[13] =  (a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21));
	    out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
	    out[15] =  (a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11));
	    return out;
	};

	/**
	 * Calculates the adjugate of a mat4 using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	mat4.SIMD.adjoint = function(out, a) {
	  var a0, a1, a2, a3;
	  var row0, row1, row2, row3;
	  var tmp1;
	  var minor0, minor1, minor2, minor3;

	  var a0 = SIMD.Float32x4.load(a, 0);
	  var a1 = SIMD.Float32x4.load(a, 4);
	  var a2 = SIMD.Float32x4.load(a, 8);
	  var a3 = SIMD.Float32x4.load(a, 12);

	  // Transpose the source matrix.  Sort of.  Not a true transpose operation
	  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 0, 1, 4, 5);
	  row1 = SIMD.Float32x4.shuffle(a2, a3, 0, 1, 4, 5);
	  row0 = SIMD.Float32x4.shuffle(tmp1, row1, 0, 2, 4, 6);
	  row1 = SIMD.Float32x4.shuffle(row1, tmp1, 1, 3, 5, 7);

	  tmp1 = SIMD.Float32x4.shuffle(a0, a1, 2, 3, 6, 7);
	  row3 = SIMD.Float32x4.shuffle(a2, a3, 2, 3, 6, 7);
	  row2 = SIMD.Float32x4.shuffle(tmp1, row3, 0, 2, 4, 6);
	  row3 = SIMD.Float32x4.shuffle(row3, tmp1, 1, 3, 5, 7);

	  tmp1   = SIMD.Float32x4.mul(row2, row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor0 = SIMD.Float32x4.mul(row1, tmp1);
	  minor1 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row1, tmp1), minor0);
	  minor1 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor1);
	  minor1 = SIMD.Float32x4.swizzle(minor1, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(row1, row2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor0);
	  minor3 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row3, tmp1));
	  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor3);
	  minor3 = SIMD.Float32x4.swizzle(minor3, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(row1, 2, 3, 0, 1), row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  row2   = SIMD.Float32x4.swizzle(row2, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor0);
	  minor2 = SIMD.Float32x4.mul(row0, tmp1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor0 = SIMD.Float32x4.sub(minor0, SIMD.Float32x4.mul(row2, tmp1));
	  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row0, tmp1), minor2);
	  minor2 = SIMD.Float32x4.swizzle(minor2, 2, 3, 0, 1);

	  tmp1   = SIMD.Float32x4.mul(row0, row1);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor2);
	  minor3 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row2, tmp1), minor3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor2 = SIMD.Float32x4.sub(SIMD.Float32x4.mul(row3, tmp1), minor2);
	  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row2, tmp1));

	  tmp1   = SIMD.Float32x4.mul(row0, row3);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row2, tmp1));
	  minor2 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row2, tmp1), minor1);
	  minor2 = SIMD.Float32x4.sub(minor2, SIMD.Float32x4.mul(row1, tmp1));

	  tmp1   = SIMD.Float32x4.mul(row0, row2);
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 1, 0, 3, 2);
	  minor1 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row3, tmp1), minor1);
	  minor3 = SIMD.Float32x4.sub(minor3, SIMD.Float32x4.mul(row1, tmp1));
	  tmp1   = SIMD.Float32x4.swizzle(tmp1, 2, 3, 0, 1);
	  minor1 = SIMD.Float32x4.sub(minor1, SIMD.Float32x4.mul(row3, tmp1));
	  minor3 = SIMD.Float32x4.add(SIMD.Float32x4.mul(row1, tmp1), minor3);

	  SIMD.Float32x4.store(out, 0,  minor0);
	  SIMD.Float32x4.store(out, 4,  minor1);
	  SIMD.Float32x4.store(out, 8,  minor2);
	  SIMD.Float32x4.store(out, 12, minor3);
	  return out;
	};

	/**
	 * Calculates the adjugate of a mat4 using SIMD if available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the source matrix
	 * @returns {mat4} out
	 */
	 mat4.adjoint = glMatrix.USE_SIMD ? mat4.SIMD.adjoint : mat4.scalar.adjoint;

	/**
	 * Calculates the determinant of a mat4
	 *
	 * @param {mat4} a the source matrix
	 * @returns {Number} determinant of a
	 */
	mat4.determinant = function (a) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

	        b00 = a00 * a11 - a01 * a10,
	        b01 = a00 * a12 - a02 * a10,
	        b02 = a00 * a13 - a03 * a10,
	        b03 = a01 * a12 - a02 * a11,
	        b04 = a01 * a13 - a03 * a11,
	        b05 = a02 * a13 - a03 * a12,
	        b06 = a20 * a31 - a21 * a30,
	        b07 = a20 * a32 - a22 * a30,
	        b08 = a20 * a33 - a23 * a30,
	        b09 = a21 * a32 - a22 * a31,
	        b10 = a21 * a33 - a23 * a31,
	        b11 = a22 * a33 - a23 * a32;

	    // Calculate the determinant
	    return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
	};

	/**
	 * Multiplies two mat4's explicitly using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand, must be a Float32Array
	 * @param {mat4} b the second operand, must be a Float32Array
	 * @returns {mat4} out
	 */
	mat4.SIMD.multiply = function (out, a, b) {
	    var a0 = SIMD.Float32x4.load(a, 0);
	    var a1 = SIMD.Float32x4.load(a, 4);
	    var a2 = SIMD.Float32x4.load(a, 8);
	    var a3 = SIMD.Float32x4.load(a, 12);

	    var b0 = SIMD.Float32x4.load(b, 0);
	    var out0 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 1, 1, 1, 1), a1),
	                       SIMD.Float32x4.add(
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 2, 2, 2, 2), a2),
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b0, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 0, out0);

	    var b1 = SIMD.Float32x4.load(b, 4);
	    var out1 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 1, 1, 1, 1), a1),
	                       SIMD.Float32x4.add(
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 2, 2, 2, 2), a2),
	                           SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b1, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 4, out1);

	    var b2 = SIMD.Float32x4.load(b, 8);
	    var out2 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                       SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 1, 1, 1, 1), a1),
	                       SIMD.Float32x4.add(
	                               SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 2, 2, 2, 2), a2),
	                               SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b2, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 8, out2);

	    var b3 = SIMD.Float32x4.load(b, 12);
	    var out3 = SIMD.Float32x4.add(
	                   SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 0, 0, 0, 0), a0),
	                   SIMD.Float32x4.add(
	                        SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 1, 1, 1, 1), a1),
	                        SIMD.Float32x4.add(
	                            SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 2, 2, 2, 2), a2),
	                            SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(b3, 3, 3, 3, 3), a3))));
	    SIMD.Float32x4.store(out, 12, out3);

	    return out;
	};

	/**
	 * Multiplies two mat4's explicitly not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	mat4.scalar.multiply = function (out, a, b) {
	    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
	        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
	        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
	        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

	    // Cache only the current line of the second matrix
	    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

	    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
	    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
	    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
	    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
	    return out;
	};

	/**
	 * Multiplies two mat4's using SIMD if available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	mat4.multiply = glMatrix.USE_SIMD ? mat4.SIMD.multiply : mat4.scalar.multiply;

	/**
	 * Alias for {@link mat4.multiply}
	 * @function
	 */
	mat4.mul = mat4.multiply;

	/**
	 * Translate a mat4 by the given vector not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	mat4.scalar.translate = function (out, a, v) {
	    var x = v[0], y = v[1], z = v[2],
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23;

	    if (a === out) {
	        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	    } else {
	        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

	        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
	        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
	        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;

	        out[12] = a00 * x + a10 * y + a20 * z + a[12];
	        out[13] = a01 * x + a11 * y + a21 * z + a[13];
	        out[14] = a02 * x + a12 * y + a22 * z + a[14];
	        out[15] = a03 * x + a13 * y + a23 * z + a[15];
	    }

	    return out;
	};

	/**
	 * Translates a mat4 by the given vector using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	mat4.SIMD.translate = function (out, a, v) {
	    var a0 = SIMD.Float32x4.load(a, 0),
	        a1 = SIMD.Float32x4.load(a, 4),
	        a2 = SIMD.Float32x4.load(a, 8),
	        a3 = SIMD.Float32x4.load(a, 12),
	        vec = SIMD.Float32x4(v[0], v[1], v[2] , 0);

	    if (a !== out) {
	        out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
	        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
	        out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
	    }

	    a0 = SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0));
	    a1 = SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1));
	    a2 = SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2));

	    var t0 = SIMD.Float32x4.add(a0, SIMD.Float32x4.add(a1, SIMD.Float32x4.add(a2, a3)));
	    SIMD.Float32x4.store(out, 12, t0);

	    return out;
	};

	/**
	 * Translates a mat4 by the given vector using SIMD if available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to translate
	 * @param {vec3} v vector to translate by
	 * @returns {mat4} out
	 */
	mat4.translate = glMatrix.USE_SIMD ? mat4.SIMD.translate : mat4.scalar.translate;

	/**
	 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to scale
	 * @param {vec3} v the vec3 to scale the matrix by
	 * @returns {mat4} out
	 **/
	mat4.scalar.scale = function(out, a, v) {
	    var x = v[0], y = v[1], z = v[2];

	    out[0] = a[0] * x;
	    out[1] = a[1] * x;
	    out[2] = a[2] * x;
	    out[3] = a[3] * x;
	    out[4] = a[4] * y;
	    out[5] = a[5] * y;
	    out[6] = a[6] * y;
	    out[7] = a[7] * y;
	    out[8] = a[8] * z;
	    out[9] = a[9] * z;
	    out[10] = a[10] * z;
	    out[11] = a[11] * z;
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};

	/**
	 * Scales the mat4 by the dimensions in the given vec3 using vectorization
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to scale
	 * @param {vec3} v the vec3 to scale the matrix by
	 * @returns {mat4} out
	 **/
	mat4.SIMD.scale = function(out, a, v) {
	    var a0, a1, a2;
	    var vec = SIMD.Float32x4(v[0], v[1], v[2], 0);

	    a0 = SIMD.Float32x4.load(a, 0);
	    SIMD.Float32x4.store(
	        out, 0, SIMD.Float32x4.mul(a0, SIMD.Float32x4.swizzle(vec, 0, 0, 0, 0)));

	    a1 = SIMD.Float32x4.load(a, 4);
	    SIMD.Float32x4.store(
	        out, 4, SIMD.Float32x4.mul(a1, SIMD.Float32x4.swizzle(vec, 1, 1, 1, 1)));

	    a2 = SIMD.Float32x4.load(a, 8);
	    SIMD.Float32x4.store(
	        out, 8, SIMD.Float32x4.mul(a2, SIMD.Float32x4.swizzle(vec, 2, 2, 2, 2)));

	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	    return out;
	};

	/**
	 * Scales the mat4 by the dimensions in the given vec3 using SIMD if available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to scale
	 * @param {vec3} v the vec3 to scale the matrix by
	 * @returns {mat4} out
	 */
	mat4.scale = glMatrix.USE_SIMD ? mat4.SIMD.scale : mat4.scalar.scale;

	/**
	 * Rotates a mat4 by the given angle around the given axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @param {vec3} axis the axis to rotate around
	 * @returns {mat4} out
	 */
	mat4.rotate = function (out, a, rad, axis) {
	    var x = axis[0], y = axis[1], z = axis[2],
	        len = Math.sqrt(x * x + y * y + z * z),
	        s, c, t,
	        a00, a01, a02, a03,
	        a10, a11, a12, a13,
	        a20, a21, a22, a23,
	        b00, b01, b02,
	        b10, b11, b12,
	        b20, b21, b22;

	    if (Math.abs(len) < glMatrix.EPSILON) { return null; }

	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;

	    s = Math.sin(rad);
	    c = Math.cos(rad);
	    t = 1 - c;

	    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
	    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
	    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

	    // Construct the elements of the rotation matrix
	    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
	    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
	    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

	    // Perform rotation-specific matrix multiplication
	    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
	    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
	    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
	    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
	    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
	    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
	    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
	    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
	    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
	    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
	    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
	    out[11] = a03 * b20 + a13 * b21 + a23 * b22;

	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the X axis not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.scalar.rotateX = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[0]  = a[0];
	        out[1]  = a[1];
	        out[2]  = a[2];
	        out[3]  = a[3];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    out[4] = a10 * c + a20 * s;
	    out[5] = a11 * c + a21 * s;
	    out[6] = a12 * c + a22 * s;
	    out[7] = a13 * c + a23 * s;
	    out[8] = a20 * c - a10 * s;
	    out[9] = a21 * c - a11 * s;
	    out[10] = a22 * c - a12 * s;
	    out[11] = a23 * c - a13 * s;
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the X axis using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.SIMD.rotateX = function (out, a, rad) {
	    var s = SIMD.Float32x4.splat(Math.sin(rad)),
	        c = SIMD.Float32x4.splat(Math.cos(rad));

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	      out[0]  = a[0];
	      out[1]  = a[1];
	      out[2]  = a[2];
	      out[3]  = a[3];
	      out[12] = a[12];
	      out[13] = a[13];
	      out[14] = a[14];
	      out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    var a_1 = SIMD.Float32x4.load(a, 4);
	    var a_2 = SIMD.Float32x4.load(a, 8);
	    SIMD.Float32x4.store(out, 4,
	                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_2, s)));
	    SIMD.Float32x4.store(out, 8,
	                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_2, c), SIMD.Float32x4.mul(a_1, s)));
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the X axis using SIMD if availabe and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.rotateX = glMatrix.USE_SIMD ? mat4.SIMD.rotateX : mat4.scalar.rotateX;

	/**
	 * Rotates a matrix by the given angle around the Y axis not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.scalar.rotateY = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a20 = a[8],
	        a21 = a[9],
	        a22 = a[10],
	        a23 = a[11];

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4]  = a[4];
	        out[5]  = a[5];
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c - a20 * s;
	    out[1] = a01 * c - a21 * s;
	    out[2] = a02 * c - a22 * s;
	    out[3] = a03 * c - a23 * s;
	    out[8] = a00 * s + a20 * c;
	    out[9] = a01 * s + a21 * c;
	    out[10] = a02 * s + a22 * c;
	    out[11] = a03 * s + a23 * c;
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Y axis using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.SIMD.rotateY = function (out, a, rad) {
	    var s = SIMD.Float32x4.splat(Math.sin(rad)),
	        c = SIMD.Float32x4.splat(Math.cos(rad));

	    if (a !== out) { // If the source and destination differ, copy the unchanged rows
	        out[4]  = a[4];
	        out[5]  = a[5];
	        out[6]  = a[6];
	        out[7]  = a[7];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    var a_0 = SIMD.Float32x4.load(a, 0);
	    var a_2 = SIMD.Float32x4.load(a, 8);
	    SIMD.Float32x4.store(out, 0,
	                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_2, s)));
	    SIMD.Float32x4.store(out, 8,
	                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, s), SIMD.Float32x4.mul(a_2, c)));
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Y axis if SIMD available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	 mat4.rotateY = glMatrix.USE_SIMD ? mat4.SIMD.rotateY : mat4.scalar.rotateY;

	/**
	 * Rotates a matrix by the given angle around the Z axis not using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.scalar.rotateZ = function (out, a, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad),
	        a00 = a[0],
	        a01 = a[1],
	        a02 = a[2],
	        a03 = a[3],
	        a10 = a[4],
	        a11 = a[5],
	        a12 = a[6],
	        a13 = a[7];

	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[8]  = a[8];
	        out[9]  = a[9];
	        out[10] = a[10];
	        out[11] = a[11];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    out[0] = a00 * c + a10 * s;
	    out[1] = a01 * c + a11 * s;
	    out[2] = a02 * c + a12 * s;
	    out[3] = a03 * c + a13 * s;
	    out[4] = a10 * c - a00 * s;
	    out[5] = a11 * c - a01 * s;
	    out[6] = a12 * c - a02 * s;
	    out[7] = a13 * c - a03 * s;
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Z axis using SIMD
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.SIMD.rotateZ = function (out, a, rad) {
	    var s = SIMD.Float32x4.splat(Math.sin(rad)),
	        c = SIMD.Float32x4.splat(Math.cos(rad));

	    if (a !== out) { // If the source and destination differ, copy the unchanged last row
	        out[8]  = a[8];
	        out[9]  = a[9];
	        out[10] = a[10];
	        out[11] = a[11];
	        out[12] = a[12];
	        out[13] = a[13];
	        out[14] = a[14];
	        out[15] = a[15];
	    }

	    // Perform axis-specific matrix multiplication
	    var a_0 = SIMD.Float32x4.load(a, 0);
	    var a_1 = SIMD.Float32x4.load(a, 4);
	    SIMD.Float32x4.store(out, 0,
	                         SIMD.Float32x4.add(SIMD.Float32x4.mul(a_0, c), SIMD.Float32x4.mul(a_1, s)));
	    SIMD.Float32x4.store(out, 4,
	                         SIMD.Float32x4.sub(SIMD.Float32x4.mul(a_1, c), SIMD.Float32x4.mul(a_0, s)));
	    return out;
	};

	/**
	 * Rotates a matrix by the given angle around the Z axis if SIMD available and enabled
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	 mat4.rotateZ = glMatrix.USE_SIMD ? mat4.SIMD.rotateZ : mat4.scalar.rotateZ;

	/**
	 * Creates a matrix from a vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, dest, vec);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {vec3} v Translation vector
	 * @returns {mat4} out
	 */
	mat4.fromTranslation = function(out, v) {
	    out[0] = 1;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from a vector scaling
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.scale(dest, dest, vec);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {vec3} v Scaling vector
	 * @returns {mat4} out
	 */
	mat4.fromScaling = function(out, v) {
	    out[0] = v[0];
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = v[1];
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = v[2];
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from a given angle around a given axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotate(dest, dest, rad, axis);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @param {vec3} axis the axis to rotate around
	 * @returns {mat4} out
	 */
	mat4.fromRotation = function(out, rad, axis) {
	    var x = axis[0], y = axis[1], z = axis[2],
	        len = Math.sqrt(x * x + y * y + z * z),
	        s, c, t;

	    if (Math.abs(len) < glMatrix.EPSILON) { return null; }

	    len = 1 / len;
	    x *= len;
	    y *= len;
	    z *= len;

	    s = Math.sin(rad);
	    c = Math.cos(rad);
	    t = 1 - c;

	    // Perform rotation-specific matrix multiplication
	    out[0] = x * x * t + c;
	    out[1] = y * x * t + z * s;
	    out[2] = z * x * t - y * s;
	    out[3] = 0;
	    out[4] = x * y * t - z * s;
	    out[5] = y * y * t + c;
	    out[6] = z * y * t + x * s;
	    out[7] = 0;
	    out[8] = x * z * t + y * s;
	    out[9] = y * z * t - x * s;
	    out[10] = z * z * t + c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from the given angle around the X axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateX(dest, dest, rad);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.fromXRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);

	    // Perform axis-specific matrix multiplication
	    out[0]  = 1;
	    out[1]  = 0;
	    out[2]  = 0;
	    out[3]  = 0;
	    out[4] = 0;
	    out[5] = c;
	    out[6] = s;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = -s;
	    out[10] = c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from the given angle around the Y axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateY(dest, dest, rad);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.fromYRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);

	    // Perform axis-specific matrix multiplication
	    out[0]  = c;
	    out[1]  = 0;
	    out[2]  = -s;
	    out[3]  = 0;
	    out[4] = 0;
	    out[5] = 1;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = s;
	    out[9] = 0;
	    out[10] = c;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from the given angle around the Z axis
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.rotateZ(dest, dest, rad);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */
	mat4.fromZRotation = function(out, rad) {
	    var s = Math.sin(rad),
	        c = Math.cos(rad);

	    // Perform axis-specific matrix multiplication
	    out[0]  = c;
	    out[1]  = s;
	    out[2]  = 0;
	    out[3]  = 0;
	    out[4] = -s;
	    out[5] = c;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 1;
	    out[11] = 0;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;
	    return out;
	}

	/**
	 * Creates a matrix from a quaternion rotation and vector translation
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslation = function (out, q, v) {
	    // Quaternion math
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,

	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;

	    out[0] = 1 - (yy + zz);
	    out[1] = xy + wz;
	    out[2] = xz - wy;
	    out[3] = 0;
	    out[4] = xy - wz;
	    out[5] = 1 - (xx + zz);
	    out[6] = yz + wx;
	    out[7] = 0;
	    out[8] = xz + wy;
	    out[9] = yz - wx;
	    out[10] = 1 - (xx + yy);
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;

	    return out;
	};

	/**
	 * Returns the translation vector component of a transformation
	 *  matrix. If a matrix is built with fromRotationTranslation,
	 *  the returned vector will be the same as the translation vector
	 *  originally supplied.
	 * @param  {vec3} out Vector to receive translation component
	 * @param  {mat4} mat Matrix to be decomposed (input)
	 * @return {vec3} out
	 */
	mat4.getTranslation = function (out, mat) {
	  out[0] = mat[12];
	  out[1] = mat[13];
	  out[2] = mat[14];

	  return out;
	};

	/**
	 * Returns a quaternion representing the rotational component
	 *  of a transformation matrix. If a matrix is built with
	 *  fromRotationTranslation, the returned quaternion will be the
	 *  same as the quaternion originally supplied.
	 * @param {quat} out Quaternion to receive the rotation component
	 * @param {mat4} mat Matrix to be decomposed (input)
	 * @return {quat} out
	 */
	mat4.getRotation = function (out, mat) {
	  // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
	  var trace = mat[0] + mat[5] + mat[10];
	  var S = 0;

	  if (trace > 0) { 
	    S = Math.sqrt(trace + 1.0) * 2;
	    out[3] = 0.25 * S;
	    out[0] = (mat[6] - mat[9]) / S;
	    out[1] = (mat[8] - mat[2]) / S; 
	    out[2] = (mat[1] - mat[4]) / S; 
	  } else if ((mat[0] > mat[5])&(mat[0] > mat[10])) { 
	    S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
	    out[3] = (mat[6] - mat[9]) / S;
	    out[0] = 0.25 * S;
	    out[1] = (mat[1] + mat[4]) / S; 
	    out[2] = (mat[8] + mat[2]) / S; 
	  } else if (mat[5] > mat[10]) { 
	    S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
	    out[3] = (mat[8] - mat[2]) / S;
	    out[0] = (mat[1] + mat[4]) / S; 
	    out[1] = 0.25 * S;
	    out[2] = (mat[6] + mat[9]) / S; 
	  } else { 
	    S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
	    out[3] = (mat[1] - mat[4]) / S;
	    out[0] = (mat[8] + mat[2]) / S;
	    out[1] = (mat[6] + mat[9]) / S;
	    out[2] = 0.25 * S;
	  }

	  return out;
	};

	/**
	 * Creates a matrix from a quaternion rotation, vector translation and vector scale
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *     mat4.scale(dest, scale)
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @param {vec3} s Scaling vector
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslationScale = function (out, q, v, s) {
	    // Quaternion math
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,

	        xx = x * x2,
	        xy = x * y2,
	        xz = x * z2,
	        yy = y * y2,
	        yz = y * z2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2,
	        sx = s[0],
	        sy = s[1],
	        sz = s[2];

	    out[0] = (1 - (yy + zz)) * sx;
	    out[1] = (xy + wz) * sx;
	    out[2] = (xz - wy) * sx;
	    out[3] = 0;
	    out[4] = (xy - wz) * sy;
	    out[5] = (1 - (xx + zz)) * sy;
	    out[6] = (yz + wx) * sy;
	    out[7] = 0;
	    out[8] = (xz + wy) * sz;
	    out[9] = (yz - wx) * sz;
	    out[10] = (1 - (xx + yy)) * sz;
	    out[11] = 0;
	    out[12] = v[0];
	    out[13] = v[1];
	    out[14] = v[2];
	    out[15] = 1;

	    return out;
	};

	/**
	 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
	 * This is equivalent to (but much faster than):
	 *
	 *     mat4.identity(dest);
	 *     mat4.translate(dest, vec);
	 *     mat4.translate(dest, origin);
	 *     var quatMat = mat4.create();
	 *     quat4.toMat4(quat, quatMat);
	 *     mat4.multiply(dest, quatMat);
	 *     mat4.scale(dest, scale)
	 *     mat4.translate(dest, negativeOrigin);
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat4} q Rotation quaternion
	 * @param {vec3} v Translation vector
	 * @param {vec3} s Scaling vector
	 * @param {vec3} o The origin vector around which to scale and rotate
	 * @returns {mat4} out
	 */
	mat4.fromRotationTranslationScaleOrigin = function (out, q, v, s, o) {
	  // Quaternion math
	  var x = q[0], y = q[1], z = q[2], w = q[3],
	      x2 = x + x,
	      y2 = y + y,
	      z2 = z + z,

	      xx = x * x2,
	      xy = x * y2,
	      xz = x * z2,
	      yy = y * y2,
	      yz = y * z2,
	      zz = z * z2,
	      wx = w * x2,
	      wy = w * y2,
	      wz = w * z2,

	      sx = s[0],
	      sy = s[1],
	      sz = s[2],

	      ox = o[0],
	      oy = o[1],
	      oz = o[2];

	  out[0] = (1 - (yy + zz)) * sx;
	  out[1] = (xy + wz) * sx;
	  out[2] = (xz - wy) * sx;
	  out[3] = 0;
	  out[4] = (xy - wz) * sy;
	  out[5] = (1 - (xx + zz)) * sy;
	  out[6] = (yz + wx) * sy;
	  out[7] = 0;
	  out[8] = (xz + wy) * sz;
	  out[9] = (yz - wx) * sz;
	  out[10] = (1 - (xx + yy)) * sz;
	  out[11] = 0;
	  out[12] = v[0] + ox - (out[0] * ox + out[4] * oy + out[8] * oz);
	  out[13] = v[1] + oy - (out[1] * ox + out[5] * oy + out[9] * oz);
	  out[14] = v[2] + oz - (out[2] * ox + out[6] * oy + out[10] * oz);
	  out[15] = 1;

	  return out;
	};

	/**
	 * Calculates a 4x4 matrix from the given quaternion
	 *
	 * @param {mat4} out mat4 receiving operation result
	 * @param {quat} q Quaternion to create matrix from
	 *
	 * @returns {mat4} out
	 */
	mat4.fromQuat = function (out, q) {
	    var x = q[0], y = q[1], z = q[2], w = q[3],
	        x2 = x + x,
	        y2 = y + y,
	        z2 = z + z,

	        xx = x * x2,
	        yx = y * x2,
	        yy = y * y2,
	        zx = z * x2,
	        zy = z * y2,
	        zz = z * z2,
	        wx = w * x2,
	        wy = w * y2,
	        wz = w * z2;

	    out[0] = 1 - yy - zz;
	    out[1] = yx + wz;
	    out[2] = zx - wy;
	    out[3] = 0;

	    out[4] = yx - wz;
	    out[5] = 1 - xx - zz;
	    out[6] = zy + wx;
	    out[7] = 0;

	    out[8] = zx + wy;
	    out[9] = zy - wx;
	    out[10] = 1 - xx - yy;
	    out[11] = 0;

	    out[12] = 0;
	    out[13] = 0;
	    out[14] = 0;
	    out[15] = 1;

	    return out;
	};

	/**
	 * Generates a frustum matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {Number} left Left bound of the frustum
	 * @param {Number} right Right bound of the frustum
	 * @param {Number} bottom Bottom bound of the frustum
	 * @param {Number} top Top bound of the frustum
	 * @param {Number} near Near bound of the frustum
	 * @param {Number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.frustum = function (out, left, right, bottom, top, near, far) {
	    var rl = 1 / (right - left),
	        tb = 1 / (top - bottom),
	        nf = 1 / (near - far);
	    out[0] = (near * 2) * rl;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = (near * 2) * tb;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = (right + left) * rl;
	    out[9] = (top + bottom) * tb;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (far * near * 2) * nf;
	    out[15] = 0;
	    return out;
	};

	/**
	 * Generates a perspective projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} fovy Vertical field of view in radians
	 * @param {number} aspect Aspect ratio. typically viewport width/height
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.perspective = function (out, fovy, aspect, near, far) {
	    var f = 1.0 / Math.tan(fovy / 2),
	        nf = 1 / (near - far);
	    out[0] = f / aspect;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = f;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = (far + near) * nf;
	    out[11] = -1;
	    out[12] = 0;
	    out[13] = 0;
	    out[14] = (2 * far * near) * nf;
	    out[15] = 0;
	    return out;
	};

	/**
	 * Generates a perspective projection matrix with the given field of view.
	 * This is primarily useful for generating projection matrices to be used
	 * with the still experiemental WebVR API.
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.perspectiveFromFieldOfView = function (out, fov, near, far) {
	    var upTan = Math.tan(fov.upDegrees * Math.PI/180.0),
	        downTan = Math.tan(fov.downDegrees * Math.PI/180.0),
	        leftTan = Math.tan(fov.leftDegrees * Math.PI/180.0),
	        rightTan = Math.tan(fov.rightDegrees * Math.PI/180.0),
	        xScale = 2.0 / (leftTan + rightTan),
	        yScale = 2.0 / (upTan + downTan);

	    out[0] = xScale;
	    out[1] = 0.0;
	    out[2] = 0.0;
	    out[3] = 0.0;
	    out[4] = 0.0;
	    out[5] = yScale;
	    out[6] = 0.0;
	    out[7] = 0.0;
	    out[8] = -((leftTan - rightTan) * xScale * 0.5);
	    out[9] = ((upTan - downTan) * yScale * 0.5);
	    out[10] = far / (near - far);
	    out[11] = -1.0;
	    out[12] = 0.0;
	    out[13] = 0.0;
	    out[14] = (far * near) / (near - far);
	    out[15] = 0.0;
	    return out;
	}

	/**
	 * Generates a orthogonal projection matrix with the given bounds
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} left Left bound of the frustum
	 * @param {number} right Right bound of the frustum
	 * @param {number} bottom Bottom bound of the frustum
	 * @param {number} top Top bound of the frustum
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum
	 * @returns {mat4} out
	 */
	mat4.ortho = function (out, left, right, bottom, top, near, far) {
	    var lr = 1 / (left - right),
	        bt = 1 / (bottom - top),
	        nf = 1 / (near - far);
	    out[0] = -2 * lr;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    out[4] = 0;
	    out[5] = -2 * bt;
	    out[6] = 0;
	    out[7] = 0;
	    out[8] = 0;
	    out[9] = 0;
	    out[10] = 2 * nf;
	    out[11] = 0;
	    out[12] = (left + right) * lr;
	    out[13] = (top + bottom) * bt;
	    out[14] = (far + near) * nf;
	    out[15] = 1;
	    return out;
	};

	/**
	 * Generates a look-at matrix with the given eye position, focal point, and up axis
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {vec3} eye Position of the viewer
	 * @param {vec3} center Point the viewer is looking at
	 * @param {vec3} up vec3 pointing up
	 * @returns {mat4} out
	 */
	mat4.lookAt = function (out, eye, center, up) {
	    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
	        eyex = eye[0],
	        eyey = eye[1],
	        eyez = eye[2],
	        upx = up[0],
	        upy = up[1],
	        upz = up[2],
	        centerx = center[0],
	        centery = center[1],
	        centerz = center[2];

	    if (Math.abs(eyex - centerx) < glMatrix.EPSILON &&
	        Math.abs(eyey - centery) < glMatrix.EPSILON &&
	        Math.abs(eyez - centerz) < glMatrix.EPSILON) {
	        return mat4.identity(out);
	    }

	    z0 = eyex - centerx;
	    z1 = eyey - centery;
	    z2 = eyez - centerz;

	    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
	    z0 *= len;
	    z1 *= len;
	    z2 *= len;

	    x0 = upy * z2 - upz * z1;
	    x1 = upz * z0 - upx * z2;
	    x2 = upx * z1 - upy * z0;
	    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
	    if (!len) {
	        x0 = 0;
	        x1 = 0;
	        x2 = 0;
	    } else {
	        len = 1 / len;
	        x0 *= len;
	        x1 *= len;
	        x2 *= len;
	    }

	    y0 = z1 * x2 - z2 * x1;
	    y1 = z2 * x0 - z0 * x2;
	    y2 = z0 * x1 - z1 * x0;

	    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
	    if (!len) {
	        y0 = 0;
	        y1 = 0;
	        y2 = 0;
	    } else {
	        len = 1 / len;
	        y0 *= len;
	        y1 *= len;
	        y2 *= len;
	    }

	    out[0] = x0;
	    out[1] = y0;
	    out[2] = z0;
	    out[3] = 0;
	    out[4] = x1;
	    out[5] = y1;
	    out[6] = z1;
	    out[7] = 0;
	    out[8] = x2;
	    out[9] = y2;
	    out[10] = z2;
	    out[11] = 0;
	    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
	    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
	    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
	    out[15] = 1;

	    return out;
	};

	/**
	 * Returns a string representation of a mat4
	 *
	 * @param {mat4} mat matrix to represent as a string
	 * @returns {String} string representation of the matrix
	 */
	mat4.str = function (a) {
	    return 'mat4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ', ' +
	                    a[4] + ', ' + a[5] + ', ' + a[6] + ', ' + a[7] + ', ' +
	                    a[8] + ', ' + a[9] + ', ' + a[10] + ', ' + a[11] + ', ' +
	                    a[12] + ', ' + a[13] + ', ' + a[14] + ', ' + a[15] + ')';
	};

	/**
	 * Returns Frobenius norm of a mat4
	 *
	 * @param {mat4} a the matrix to calculate Frobenius norm of
	 * @returns {Number} Frobenius norm
	 */
	mat4.frob = function (a) {
	    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2) + Math.pow(a[9], 2) + Math.pow(a[10], 2) + Math.pow(a[11], 2) + Math.pow(a[12], 2) + Math.pow(a[13], 2) + Math.pow(a[14], 2) + Math.pow(a[15], 2) ))
	};

	/**
	 * Adds two mat4's
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	mat4.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    out[4] = a[4] + b[4];
	    out[5] = a[5] + b[5];
	    out[6] = a[6] + b[6];
	    out[7] = a[7] + b[7];
	    out[8] = a[8] + b[8];
	    out[9] = a[9] + b[9];
	    out[10] = a[10] + b[10];
	    out[11] = a[11] + b[11];
	    out[12] = a[12] + b[12];
	    out[13] = a[13] + b[13];
	    out[14] = a[14] + b[14];
	    out[15] = a[15] + b[15];
	    return out;
	};

	/**
	 * Subtracts matrix b from matrix a
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @returns {mat4} out
	 */
	mat4.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    out[4] = a[4] - b[4];
	    out[5] = a[5] - b[5];
	    out[6] = a[6] - b[6];
	    out[7] = a[7] - b[7];
	    out[8] = a[8] - b[8];
	    out[9] = a[9] - b[9];
	    out[10] = a[10] - b[10];
	    out[11] = a[11] - b[11];
	    out[12] = a[12] - b[12];
	    out[13] = a[13] - b[13];
	    out[14] = a[14] - b[14];
	    out[15] = a[15] - b[15];
	    return out;
	};

	/**
	 * Alias for {@link mat4.subtract}
	 * @function
	 */
	mat4.sub = mat4.subtract;

	/**
	 * Multiply each element of the matrix by a scalar.
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {mat4} a the matrix to scale
	 * @param {Number} b amount to scale the matrix's elements by
	 * @returns {mat4} out
	 */
	mat4.multiplyScalar = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    out[4] = a[4] * b;
	    out[5] = a[5] * b;
	    out[6] = a[6] * b;
	    out[7] = a[7] * b;
	    out[8] = a[8] * b;
	    out[9] = a[9] * b;
	    out[10] = a[10] * b;
	    out[11] = a[11] * b;
	    out[12] = a[12] * b;
	    out[13] = a[13] * b;
	    out[14] = a[14] * b;
	    out[15] = a[15] * b;
	    return out;
	};

	/**
	 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
	 *
	 * @param {mat4} out the receiving vector
	 * @param {mat4} a the first operand
	 * @param {mat4} b the second operand
	 * @param {Number} scale the amount to scale b's elements by before adding
	 * @returns {mat4} out
	 */
	mat4.multiplyScalarAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    out[4] = a[4] + (b[4] * scale);
	    out[5] = a[5] + (b[5] * scale);
	    out[6] = a[6] + (b[6] * scale);
	    out[7] = a[7] + (b[7] * scale);
	    out[8] = a[8] + (b[8] * scale);
	    out[9] = a[9] + (b[9] * scale);
	    out[10] = a[10] + (b[10] * scale);
	    out[11] = a[11] + (b[11] * scale);
	    out[12] = a[12] + (b[12] * scale);
	    out[13] = a[13] + (b[13] * scale);
	    out[14] = a[14] + (b[14] * scale);
	    out[15] = a[15] + (b[15] * scale);
	    return out;
	};

	/**
	 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param {mat4} a The first matrix.
	 * @param {mat4} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat4.exactEquals = function (a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && 
	           a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && 
	           a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
	           a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
	};

	/**
	 * Returns whether or not the matrices have approximately the same elements in the same position.
	 *
	 * @param {mat4} a The first matrix.
	 * @param {mat4} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */
	mat4.equals = function (a, b) {
	    var a0  = a[0],  a1  = a[1],  a2  = a[2],  a3  = a[3],
	        a4  = a[4],  a5  = a[5],  a6  = a[6],  a7  = a[7], 
	        a8  = a[8],  a9  = a[9],  a10 = a[10], a11 = a[11], 
	        a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];

	    var b0  = b[0],  b1  = b[1],  b2  = b[2],  b3  = b[3],
	        b4  = b[4],  b5  = b[5],  b6  = b[6],  b7  = b[7], 
	        b8  = b[8],  b9  = b[9],  b10 = b[10], b11 = b[11], 
	        b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

	    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
	            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
	            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
	            Math.abs(a6 - b6) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
	            Math.abs(a7 - b7) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
	            Math.abs(a8 - b8) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
	            Math.abs(a9 - b9) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
	            Math.abs(a10 - b10) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
	            Math.abs(a11 - b11) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
	            Math.abs(a12 - b12) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
	            Math.abs(a13 - b13) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
	            Math.abs(a14 - b14) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
	            Math.abs(a15 - b15) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a15), Math.abs(b15)));
	};



	module.exports = mat4;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);
	var mat3 = __webpack_require__(26);
	var vec3 = __webpack_require__(29);
	var vec4 = __webpack_require__(30);

	/**
	 * @class Quaternion
	 * @name quat
	 */
	var quat = {};

	/**
	 * Creates a new identity quat
	 *
	 * @returns {quat} a new quaternion
	 */
	quat.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};

	/**
	 * Sets a quaternion to represent the shortest rotation from one
	 * vector to another.
	 *
	 * Both vectors are assumed to be unit length.
	 *
	 * @param {quat} out the receiving quaternion.
	 * @param {vec3} a the initial vector
	 * @param {vec3} b the destination vector
	 * @returns {quat} out
	 */
	quat.rotationTo = (function() {
	    var tmpvec3 = vec3.create();
	    var xUnitVec3 = vec3.fromValues(1,0,0);
	    var yUnitVec3 = vec3.fromValues(0,1,0);

	    return function(out, a, b) {
	        var dot = vec3.dot(a, b);
	        if (dot < -0.999999) {
	            vec3.cross(tmpvec3, xUnitVec3, a);
	            if (vec3.length(tmpvec3) < 0.000001)
	                vec3.cross(tmpvec3, yUnitVec3, a);
	            vec3.normalize(tmpvec3, tmpvec3);
	            quat.setAxisAngle(out, tmpvec3, Math.PI);
	            return out;
	        } else if (dot > 0.999999) {
	            out[0] = 0;
	            out[1] = 0;
	            out[2] = 0;
	            out[3] = 1;
	            return out;
	        } else {
	            vec3.cross(tmpvec3, a, b);
	            out[0] = tmpvec3[0];
	            out[1] = tmpvec3[1];
	            out[2] = tmpvec3[2];
	            out[3] = 1 + dot;
	            return quat.normalize(out, out);
	        }
	    };
	})();

	/**
	 * Sets the specified quaternion with values corresponding to the given
	 * axes. Each axis is a vec3 and is expected to be unit length and
	 * perpendicular to all other specified axes.
	 *
	 * @param {vec3} view  the vector representing the viewing direction
	 * @param {vec3} right the vector representing the local "right" direction
	 * @param {vec3} up    the vector representing the local "up" direction
	 * @returns {quat} out
	 */
	quat.setAxes = (function() {
	    var matr = mat3.create();

	    return function(out, view, right, up) {
	        matr[0] = right[0];
	        matr[3] = right[1];
	        matr[6] = right[2];

	        matr[1] = up[0];
	        matr[4] = up[1];
	        matr[7] = up[2];

	        matr[2] = -view[0];
	        matr[5] = -view[1];
	        matr[8] = -view[2];

	        return quat.normalize(out, quat.fromMat3(out, matr));
	    };
	})();

	/**
	 * Creates a new quat initialized with values from an existing quaternion
	 *
	 * @param {quat} a quaternion to clone
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.clone = vec4.clone;

	/**
	 * Creates a new quat initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} a new quaternion
	 * @function
	 */
	quat.fromValues = vec4.fromValues;

	/**
	 * Copy the values from one quat to another
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the source quaternion
	 * @returns {quat} out
	 * @function
	 */
	quat.copy = vec4.copy;

	/**
	 * Set the components of a quat to the given values
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {quat} out
	 * @function
	 */
	quat.set = vec4.set;

	/**
	 * Set a quat to the identity quaternion
	 *
	 * @param {quat} out the receiving quaternion
	 * @returns {quat} out
	 */
	quat.identity = function(out) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 1;
	    return out;
	};

	/**
	 * Sets a quat from the given angle and rotation axis,
	 * then returns it.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {vec3} axis the axis around which to rotate
	 * @param {Number} rad the angle in radians
	 * @returns {quat} out
	 **/
	quat.setAxisAngle = function(out, axis, rad) {
	    rad = rad * 0.5;
	    var s = Math.sin(rad);
	    out[0] = s * axis[0];
	    out[1] = s * axis[1];
	    out[2] = s * axis[2];
	    out[3] = Math.cos(rad);
	    return out;
	};

	/**
	 * Gets the rotation axis and angle for a given
	 *  quaternion. If a quaternion is created with
	 *  setAxisAngle, this method will return the same
	 *  values as providied in the original parameter list
	 *  OR functionally equivalent values.
	 * Example: The quaternion formed by axis [0, 0, 1] and
	 *  angle -90 is the same as the quaternion formed by
	 *  [0, 0, 1] and 270. This method favors the latter.
	 * @param  {vec3} out_axis  Vector receiving the axis of rotation
	 * @param  {quat} q     Quaternion to be decomposed
	 * @return {Number}     Angle, in radians, of the rotation
	 */
	quat.getAxisAngle = function(out_axis, q) {
	    var rad = Math.acos(q[3]) * 2.0;
	    var s = Math.sin(rad / 2.0);
	    if (s != 0.0) {
	        out_axis[0] = q[0] / s;
	        out_axis[1] = q[1] / s;
	        out_axis[2] = q[2] / s;
	    } else {
	        // If s is zero, return any axis (no rotation - axis does not matter)
	        out_axis[0] = 1;
	        out_axis[1] = 0;
	        out_axis[2] = 0;
	    }
	    return rad;
	};

	/**
	 * Adds two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 * @function
	 */
	quat.add = vec4.add;

	/**
	 * Multiplies two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {quat} out
	 */
	quat.multiply = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];

	    out[0] = ax * bw + aw * bx + ay * bz - az * by;
	    out[1] = ay * bw + aw * by + az * bx - ax * bz;
	    out[2] = az * bw + aw * bz + ax * by - ay * bx;
	    out[3] = aw * bw - ax * bx - ay * by - az * bz;
	    return out;
	};

	/**
	 * Alias for {@link quat.multiply}
	 * @function
	 */
	quat.mul = quat.multiply;

	/**
	 * Scales a quat by a scalar number
	 *
	 * @param {quat} out the receiving vector
	 * @param {quat} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {quat} out
	 * @function
	 */
	quat.scale = vec4.scale;

	/**
	 * Rotates a quaternion by the given angle about the X axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateX = function (out, a, rad) {
	    rad *= 0.5; 

	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = Math.sin(rad), bw = Math.cos(rad);

	    out[0] = ax * bw + aw * bx;
	    out[1] = ay * bw + az * bx;
	    out[2] = az * bw - ay * bx;
	    out[3] = aw * bw - ax * bx;
	    return out;
	};

	/**
	 * Rotates a quaternion by the given angle about the Y axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateY = function (out, a, rad) {
	    rad *= 0.5; 

	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        by = Math.sin(rad), bw = Math.cos(rad);

	    out[0] = ax * bw - az * by;
	    out[1] = ay * bw + aw * by;
	    out[2] = az * bw + ax * by;
	    out[3] = aw * bw - ay * by;
	    return out;
	};

	/**
	 * Rotates a quaternion by the given angle about the Z axis
	 *
	 * @param {quat} out quat receiving operation result
	 * @param {quat} a quat to rotate
	 * @param {number} rad angle (in radians) to rotate
	 * @returns {quat} out
	 */
	quat.rotateZ = function (out, a, rad) {
	    rad *= 0.5; 

	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bz = Math.sin(rad), bw = Math.cos(rad);

	    out[0] = ax * bw + ay * bz;
	    out[1] = ay * bw - ax * bz;
	    out[2] = az * bw + aw * bz;
	    out[3] = aw * bw - az * bz;
	    return out;
	};

	/**
	 * Calculates the W component of a quat from the X, Y, and Z components.
	 * Assumes that quaternion is 1 unit in length.
	 * Any existing W component will be ignored.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate W component of
	 * @returns {quat} out
	 */
	quat.calculateW = function (out, a) {
	    var x = a[0], y = a[1], z = a[2];

	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
	    return out;
	};

	/**
	 * Calculates the dot product of two quat's
	 *
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @returns {Number} dot product of a and b
	 * @function
	 */
	quat.dot = vec4.dot;

	/**
	 * Performs a linear interpolation between two quat's
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 * @function
	 */
	quat.lerp = vec4.lerp;

	/**
	 * Performs a spherical linear interpolation between two quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {quat} out
	 */
	quat.slerp = function (out, a, b, t) {
	    // benchmarks:
	    //    http://jsperf.com/quaternion-slerp-implementations

	    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
	        bx = b[0], by = b[1], bz = b[2], bw = b[3];

	    var        omega, cosom, sinom, scale0, scale1;

	    // calc cosine
	    cosom = ax * bx + ay * by + az * bz + aw * bw;
	    // adjust signs (if necessary)
	    if ( cosom < 0.0 ) {
	        cosom = -cosom;
	        bx = - bx;
	        by = - by;
	        bz = - bz;
	        bw = - bw;
	    }
	    // calculate coefficients
	    if ( (1.0 - cosom) > 0.000001 ) {
	        // standard case (slerp)
	        omega  = Math.acos(cosom);
	        sinom  = Math.sin(omega);
	        scale0 = Math.sin((1.0 - t) * omega) / sinom;
	        scale1 = Math.sin(t * omega) / sinom;
	    } else {        
	        // "from" and "to" quaternions are very close 
	        //  ... so we can do a linear interpolation
	        scale0 = 1.0 - t;
	        scale1 = t;
	    }
	    // calculate final values
	    out[0] = scale0 * ax + scale1 * bx;
	    out[1] = scale0 * ay + scale1 * by;
	    out[2] = scale0 * az + scale1 * bz;
	    out[3] = scale0 * aw + scale1 * bw;
	    
	    return out;
	};

	/**
	 * Performs a spherical linear interpolation with two control points
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a the first operand
	 * @param {quat} b the second operand
	 * @param {quat} c the third operand
	 * @param {quat} d the fourth operand
	 * @param {Number} t interpolation amount
	 * @returns {quat} out
	 */
	quat.sqlerp = (function () {
	  var temp1 = quat.create();
	  var temp2 = quat.create();
	  
	  return function (out, a, b, c, d, t) {
	    quat.slerp(temp1, a, d, t);
	    quat.slerp(temp2, b, c, t);
	    quat.slerp(out, temp1, temp2, 2 * t * (1 - t));
	    
	    return out;
	  };
	}());

	/**
	 * Calculates the inverse of a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate inverse of
	 * @returns {quat} out
	 */
	quat.invert = function(out, a) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
	        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
	        invDot = dot ? 1.0/dot : 0;
	    
	    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

	    out[0] = -a0*invDot;
	    out[1] = -a1*invDot;
	    out[2] = -a2*invDot;
	    out[3] = a3*invDot;
	    return out;
	};

	/**
	 * Calculates the conjugate of a quat
	 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quat to calculate conjugate of
	 * @returns {quat} out
	 */
	quat.conjugate = function (out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = a[3];
	    return out;
	};

	/**
	 * Calculates the length of a quat
	 *
	 * @param {quat} a vector to calculate length of
	 * @returns {Number} length of a
	 * @function
	 */
	quat.length = vec4.length;

	/**
	 * Alias for {@link quat.length}
	 * @function
	 */
	quat.len = quat.length;

	/**
	 * Calculates the squared length of a quat
	 *
	 * @param {quat} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 * @function
	 */
	quat.squaredLength = vec4.squaredLength;

	/**
	 * Alias for {@link quat.squaredLength}
	 * @function
	 */
	quat.sqrLen = quat.squaredLength;

	/**
	 * Normalize a quat
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {quat} a quaternion to normalize
	 * @returns {quat} out
	 * @function
	 */
	quat.normalize = vec4.normalize;

	/**
	 * Creates a quaternion from the given 3x3 rotation matrix.
	 *
	 * NOTE: The resultant quaternion is not normalized, so you should be sure
	 * to renormalize the quaternion yourself where necessary.
	 *
	 * @param {quat} out the receiving quaternion
	 * @param {mat3} m rotation matrix
	 * @returns {quat} out
	 * @function
	 */
	quat.fromMat3 = function(out, m) {
	    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
	    // article "Quaternion Calculus and Fast Animation".
	    var fTrace = m[0] + m[4] + m[8];
	    var fRoot;

	    if ( fTrace > 0.0 ) {
	        // |w| > 1/2, may as well choose w > 1/2
	        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
	        out[3] = 0.5 * fRoot;
	        fRoot = 0.5/fRoot;  // 1/(4w)
	        out[0] = (m[5]-m[7])*fRoot;
	        out[1] = (m[6]-m[2])*fRoot;
	        out[2] = (m[1]-m[3])*fRoot;
	    } else {
	        // |w| <= 1/2
	        var i = 0;
	        if ( m[4] > m[0] )
	          i = 1;
	        if ( m[8] > m[i*3+i] )
	          i = 2;
	        var j = (i+1)%3;
	        var k = (i+2)%3;
	        
	        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
	        out[i] = 0.5 * fRoot;
	        fRoot = 0.5 / fRoot;
	        out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
	        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
	        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
	    }
	    
	    return out;
	};

	/**
	 * Returns a string representation of a quatenion
	 *
	 * @param {quat} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	quat.str = function (a) {
	    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};

	/**
	 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param {quat} a The first quaternion.
	 * @param {quat} b The second quaternion.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	quat.exactEquals = vec4.exactEquals;

	/**
	 * Returns whether or not the quaternions have approximately the same elements in the same position.
	 *
	 * @param {quat} a The first vector.
	 * @param {quat} b The second vector.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	quat.equals = vec4.equals;

	module.exports = quat;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);

	/**
	 * @class 3 Dimensional Vector
	 * @name vec3
	 */
	var vec3 = {};

	/**
	 * Creates a new, empty vec3
	 *
	 * @returns {vec3} a new 3D vector
	 */
	vec3.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(3);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    return out;
	};

	/**
	 * Creates a new vec3 initialized with values from an existing vector
	 *
	 * @param {vec3} a vector to clone
	 * @returns {vec3} a new 3D vector
	 */
	vec3.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(3);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};

	/**
	 * Creates a new vec3 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} a new 3D vector
	 */
	vec3.fromValues = function(x, y, z) {
	    var out = new glMatrix.ARRAY_TYPE(3);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};

	/**
	 * Copy the values from one vec3 to another
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the source vector
	 * @returns {vec3} out
	 */
	vec3.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    return out;
	};

	/**
	 * Set the components of a vec3 to the given values
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @returns {vec3} out
	 */
	vec3.set = function(out, x, y, z) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    return out;
	};

	/**
	 * Adds two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    return out;
	};

	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    return out;
	};

	/**
	 * Alias for {@link vec3.subtract}
	 * @function
	 */
	vec3.sub = vec3.subtract;

	/**
	 * Multiplies two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    return out;
	};

	/**
	 * Alias for {@link vec3.multiply}
	 * @function
	 */
	vec3.mul = vec3.multiply;

	/**
	 * Divides two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    return out;
	};

	/**
	 * Alias for {@link vec3.divide}
	 * @function
	 */
	vec3.div = vec3.divide;

	/**
	 * Math.ceil the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to ceil
	 * @returns {vec3} out
	 */
	vec3.ceil = function (out, a) {
	    out[0] = Math.ceil(a[0]);
	    out[1] = Math.ceil(a[1]);
	    out[2] = Math.ceil(a[2]);
	    return out;
	};

	/**
	 * Math.floor the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to floor
	 * @returns {vec3} out
	 */
	vec3.floor = function (out, a) {
	    out[0] = Math.floor(a[0]);
	    out[1] = Math.floor(a[1]);
	    out[2] = Math.floor(a[2]);
	    return out;
	};

	/**
	 * Returns the minimum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    return out;
	};

	/**
	 * Returns the maximum of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    return out;
	};

	/**
	 * Math.round the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to round
	 * @returns {vec3} out
	 */
	vec3.round = function (out, a) {
	    out[0] = Math.round(a[0]);
	    out[1] = Math.round(a[1]);
	    out[2] = Math.round(a[2]);
	    return out;
	};

	/**
	 * Scales a vec3 by a scalar number
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec3} out
	 */
	vec3.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    return out;
	};

	/**
	 * Adds two vec3's after scaling the second operand by a scalar value
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec3} out
	 */
	vec3.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    return out;
	};

	/**
	 * Calculates the euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec3.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};

	/**
	 * Alias for {@link vec3.distance}
	 * @function
	 */
	vec3.dist = vec3.distance;

	/**
	 * Calculates the squared euclidian distance between two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec3.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2];
	    return x*x + y*y + z*z;
	};

	/**
	 * Alias for {@link vec3.squaredDistance}
	 * @function
	 */
	vec3.sqrDist = vec3.squaredDistance;

	/**
	 * Calculates the length of a vec3
	 *
	 * @param {vec3} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec3.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return Math.sqrt(x*x + y*y + z*z);
	};

	/**
	 * Alias for {@link vec3.length}
	 * @function
	 */
	vec3.len = vec3.length;

	/**
	 * Calculates the squared length of a vec3
	 *
	 * @param {vec3} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec3.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    return x*x + y*y + z*z;
	};

	/**
	 * Alias for {@link vec3.squaredLength}
	 * @function
	 */
	vec3.sqrLen = vec3.squaredLength;

	/**
	 * Negates the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to negate
	 * @returns {vec3} out
	 */
	vec3.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    return out;
	};

	/**
	 * Returns the inverse of the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to invert
	 * @returns {vec3} out
	 */
	vec3.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  out[2] = 1.0 / a[2];
	  return out;
	};

	/**
	 * Normalize a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a vector to normalize
	 * @returns {vec3} out
	 */
	vec3.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2];
	    var len = x*x + y*y + z*z;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	        out[2] = a[2] * len;
	    }
	    return out;
	};

	/**
	 * Calculates the dot product of two vec3's
	 *
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec3.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	};

	/**
	 * Computes the cross product of two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @returns {vec3} out
	 */
	vec3.cross = function(out, a, b) {
	    var ax = a[0], ay = a[1], az = a[2],
	        bx = b[0], by = b[1], bz = b[2];

	    out[0] = ay * bz - az * by;
	    out[1] = az * bx - ax * bz;
	    out[2] = ax * by - ay * bx;
	    return out;
	};

	/**
	 * Performs a linear interpolation between two vec3's
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    return out;
	};

	/**
	 * Performs a hermite interpolation with two control points
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {vec3} c the third operand
	 * @param {vec3} d the fourth operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.hermite = function (out, a, b, c, d, t) {
	  var factorTimes2 = t * t,
	      factor1 = factorTimes2 * (2 * t - 3) + 1,
	      factor2 = factorTimes2 * (t - 2) + t,
	      factor3 = factorTimes2 * (t - 1),
	      factor4 = factorTimes2 * (3 - 2 * t);
	  
	  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
	  
	  return out;
	};

	/**
	 * Performs a bezier interpolation with two control points
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the first operand
	 * @param {vec3} b the second operand
	 * @param {vec3} c the third operand
	 * @param {vec3} d the fourth operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec3} out
	 */
	vec3.bezier = function (out, a, b, c, d, t) {
	  var inverseFactor = 1 - t,
	      inverseFactorTimesTwo = inverseFactor * inverseFactor,
	      factorTimes2 = t * t,
	      factor1 = inverseFactorTimesTwo * inverseFactor,
	      factor2 = 3 * t * inverseFactorTimesTwo,
	      factor3 = 3 * factorTimes2 * inverseFactor,
	      factor4 = factorTimes2 * t;
	  
	  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
	  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
	  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
	  
	  return out;
	};

	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec3} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec3} out
	 */
	vec3.random = function (out, scale) {
	    scale = scale || 1.0;

	    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
	    var z = (glMatrix.RANDOM() * 2.0) - 1.0;
	    var zScale = Math.sqrt(1.0-z*z) * scale;

	    out[0] = Math.cos(r) * zScale;
	    out[1] = Math.sin(r) * zScale;
	    out[2] = z * scale;
	    return out;
	};

	/**
	 * Transforms the vec3 with a mat4.
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec3} out
	 */
	vec3.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2],
	        w = m[3] * x + m[7] * y + m[11] * z + m[15];
	    w = w || 1.0;
	    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
	    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
	    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
	    return out;
	};

	/**
	 * Transforms the vec3 with a mat3.
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {mat4} m the 3x3 matrix to transform with
	 * @returns {vec3} out
	 */
	vec3.transformMat3 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2];
	    out[0] = x * m[0] + y * m[3] + z * m[6];
	    out[1] = x * m[1] + y * m[4] + z * m[7];
	    out[2] = x * m[2] + y * m[5] + z * m[8];
	    return out;
	};

	/**
	 * Transforms the vec3 with a quat
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec3} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec3} out
	 */
	vec3.transformQuat = function(out, a, q) {
	    // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;

	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    return out;
	};

	/**
	 * Rotate a 3D vector around the x-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateX = function(out, a, b, c){
	   var p = [], r=[];
		  //Translate point to the origin
		  p[0] = a[0] - b[0];
		  p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];

		  //perform rotation
		  r[0] = p[0];
		  r[1] = p[1]*Math.cos(c) - p[2]*Math.sin(c);
		  r[2] = p[1]*Math.sin(c) + p[2]*Math.cos(c);

		  //translate to correct position
		  out[0] = r[0] + b[0];
		  out[1] = r[1] + b[1];
		  out[2] = r[2] + b[2];

	  	return out;
	};

	/**
	 * Rotate a 3D vector around the y-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateY = function(out, a, b, c){
	  	var p = [], r=[];
	  	//Translate point to the origin
	  	p[0] = a[0] - b[0];
	  	p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	  
	  	//perform rotation
	  	r[0] = p[2]*Math.sin(c) + p[0]*Math.cos(c);
	  	r[1] = p[1];
	  	r[2] = p[2]*Math.cos(c) - p[0]*Math.sin(c);
	  
	  	//translate to correct position
	  	out[0] = r[0] + b[0];
	  	out[1] = r[1] + b[1];
	  	out[2] = r[2] + b[2];
	  
	  	return out;
	};

	/**
	 * Rotate a 3D vector around the z-axis
	 * @param {vec3} out The receiving vec3
	 * @param {vec3} a The vec3 point to rotate
	 * @param {vec3} b The origin of the rotation
	 * @param {Number} c The angle of rotation
	 * @returns {vec3} out
	 */
	vec3.rotateZ = function(out, a, b, c){
	  	var p = [], r=[];
	  	//Translate point to the origin
	  	p[0] = a[0] - b[0];
	  	p[1] = a[1] - b[1];
	  	p[2] = a[2] - b[2];
	  
	  	//perform rotation
	  	r[0] = p[0]*Math.cos(c) - p[1]*Math.sin(c);
	  	r[1] = p[0]*Math.sin(c) + p[1]*Math.cos(c);
	  	r[2] = p[2];
	  
	  	//translate to correct position
	  	out[0] = r[0] + b[0];
	  	out[1] = r[1] + b[1];
	  	out[2] = r[2] + b[2];
	  
	  	return out;
	};

	/**
	 * Perform some operation over an array of vec3s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec3.forEach = (function() {
	    var vec = vec3.create();

	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 3;
	        }

	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }

	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2];
	        }
	        
	        return a;
	    };
	})();

	/**
	 * Get the angle between two 3D vectors
	 * @param {vec3} a The first operand
	 * @param {vec3} b The second operand
	 * @returns {Number} The angle in radians
	 */
	vec3.angle = function(a, b) {
	   
	    var tempA = vec3.fromValues(a[0], a[1], a[2]);
	    var tempB = vec3.fromValues(b[0], b[1], b[2]);
	 
	    vec3.normalize(tempA, tempA);
	    vec3.normalize(tempB, tempB);
	 
	    var cosine = vec3.dot(tempA, tempB);

	    if(cosine > 1.0){
	        return 0;
	    } else {
	        return Math.acos(cosine);
	    }     
	};

	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec3} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec3.str = function (a) {
	    return 'vec3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ')';
	};

	/**
	 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param {vec3} a The first vector.
	 * @param {vec3} b The second vector.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	vec3.exactEquals = function (a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
	};

	/**
	 * Returns whether or not the vectors have approximately the same elements in the same position.
	 *
	 * @param {vec3} a The first vector.
	 * @param {vec3} b The second vector.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	vec3.equals = function (a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2];
	    var b0 = b[0], b1 = b[1], b2 = b[2];
	    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)));
	};

	module.exports = vec3;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);

	/**
	 * @class 4 Dimensional Vector
	 * @name vec4
	 */
	var vec4 = {};

	/**
	 * Creates a new, empty vec4
	 *
	 * @returns {vec4} a new 4D vector
	 */
	vec4.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	    return out;
	};

	/**
	 * Creates a new vec4 initialized with values from an existing vector
	 *
	 * @param {vec4} a vector to clone
	 * @returns {vec4} a new 4D vector
	 */
	vec4.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};

	/**
	 * Creates a new vec4 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} a new 4D vector
	 */
	vec4.fromValues = function(x, y, z, w) {
	    var out = new glMatrix.ARRAY_TYPE(4);
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};

	/**
	 * Copy the values from one vec4 to another
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the source vector
	 * @returns {vec4} out
	 */
	vec4.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    return out;
	};

	/**
	 * Set the components of a vec4 to the given values
	 *
	 * @param {vec4} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @param {Number} z Z component
	 * @param {Number} w W component
	 * @returns {vec4} out
	 */
	vec4.set = function(out, x, y, z, w) {
	    out[0] = x;
	    out[1] = y;
	    out[2] = z;
	    out[3] = w;
	    return out;
	};

	/**
	 * Adds two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    out[2] = a[2] + b[2];
	    out[3] = a[3] + b[3];
	    return out;
	};

	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    out[2] = a[2] - b[2];
	    out[3] = a[3] - b[3];
	    return out;
	};

	/**
	 * Alias for {@link vec4.subtract}
	 * @function
	 */
	vec4.sub = vec4.subtract;

	/**
	 * Multiplies two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    out[2] = a[2] * b[2];
	    out[3] = a[3] * b[3];
	    return out;
	};

	/**
	 * Alias for {@link vec4.multiply}
	 * @function
	 */
	vec4.mul = vec4.multiply;

	/**
	 * Divides two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    out[2] = a[2] / b[2];
	    out[3] = a[3] / b[3];
	    return out;
	};

	/**
	 * Alias for {@link vec4.divide}
	 * @function
	 */
	vec4.div = vec4.divide;

	/**
	 * Math.ceil the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to ceil
	 * @returns {vec4} out
	 */
	vec4.ceil = function (out, a) {
	    out[0] = Math.ceil(a[0]);
	    out[1] = Math.ceil(a[1]);
	    out[2] = Math.ceil(a[2]);
	    out[3] = Math.ceil(a[3]);
	    return out;
	};

	/**
	 * Math.floor the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to floor
	 * @returns {vec4} out
	 */
	vec4.floor = function (out, a) {
	    out[0] = Math.floor(a[0]);
	    out[1] = Math.floor(a[1]);
	    out[2] = Math.floor(a[2]);
	    out[3] = Math.floor(a[3]);
	    return out;
	};

	/**
	 * Returns the minimum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    out[2] = Math.min(a[2], b[2]);
	    out[3] = Math.min(a[3], b[3]);
	    return out;
	};

	/**
	 * Returns the maximum of two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {vec4} out
	 */
	vec4.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    out[2] = Math.max(a[2], b[2]);
	    out[3] = Math.max(a[3], b[3]);
	    return out;
	};

	/**
	 * Math.round the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to round
	 * @returns {vec4} out
	 */
	vec4.round = function (out, a) {
	    out[0] = Math.round(a[0]);
	    out[1] = Math.round(a[1]);
	    out[2] = Math.round(a[2]);
	    out[3] = Math.round(a[3]);
	    return out;
	};

	/**
	 * Scales a vec4 by a scalar number
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec4} out
	 */
	vec4.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    out[2] = a[2] * b;
	    out[3] = a[3] * b;
	    return out;
	};

	/**
	 * Adds two vec4's after scaling the second operand by a scalar value
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec4} out
	 */
	vec4.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    out[2] = a[2] + (b[2] * scale);
	    out[3] = a[3] + (b[3] * scale);
	    return out;
	};

	/**
	 * Calculates the euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec4.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};

	/**
	 * Alias for {@link vec4.distance}
	 * @function
	 */
	vec4.dist = vec4.distance;

	/**
	 * Calculates the squared euclidian distance between two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec4.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1],
	        z = b[2] - a[2],
	        w = b[3] - a[3];
	    return x*x + y*y + z*z + w*w;
	};

	/**
	 * Alias for {@link vec4.squaredDistance}
	 * @function
	 */
	vec4.sqrDist = vec4.squaredDistance;

	/**
	 * Calculates the length of a vec4
	 *
	 * @param {vec4} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec4.length = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return Math.sqrt(x*x + y*y + z*z + w*w);
	};

	/**
	 * Alias for {@link vec4.length}
	 * @function
	 */
	vec4.len = vec4.length;

	/**
	 * Calculates the squared length of a vec4
	 *
	 * @param {vec4} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec4.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    return x*x + y*y + z*z + w*w;
	};

	/**
	 * Alias for {@link vec4.squaredLength}
	 * @function
	 */
	vec4.sqrLen = vec4.squaredLength;

	/**
	 * Negates the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to negate
	 * @returns {vec4} out
	 */
	vec4.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    out[2] = -a[2];
	    out[3] = -a[3];
	    return out;
	};

	/**
	 * Returns the inverse of the components of a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to invert
	 * @returns {vec4} out
	 */
	vec4.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  out[2] = 1.0 / a[2];
	  out[3] = 1.0 / a[3];
	  return out;
	};

	/**
	 * Normalize a vec4
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a vector to normalize
	 * @returns {vec4} out
	 */
	vec4.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1],
	        z = a[2],
	        w = a[3];
	    var len = x*x + y*y + z*z + w*w;
	    if (len > 0) {
	        len = 1 / Math.sqrt(len);
	        out[0] = x * len;
	        out[1] = y * len;
	        out[2] = z * len;
	        out[3] = w * len;
	    }
	    return out;
	};

	/**
	 * Calculates the dot product of two vec4's
	 *
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec4.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	};

	/**
	 * Performs a linear interpolation between two vec4's
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the first operand
	 * @param {vec4} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec4} out
	 */
	vec4.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1],
	        az = a[2],
	        aw = a[3];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    out[2] = az + t * (b[2] - az);
	    out[3] = aw + t * (b[3] - aw);
	    return out;
	};

	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec4} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec4} out
	 */
	vec4.random = function (out, scale) {
	    scale = scale || 1.0;

	    //TODO: This is a pretty awful way of doing this. Find something better.
	    out[0] = glMatrix.RANDOM();
	    out[1] = glMatrix.RANDOM();
	    out[2] = glMatrix.RANDOM();
	    out[3] = glMatrix.RANDOM();
	    vec4.normalize(out, out);
	    vec4.scale(out, out, scale);
	    return out;
	};

	/**
	 * Transforms the vec4 with a mat4.
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec4} out
	 */
	vec4.transformMat4 = function(out, a, m) {
	    var x = a[0], y = a[1], z = a[2], w = a[3];
	    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	    return out;
	};

	/**
	 * Transforms the vec4 with a quat
	 *
	 * @param {vec4} out the receiving vector
	 * @param {vec4} a the vector to transform
	 * @param {quat} q quaternion to transform with
	 * @returns {vec4} out
	 */
	vec4.transformQuat = function(out, a, q) {
	    var x = a[0], y = a[1], z = a[2],
	        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

	        // calculate quat * vec
	        ix = qw * x + qy * z - qz * y,
	        iy = qw * y + qz * x - qx * z,
	        iz = qw * z + qx * y - qy * x,
	        iw = -qx * x - qy * y - qz * z;

	    // calculate result * inverse quat
	    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	    out[3] = a[3];
	    return out;
	};

	/**
	 * Perform some operation over an array of vec4s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec4.forEach = (function() {
	    var vec = vec4.create();

	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 4;
	        }

	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }

	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
	        }
	        
	        return a;
	    };
	})();

	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec4} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec4.str = function (a) {
	    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
	};

	/**
	 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
	 *
	 * @param {vec4} a The first vector.
	 * @param {vec4} b The second vector.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	vec4.exactEquals = function (a, b) {
	    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
	};

	/**
	 * Returns whether or not the vectors have approximately the same elements in the same position.
	 *
	 * @param {vec4} a The first vector.
	 * @param {vec4} b The second vector.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	vec4.equals = function (a, b) {
	    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
	    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
	            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
	            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)));
	};

	module.exports = vec4;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE. */

	var glMatrix = __webpack_require__(23);

	/**
	 * @class 2 Dimensional Vector
	 * @name vec2
	 */
	var vec2 = {};

	/**
	 * Creates a new, empty vec2
	 *
	 * @returns {vec2} a new 2D vector
	 */
	vec2.create = function() {
	    var out = new glMatrix.ARRAY_TYPE(2);
	    out[0] = 0;
	    out[1] = 0;
	    return out;
	};

	/**
	 * Creates a new vec2 initialized with values from an existing vector
	 *
	 * @param {vec2} a vector to clone
	 * @returns {vec2} a new 2D vector
	 */
	vec2.clone = function(a) {
	    var out = new glMatrix.ARRAY_TYPE(2);
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};

	/**
	 * Creates a new vec2 initialized with the given values
	 *
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} a new 2D vector
	 */
	vec2.fromValues = function(x, y) {
	    var out = new glMatrix.ARRAY_TYPE(2);
	    out[0] = x;
	    out[1] = y;
	    return out;
	};

	/**
	 * Copy the values from one vec2 to another
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the source vector
	 * @returns {vec2} out
	 */
	vec2.copy = function(out, a) {
	    out[0] = a[0];
	    out[1] = a[1];
	    return out;
	};

	/**
	 * Set the components of a vec2 to the given values
	 *
	 * @param {vec2} out the receiving vector
	 * @param {Number} x X component
	 * @param {Number} y Y component
	 * @returns {vec2} out
	 */
	vec2.set = function(out, x, y) {
	    out[0] = x;
	    out[1] = y;
	    return out;
	};

	/**
	 * Adds two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.add = function(out, a, b) {
	    out[0] = a[0] + b[0];
	    out[1] = a[1] + b[1];
	    return out;
	};

	/**
	 * Subtracts vector b from vector a
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.subtract = function(out, a, b) {
	    out[0] = a[0] - b[0];
	    out[1] = a[1] - b[1];
	    return out;
	};

	/**
	 * Alias for {@link vec2.subtract}
	 * @function
	 */
	vec2.sub = vec2.subtract;

	/**
	 * Multiplies two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.multiply = function(out, a, b) {
	    out[0] = a[0] * b[0];
	    out[1] = a[1] * b[1];
	    return out;
	};

	/**
	 * Alias for {@link vec2.multiply}
	 * @function
	 */
	vec2.mul = vec2.multiply;

	/**
	 * Divides two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.divide = function(out, a, b) {
	    out[0] = a[0] / b[0];
	    out[1] = a[1] / b[1];
	    return out;
	};

	/**
	 * Alias for {@link vec2.divide}
	 * @function
	 */
	vec2.div = vec2.divide;

	/**
	 * Math.ceil the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to ceil
	 * @returns {vec2} out
	 */
	vec2.ceil = function (out, a) {
	    out[0] = Math.ceil(a[0]);
	    out[1] = Math.ceil(a[1]);
	    return out;
	};

	/**
	 * Math.floor the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to floor
	 * @returns {vec2} out
	 */
	vec2.floor = function (out, a) {
	    out[0] = Math.floor(a[0]);
	    out[1] = Math.floor(a[1]);
	    return out;
	};

	/**
	 * Returns the minimum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.min = function(out, a, b) {
	    out[0] = Math.min(a[0], b[0]);
	    out[1] = Math.min(a[1], b[1]);
	    return out;
	};

	/**
	 * Returns the maximum of two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec2} out
	 */
	vec2.max = function(out, a, b) {
	    out[0] = Math.max(a[0], b[0]);
	    out[1] = Math.max(a[1], b[1]);
	    return out;
	};

	/**
	 * Math.round the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to round
	 * @returns {vec2} out
	 */
	vec2.round = function (out, a) {
	    out[0] = Math.round(a[0]);
	    out[1] = Math.round(a[1]);
	    return out;
	};

	/**
	 * Scales a vec2 by a scalar number
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec2} out
	 */
	vec2.scale = function(out, a, b) {
	    out[0] = a[0] * b;
	    out[1] = a[1] * b;
	    return out;
	};

	/**
	 * Adds two vec2's after scaling the second operand by a scalar value
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @param {Number} scale the amount to scale b by before adding
	 * @returns {vec2} out
	 */
	vec2.scaleAndAdd = function(out, a, b, scale) {
	    out[0] = a[0] + (b[0] * scale);
	    out[1] = a[1] + (b[1] * scale);
	    return out;
	};

	/**
	 * Calculates the euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} distance between a and b
	 */
	vec2.distance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return Math.sqrt(x*x + y*y);
	};

	/**
	 * Alias for {@link vec2.distance}
	 * @function
	 */
	vec2.dist = vec2.distance;

	/**
	 * Calculates the squared euclidian distance between two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} squared distance between a and b
	 */
	vec2.squaredDistance = function(a, b) {
	    var x = b[0] - a[0],
	        y = b[1] - a[1];
	    return x*x + y*y;
	};

	/**
	 * Alias for {@link vec2.squaredDistance}
	 * @function
	 */
	vec2.sqrDist = vec2.squaredDistance;

	/**
	 * Calculates the length of a vec2
	 *
	 * @param {vec2} a vector to calculate length of
	 * @returns {Number} length of a
	 */
	vec2.length = function (a) {
	    var x = a[0],
	        y = a[1];
	    return Math.sqrt(x*x + y*y);
	};

	/**
	 * Alias for {@link vec2.length}
	 * @function
	 */
	vec2.len = vec2.length;

	/**
	 * Calculates the squared length of a vec2
	 *
	 * @param {vec2} a vector to calculate squared length of
	 * @returns {Number} squared length of a
	 */
	vec2.squaredLength = function (a) {
	    var x = a[0],
	        y = a[1];
	    return x*x + y*y;
	};

	/**
	 * Alias for {@link vec2.squaredLength}
	 * @function
	 */
	vec2.sqrLen = vec2.squaredLength;

	/**
	 * Negates the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to negate
	 * @returns {vec2} out
	 */
	vec2.negate = function(out, a) {
	    out[0] = -a[0];
	    out[1] = -a[1];
	    return out;
	};

	/**
	 * Returns the inverse of the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to invert
	 * @returns {vec2} out
	 */
	vec2.inverse = function(out, a) {
	  out[0] = 1.0 / a[0];
	  out[1] = 1.0 / a[1];
	  return out;
	};

	/**
	 * Normalize a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a vector to normalize
	 * @returns {vec2} out
	 */
	vec2.normalize = function(out, a) {
	    var x = a[0],
	        y = a[1];
	    var len = x*x + y*y;
	    if (len > 0) {
	        //TODO: evaluate use of glm_invsqrt here?
	        len = 1 / Math.sqrt(len);
	        out[0] = a[0] * len;
	        out[1] = a[1] * len;
	    }
	    return out;
	};

	/**
	 * Calculates the dot product of two vec2's
	 *
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {Number} dot product of a and b
	 */
	vec2.dot = function (a, b) {
	    return a[0] * b[0] + a[1] * b[1];
	};

	/**
	 * Computes the cross product of two vec2's
	 * Note that the cross product must by definition produce a 3D vector
	 *
	 * @param {vec3} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @returns {vec3} out
	 */
	vec2.cross = function(out, a, b) {
	    var z = a[0] * b[1] - a[1] * b[0];
	    out[0] = out[1] = 0;
	    out[2] = z;
	    return out;
	};

	/**
	 * Performs a linear interpolation between two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the first operand
	 * @param {vec2} b the second operand
	 * @param {Number} t interpolation amount between the two inputs
	 * @returns {vec2} out
	 */
	vec2.lerp = function (out, a, b, t) {
	    var ax = a[0],
	        ay = a[1];
	    out[0] = ax + t * (b[0] - ax);
	    out[1] = ay + t * (b[1] - ay);
	    return out;
	};

	/**
	 * Generates a random vector with the given scale
	 *
	 * @param {vec2} out the receiving vector
	 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
	 * @returns {vec2} out
	 */
	vec2.random = function (out, scale) {
	    scale = scale || 1.0;
	    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
	    out[0] = Math.cos(r) * scale;
	    out[1] = Math.sin(r) * scale;
	    return out;
	};

	/**
	 * Transforms the vec2 with a mat2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y;
	    out[1] = m[1] * x + m[3] * y;
	    return out;
	};

	/**
	 * Transforms the vec2 with a mat2d
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat2d} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat2d = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[2] * y + m[4];
	    out[1] = m[1] * x + m[3] * y + m[5];
	    return out;
	};

	/**
	 * Transforms the vec2 with a mat3
	 * 3rd vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat3} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat3 = function(out, a, m) {
	    var x = a[0],
	        y = a[1];
	    out[0] = m[0] * x + m[3] * y + m[6];
	    out[1] = m[1] * x + m[4] * y + m[7];
	    return out;
	};

	/**
	 * Transforms the vec2 with a mat4
	 * 3rd vector component is implicitly '0'
	 * 4th vector component is implicitly '1'
	 *
	 * @param {vec2} out the receiving vector
	 * @param {vec2} a the vector to transform
	 * @param {mat4} m matrix to transform with
	 * @returns {vec2} out
	 */
	vec2.transformMat4 = function(out, a, m) {
	    var x = a[0], 
	        y = a[1];
	    out[0] = m[0] * x + m[4] * y + m[12];
	    out[1] = m[1] * x + m[5] * y + m[13];
	    return out;
	};

	/**
	 * Perform some operation over an array of vec2s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */
	vec2.forEach = (function() {
	    var vec = vec2.create();

	    return function(a, stride, offset, count, fn, arg) {
	        var i, l;
	        if(!stride) {
	            stride = 2;
	        }

	        if(!offset) {
	            offset = 0;
	        }
	        
	        if(count) {
	            l = Math.min((count * stride) + offset, a.length);
	        } else {
	            l = a.length;
	        }

	        for(i = offset; i < l; i += stride) {
	            vec[0] = a[i]; vec[1] = a[i+1];
	            fn(vec, vec, arg);
	            a[i] = vec[0]; a[i+1] = vec[1];
	        }
	        
	        return a;
	    };
	})();

	/**
	 * Returns a string representation of a vector
	 *
	 * @param {vec2} vec vector to represent as a string
	 * @returns {String} string representation of the vector
	 */
	vec2.str = function (a) {
	    return 'vec2(' + a[0] + ', ' + a[1] + ')';
	};

	/**
	 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
	 *
	 * @param {vec2} a The first vector.
	 * @param {vec2} b The second vector.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	vec2.exactEquals = function (a, b) {
	    return a[0] === b[0] && a[1] === b[1];
	};

	/**
	 * Returns whether or not the vectors have approximately the same elements in the same position.
	 *
	 * @param {vec2} a The first vector.
	 * @param {vec2} b The second vector.
	 * @returns {Boolean} True if the vectors are equal, false otherwise.
	 */
	vec2.equals = function (a, b) {
	    var a0 = a[0], a1 = a[1];
	    var b0 = b[0], b1 = b[1];
	    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
	            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)));
	};

	module.exports = vec2;


/***/ },
/* 32 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/*
	** Copyright (c) 2012 The Khronos Group Inc.
	**
	** Permission is hereby granted, free of charge, to any person obtaining a
	** copy of this software and/or associated documentation files (the
	** "Materials"), to deal in the Materials without restriction, including
	** without limitation the rights to use, copy, modify, merge, publish,
	** distribute, sublicense, and/or sell copies of the Materials, and to
	** permit persons to whom the Materials are furnished to do so, subject to
	** the following conditions:
	**
	** The above copyright notice and this permission notice shall be included
	** in all copies or substantial portions of the Materials.
	**
	** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
	*/

	//Ported to node by Marcin Ignac on 2016-05-20

	// Various functions for helping debug WebGL apps.

	WebGLDebugUtils = function() {

	//polyfill window in node
	if (typeof(window) == 'undefined') {
	    window = global;
	}

	/**
	 * Wrapped logging function.
	 * @param {string} msg Message to log.
	 */
	var log = function(msg) {
	  if (window.console && window.console.log) {
	    window.console.log(msg);
	  }
	};

	/**
	 * Wrapped error logging function.
	 * @param {string} msg Message to log.
	 */
	var error = function(msg) {
	  if (window.console && window.console.error) {
	    window.console.error(msg);
	  } else {
	    log(msg);
	  }
	};


	/**
	 * Which arguments are enums based on the number of arguments to the function.
	 * So
	 *    'texImage2D': {
	 *       9: { 0:true, 2:true, 6:true, 7:true },
	 *       6: { 0:true, 2:true, 3:true, 4:true },
	 *    },
	 *
	 * means if there are 9 arguments then 6 and 7 are enums, if there are 6
	 * arguments 3 and 4 are enums
	 *
	 * @type {!Object.<number, !Object.<number, string>}
	 */
	var glValidEnumContexts = {
	  // Generic setters and getters

	  'enable': {1: { 0:true }},
	  'disable': {1: { 0:true }},
	  'getParameter': {1: { 0:true }},

	  // Rendering

	  'drawArrays': {3:{ 0:true }},
	  'drawElements': {4:{ 0:true, 2:true }},

	  // Shaders

	  'createShader': {1: { 0:true }},
	  'getShaderParameter': {2: { 1:true }},
	  'getProgramParameter': {2: { 1:true }},
	  'getShaderPrecisionFormat': {2: { 0: true, 1:true }},

	  // Vertex attributes

	  'getVertexAttrib': {2: { 1:true }},
	  'vertexAttribPointer': {6: { 2:true }},

	  // Textures

	  'bindTexture': {2: { 0:true }},
	  'activeTexture': {1: { 0:true }},
	  'getTexParameter': {2: { 0:true, 1:true }},
	  'texParameterf': {3: { 0:true, 1:true }},
	  'texParameteri': {3: { 0:true, 1:true, 2:true }},
	  'texImage2D': {
	     9: { 0:true, 2:true, 6:true, 7:true },
	     6: { 0:true, 2:true, 3:true, 4:true }
	  },
	  'texSubImage2D': {
	    9: { 0:true, 6:true, 7:true },
	    7: { 0:true, 4:true, 5:true }
	  },
	  'copyTexImage2D': {8: { 0:true, 2:true }},
	  'copyTexSubImage2D': {8: { 0:true }},
	  'generateMipmap': {1: { 0:true }},
	  'compressedTexImage2D': {7: { 0: true, 2:true }},
	  'compressedTexSubImage2D': {8: { 0: true, 6:true }},

	  // Buffer objects

	  'bindBuffer': {2: { 0:true }},
	  'bufferData': {3: { 0:true, 2:true }},
	  'bufferSubData': {3: { 0:true }},
	  'getBufferParameter': {2: { 0:true, 1:true }},

	  // Renderbuffers and framebuffers

	  'pixelStorei': {2: { 0:true, 1:true }},
	  'readPixels': {7: { 4:true, 5:true }},
	  'bindRenderbuffer': {2: { 0:true }},
	  'bindFramebuffer': {2: { 0:true }},
	  'checkFramebufferStatus': {1: { 0:true }},
	  'framebufferRenderbuffer': {4: { 0:true, 1:true, 2:true }},
	  'framebufferTexture2D': {5: { 0:true, 1:true, 2:true }},
	  'getFramebufferAttachmentParameter': {3: { 0:true, 1:true, 2:true }},
	  'getRenderbufferParameter': {2: { 0:true, 1:true }},
	  'renderbufferStorage': {4: { 0:true, 1:true }},

	  // Frame buffer operations (clear, blend, depth test, stencil)

	  'clear': {1: { 0: { 'enumBitwiseOr': ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] }}},
	  'depthFunc': {1: { 0:true }},
	  'blendFunc': {2: { 0:true, 1:true }},
	  'blendFuncSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},
	  'blendEquation': {1: { 0:true }},
	  'blendEquationSeparate': {2: { 0:true, 1:true }},
	  'stencilFunc': {3: { 0:true }},
	  'stencilFuncSeparate': {4: { 0:true, 1:true }},
	  'stencilMaskSeparate': {2: { 0:true }},
	  'stencilOp': {3: { 0:true, 1:true, 2:true }},
	  'stencilOpSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},

	  // Culling

	  'cullFace': {1: { 0:true }},
	  'frontFace': {1: { 0:true }},

	  // ANGLE_instanced_arrays extension

	  'drawArraysInstancedANGLE': {4: { 0:true }},
	  'drawElementsInstancedANGLE': {5: { 0:true, 2:true }},

	  // EXT_blend_minmax extension

	  'blendEquationEXT': {1: { 0:true }}
	};

	/**
	 * Map of numbers to names.
	 * @type {Object}
	 */
	var glEnums = null;

	/**
	 * Map of names to numbers.
	 * @type {Object}
	 */
	var enumStringToValue = null;

	/**
	 * Initializes this module. Safe to call more than once.
	 * @param {!WebGLRenderingContext} ctx A WebGL context. If
	 *    you have more than one context it doesn't matter which one
	 *    you pass in, it is only used to pull out constants.
	 */
	function init(ctx) {
	  if (glEnums == null) {
	    glEnums = { };
	    enumStringToValue = { };
	    for (var propertyName in ctx) {
	      if (typeof ctx[propertyName] == 'number') {
	        glEnums[ctx[propertyName]] = propertyName;
	        enumStringToValue[propertyName] = ctx[propertyName];
	      }
	    }
	  }
	}

	/**
	 * Checks the utils have been initialized.
	 */
	function checkInit() {
	  if (glEnums == null) {
	    throw 'WebGLDebugUtils.init(ctx) not called';
	  }
	}

	/**
	 * Returns true or false if value matches any WebGL enum
	 * @param {*} value Value to check if it might be an enum.
	 * @return {boolean} True if value matches one of the WebGL defined enums
	 */
	function mightBeEnum(value) {
	  checkInit();
	  return (glEnums[value] !== undefined);
	}

	/**
	 * Gets an string version of an WebGL enum.
	 *
	 * Example:
	 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
	 *
	 * @param {number} value Value to return an enum for
	 * @return {string} The string version of the enum.
	 */
	function glEnumToString(value) {
	  checkInit();
	  var name = glEnums[value];
	  return (name !== undefined) ? ("gl." + name) :
	      ("/*UNKNOWN WebGL ENUM*/ 0x" + value.toString(16) + "");
	}

	/**
	 * Returns the string version of a WebGL argument.
	 * Attempts to convert enum arguments to strings.
	 * @param {string} functionName the name of the WebGL function.
	 * @param {number} numArgs the number of arguments passed to the function.
	 * @param {number} argumentIndx the index of the argument.
	 * @param {*} value The value of the argument.
	 * @return {string} The value as a string.
	 */
	function glFunctionArgToString(functionName, numArgs, argumentIndex, value) {
	  var funcInfo = glValidEnumContexts[functionName];
	  if (funcInfo !== undefined) {
	    var funcInfo = funcInfo[numArgs];
	    if (funcInfo !== undefined) {
	      if (funcInfo[argumentIndex]) {
	        if (typeof funcInfo[argumentIndex] === 'object' &&
	            funcInfo[argumentIndex]['enumBitwiseOr'] !== undefined) {
	          var enums = funcInfo[argumentIndex]['enumBitwiseOr'];
	          var orResult = 0;
	          var orEnums = [];
	          for (var i = 0; i < enums.length; ++i) {
	            var enumValue = enumStringToValue[enums[i]];
	            if ((value & enumValue) !== 0) {
	              orResult |= enumValue;
	              orEnums.push(glEnumToString(enumValue));
	            }
	          }
	          if (orResult === value) {
	            return orEnums.join(' | ');
	          } else {
	            return glEnumToString(value);
	          }
	        } else {
	          return glEnumToString(value);
	        }
	      }
	    }
	  }
	  if (value === null) {
	    return "null";
	  } else if (value === undefined) {
	    return "undefined";
	  } else {
	    return value.toString();
	  }
	}

	/**
	 * Converts the arguments of a WebGL function to a string.
	 * Attempts to convert enum arguments to strings.
	 *
	 * @param {string} functionName the name of the WebGL function.
	 * @param {number} args The arguments.
	 * @return {string} The arguments as a string.
	 */
	function glFunctionArgsToString(functionName, args) {
	  // apparently we can't do args.join(",");
	  var argStr = "";
	  var numArgs = args.length;
	  for (var ii = 0; ii < numArgs; ++ii) {
	    argStr += ((ii == 0) ? '' : ', ') +
	        glFunctionArgToString(functionName, numArgs, ii, args[ii]);
	  }
	  return argStr;
	};


	function makePropertyWrapper(wrapper, original, propertyName) {
	  //log("wrap prop: " + propertyName);
	  wrapper.__defineGetter__(propertyName, function() {
	    return original[propertyName];
	  });
	  // TODO(gmane): this needs to handle properties that take more than
	  // one value?
	  wrapper.__defineSetter__(propertyName, function(value) {
	    //log("set: " + propertyName);
	    original[propertyName] = value;
	  });
	}

	// Makes a function that calls a function on another object.
	function makeFunctionWrapper(original, functionName) {
	  //log("wrap fn: " + functionName);
	  var f = original[functionName];
	  return function() {
	    //log("call: " + functionName);
	    var result = f.apply(original, arguments);
	    return result;
	  };
	}

	/**
	 * Given a WebGL context returns a wrapped context that calls
	 * gl.getError after every command and calls a function if the
	 * result is not gl.NO_ERROR.
	 *
	 * @param {!WebGLRenderingContext} ctx The webgl context to
	 *        wrap.
	 * @param {!function(err, funcName, args): void} opt_onErrorFunc
	 *        The function to call when gl.getError returns an
	 *        error. If not specified the default function calls
	 *        console.log with a message.
	 * @param {!function(funcName, args): void} opt_onFunc The
	 *        function to call when each webgl function is called.
	 *        You can use this to log all calls for example.
	 * @param {!WebGLRenderingContext} opt_err_ctx The webgl context
	 *        to call getError on if different than ctx.
	 */
	function makeDebugContext(ctx, opt_onErrorFunc, opt_onFunc, opt_err_ctx) {
	  opt_err_ctx = opt_err_ctx || ctx;
	  init(ctx);
	  opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
	        // apparently we can't do args.join(",");
	        var argStr = "";
	        var numArgs = args.length;
	        for (var ii = 0; ii < numArgs; ++ii) {
	          argStr += ((ii == 0) ? '' : ', ') +
	              glFunctionArgToString(functionName, numArgs, ii, args[ii]);
	        }
	        error("WebGL error "+ glEnumToString(err) + " in "+ functionName +
	              "(" + argStr + ")");
	      };

	  // Holds booleans for each GL error so after we get the error ourselves
	  // we can still return it to the client app.
	  var glErrorShadow = { };

	  // Makes a function that calls a WebGL function and then calls getError.
	  function makeErrorWrapper(ctx, functionName) {
	    return function() {
	      if (opt_onFunc) {
	        opt_onFunc(functionName, arguments);
	      }
	      var result = ctx[functionName].apply(ctx, arguments);
	      var err = opt_err_ctx.getError();
	      if (err != 0) {
	        glErrorShadow[err] = true;
	        opt_onErrorFunc(err, functionName, arguments);
	      }
	      return result;
	    };
	  }

	  // Make a an object that has a copy of every property of the WebGL context
	  // but wraps all functions.
	  var wrapper = {};
	  for (var propertyName in ctx) {
	    if (typeof ctx[propertyName] == 'function') {
	      if (propertyName != 'getExtension') {
	        wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
	      } else {
	        var wrapped = makeErrorWrapper(ctx, propertyName);
	        wrapper[propertyName] = function () {
	          var result = wrapped.apply(ctx, arguments);
	          return makeDebugContext(result, opt_onErrorFunc, opt_onFunc, opt_err_ctx);
	        };
	      }
	    } else {
	      makePropertyWrapper(wrapper, ctx, propertyName);
	    }
	  }

	  // Override the getError function with one that returns our saved results.
	  wrapper.getError = function() {
	    for (var err in glErrorShadow) {
	      if (glErrorShadow.hasOwnProperty(err)) {
	        if (glErrorShadow[err]) {
	          glErrorShadow[err] = false;
	          return err;
	        }
	      }
	    }
	    return ctx.NO_ERROR;
	  };

	  return wrapper;
	}

	function resetToInitialState(ctx) {
	  var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
	  var tmp = ctx.createBuffer();
	  ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
	  for (var ii = 0; ii < numAttribs; ++ii) {
	    ctx.disableVertexAttribArray(ii);
	    ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
	    ctx.vertexAttrib1f(ii, 0);
	  }
	  ctx.deleteBuffer(tmp);

	  var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
	  for (var ii = 0; ii < numTextureUnits; ++ii) {
	    ctx.activeTexture(ctx.TEXTURE0 + ii);
	    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
	    ctx.bindTexture(ctx.TEXTURE_2D, null);
	  }

	  ctx.activeTexture(ctx.TEXTURE0);
	  ctx.useProgram(null);
	  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
	  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
	  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
	  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
	  ctx.disable(ctx.BLEND);
	  ctx.disable(ctx.CULL_FACE);
	  ctx.disable(ctx.DEPTH_TEST);
	  ctx.disable(ctx.DITHER);
	  ctx.disable(ctx.SCISSOR_TEST);
	  ctx.blendColor(0, 0, 0, 0);
	  ctx.blendEquation(ctx.FUNC_ADD);
	  ctx.blendFunc(ctx.ONE, ctx.ZERO);
	  ctx.clearColor(0, 0, 0, 0);
	  ctx.clearDepth(1);
	  ctx.clearStencil(-1);
	  ctx.colorMask(true, true, true, true);
	  ctx.cullFace(ctx.BACK);
	  ctx.depthFunc(ctx.LESS);
	  ctx.depthMask(true);
	  ctx.depthRange(0, 1);
	  ctx.frontFace(ctx.CCW);
	  ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
	  ctx.lineWidth(1);
	  ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
	  ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
	  ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
	  ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	  // TODO: Delete this IF.
	  if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
	    ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
	  }
	  ctx.polygonOffset(0, 0);
	  ctx.sampleCoverage(1, false);
	  ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
	  ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
	  ctx.stencilMask(0xFFFFFFFF);
	  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
	  ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
	  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

	  // TODO: This should NOT be needed but Firefox fails with 'hint'
	  while(ctx.getError());
	}

	function makeLostContextSimulatingCanvas(canvas) {
	  var unwrappedContext_;
	  var wrappedContext_;
	  var onLost_ = [];
	  var onRestored_ = [];
	  var wrappedContext_ = {};
	  var contextId_ = 1;
	  var contextLost_ = false;
	  var resourceId_ = 0;
	  var resourceDb_ = [];
	  var numCallsToLoseContext_ = 0;
	  var numCalls_ = 0;
	  var canRestore_ = false;
	  var restoreTimeout_ = 0;

	  // Holds booleans for each GL error so can simulate errors.
	  var glErrorShadow_ = { };

	  canvas.getContext = function(f) {
	    return function() {
	      var ctx = f.apply(canvas, arguments);
	      // Did we get a context and is it a WebGL context?
	      if (ctx instanceof WebGLRenderingContext) {
	        if (ctx != unwrappedContext_) {
	          if (unwrappedContext_) {
	            throw "got different context"
	          }
	          unwrappedContext_ = ctx;
	          wrappedContext_ = makeLostContextSimulatingContext(unwrappedContext_);
	        }
	        return wrappedContext_;
	      }
	      return ctx;
	    }
	  }(canvas.getContext);

	  function wrapEvent(listener) {
	    if (typeof(listener) == "function") {
	      return listener;
	    } else {
	      return function(info) {
	        listener.handleEvent(info);
	      }
	    }
	  }

	  var addOnContextLostListener = function(listener) {
	    onLost_.push(wrapEvent(listener));
	  };

	  var addOnContextRestoredListener = function(listener) {
	    onRestored_.push(wrapEvent(listener));
	  };


	  function wrapAddEventListener(canvas) {
	    var f = canvas.addEventListener;
	    canvas.addEventListener = function(type, listener, bubble) {
	      switch (type) {
	        case 'webglcontextlost':
	          addOnContextLostListener(listener);
	          break;
	        case 'webglcontextrestored':
	          addOnContextRestoredListener(listener);
	          break;
	        default:
	          f.apply(canvas, arguments);
	      }
	    };
	  }

	  wrapAddEventListener(canvas);

	  canvas.loseContext = function() {
	    if (!contextLost_) {
	      contextLost_ = true;
	      numCallsToLoseContext_ = 0;
	      ++contextId_;
	      while (unwrappedContext_.getError());
	      clearErrors();
	      glErrorShadow_[unwrappedContext_.CONTEXT_LOST_WEBGL] = true;
	      var event = makeWebGLContextEvent("context lost");
	      var callbacks = onLost_.slice();
	      setTimeout(function() {
	          //log("numCallbacks:" + callbacks.length);
	          for (var ii = 0; ii < callbacks.length; ++ii) {
	            //log("calling callback:" + ii);
	            callbacks[ii](event);
	          }
	          if (restoreTimeout_ >= 0) {
	            setTimeout(function() {
	                canvas.restoreContext();
	              }, restoreTimeout_);
	          }
	        }, 0);
	    }
	  };

	  canvas.restoreContext = function() {
	    if (contextLost_) {
	      if (onRestored_.length) {
	        setTimeout(function() {
	            if (!canRestore_) {
	              throw "can not restore. webglcontestlost listener did not call event.preventDefault";
	            }
	            freeResources();
	            resetToInitialState(unwrappedContext_);
	            contextLost_ = false;
	            numCalls_ = 0;
	            canRestore_ = false;
	            var callbacks = onRestored_.slice();
	            var event = makeWebGLContextEvent("context restored");
	            for (var ii = 0; ii < callbacks.length; ++ii) {
	              callbacks[ii](event);
	            }
	          }, 0);
	      }
	    }
	  };

	  canvas.loseContextInNCalls = function(numCalls) {
	    if (contextLost_) {
	      throw "You can not ask a lost contet to be lost";
	    }
	    numCallsToLoseContext_ = numCalls_ + numCalls;
	  };

	  canvas.getNumCalls = function() {
	    return numCalls_;
	  };

	  canvas.setRestoreTimeout = function(timeout) {
	    restoreTimeout_ = timeout;
	  };

	  function isWebGLObject(obj) {
	    //return false;
	    return (obj instanceof WebGLBuffer ||
	            obj instanceof WebGLFramebuffer ||
	            obj instanceof WebGLProgram ||
	            obj instanceof WebGLRenderbuffer ||
	            obj instanceof WebGLShader ||
	            obj instanceof WebGLTexture);
	  }

	  function checkResources(args) {
	    for (var ii = 0; ii < args.length; ++ii) {
	      var arg = args[ii];
	      if (isWebGLObject(arg)) {
	        return arg.__webglDebugContextLostId__ == contextId_;
	      }
	    }
	    return true;
	  }

	  function clearErrors() {
	    var k = Object.keys(glErrorShadow_);
	    for (var ii = 0; ii < k.length; ++ii) {
	      delete glErrorShadow_[k];
	    }
	  }

	  function loseContextIfTime() {
	    ++numCalls_;
	    if (!contextLost_) {
	      if (numCallsToLoseContext_ == numCalls_) {
	        canvas.loseContext();
	      }
	    }
	  }

	  // Makes a function that simulates WebGL when out of context.
	  function makeLostContextFunctionWrapper(ctx, functionName) {
	    var f = ctx[functionName];
	    return function() {
	      // log("calling:" + functionName);
	      // Only call the functions if the context is not lost.
	      loseContextIfTime();
	      if (!contextLost_) {
	        //if (!checkResources(arguments)) {
	        //  glErrorShadow_[wrappedContext_.INVALID_OPERATION] = true;
	        //  return;
	        //}
	        var result = f.apply(ctx, arguments);
	        return result;
	      }
	    };
	  }

	  function freeResources() {
	    for (var ii = 0; ii < resourceDb_.length; ++ii) {
	      var resource = resourceDb_[ii];
	      if (resource instanceof WebGLBuffer) {
	        unwrappedContext_.deleteBuffer(resource);
	      } else if (resource instanceof WebGLFramebuffer) {
	        unwrappedContext_.deleteFramebuffer(resource);
	      } else if (resource instanceof WebGLProgram) {
	        unwrappedContext_.deleteProgram(resource);
	      } else if (resource instanceof WebGLRenderbuffer) {
	        unwrappedContext_.deleteRenderbuffer(resource);
	      } else if (resource instanceof WebGLShader) {
	        unwrappedContext_.deleteShader(resource);
	      } else if (resource instanceof WebGLTexture) {
	        unwrappedContext_.deleteTexture(resource);
	      }
	    }
	  }

	  function makeWebGLContextEvent(statusMessage) {
	    return {
	      statusMessage: statusMessage,
	      preventDefault: function() {
	          canRestore_ = true;
	        }
	    };
	  }

	  return canvas;

	  function makeLostContextSimulatingContext(ctx) {
	    // copy all functions and properties to wrapper
	    for (var propertyName in ctx) {
	      if (typeof ctx[propertyName] == 'function') {
	         wrappedContext_[propertyName] = makeLostContextFunctionWrapper(
	             ctx, propertyName);
	       } else {
	         makePropertyWrapper(wrappedContext_, ctx, propertyName);
	       }
	    }

	    // Wrap a few functions specially.
	    wrappedContext_.getError = function() {
	      loseContextIfTime();
	      if (!contextLost_) {
	        var err;
	        while (err = unwrappedContext_.getError()) {
	          glErrorShadow_[err] = true;
	        }
	      }
	      for (var err in glErrorShadow_) {
	        if (glErrorShadow_[err]) {
	          delete glErrorShadow_[err];
	          return err;
	        }
	      }
	      return wrappedContext_.NO_ERROR;
	    };

	    var creationFunctions = [
	      "createBuffer",
	      "createFramebuffer",
	      "createProgram",
	      "createRenderbuffer",
	      "createShader",
	      "createTexture"
	    ];
	    for (var ii = 0; ii < creationFunctions.length; ++ii) {
	      var functionName = creationFunctions[ii];
	      wrappedContext_[functionName] = function(f) {
	        return function() {
	          loseContextIfTime();
	          if (contextLost_) {
	            return null;
	          }
	          var obj = f.apply(ctx, arguments);
	          obj.__webglDebugContextLostId__ = contextId_;
	          resourceDb_.push(obj);
	          return obj;
	        };
	      }(ctx[functionName]);
	    }

	    var functionsThatShouldReturnNull = [
	      "getActiveAttrib",
	      "getActiveUniform",
	      "getBufferParameter",
	      "getContextAttributes",
	      "getAttachedShaders",
	      "getFramebufferAttachmentParameter",
	      "getParameter",
	      "getProgramParameter",
	      "getProgramInfoLog",
	      "getRenderbufferParameter",
	      "getShaderParameter",
	      "getShaderInfoLog",
	      "getShaderSource",
	      "getTexParameter",
	      "getUniform",
	      "getUniformLocation",
	      "getVertexAttrib"
	    ];
	    for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
	      var functionName = functionsThatShouldReturnNull[ii];
	      wrappedContext_[functionName] = function(f) {
	        return function() {
	          loseContextIfTime();
	          if (contextLost_) {
	            return null;
	          }
	          return f.apply(ctx, arguments);
	        }
	      }(wrappedContext_[functionName]);
	    }

	    var isFunctions = [
	      "isBuffer",
	      "isEnabled",
	      "isFramebuffer",
	      "isProgram",
	      "isRenderbuffer",
	      "isShader",
	      "isTexture"
	    ];
	    for (var ii = 0; ii < isFunctions.length; ++ii) {
	      var functionName = isFunctions[ii];
	      wrappedContext_[functionName] = function(f) {
	        return function() {
	          loseContextIfTime();
	          if (contextLost_) {
	            return false;
	          }
	          return f.apply(ctx, arguments);
	        }
	      }(wrappedContext_[functionName]);
	    }

	    wrappedContext_.checkFramebufferStatus = function(f) {
	      return function() {
	        loseContextIfTime();
	        if (contextLost_) {
	          return wrappedContext_.FRAMEBUFFER_UNSUPPORTED;
	        }
	        return f.apply(ctx, arguments);
	      };
	    }(wrappedContext_.checkFramebufferStatus);

	    wrappedContext_.getAttribLocation = function(f) {
	      return function() {
	        loseContextIfTime();
	        if (contextLost_) {
	          return -1;
	        }
	        return f.apply(ctx, arguments);
	      };
	    }(wrappedContext_.getAttribLocation);

	    wrappedContext_.getVertexAttribOffset = function(f) {
	      return function() {
	        loseContextIfTime();
	        if (contextLost_) {
	          return 0;
	        }
	        return f.apply(ctx, arguments);
	      };
	    }(wrappedContext_.getVertexAttribOffset);

	    wrappedContext_.isContextLost = function() {
	      return contextLost_;
	    };

	    return wrappedContext_;
	  }
	}

	return {
	  /**
	   * Initializes this module. Safe to call more than once.
	   * @param {!WebGLRenderingContext} ctx A WebGL context. If
	   *    you have more than one context it doesn't matter which one
	   *    you pass in, it is only used to pull out constants.
	   */
	  'init': init,

	  /**
	   * Returns true or false if value matches any WebGL enum
	   * @param {*} value Value to check if it might be an enum.
	   * @return {boolean} True if value matches one of the WebGL defined enums
	   */
	  'mightBeEnum': mightBeEnum,

	  /**
	   * Gets an string version of an WebGL enum.
	   *
	   * Example:
	   *   WebGLDebugUtil.init(ctx);
	   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
	   *
	   * @param {number} value Value to return an enum for
	   * @return {string} The string version of the enum.
	   */
	  'glEnumToString': glEnumToString,

	  /**
	   * Converts the argument of a WebGL function to a string.
	   * Attempts to convert enum arguments to strings.
	   *
	   * Example:
	   *   WebGLDebugUtil.init(ctx);
	   *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 2, 0, gl.TEXTURE_2D);
	   *
	   * would return 'TEXTURE_2D'
	   *
	   * @param {string} functionName the name of the WebGL function.
	   * @param {number} numArgs The number of arguments
	   * @param {number} argumentIndx the index of the argument.
	   * @param {*} value The value of the argument.
	   * @return {string} The value as a string.
	   */
	  'glFunctionArgToString': glFunctionArgToString,

	  /**
	   * Converts the arguments of a WebGL function to a string.
	   * Attempts to convert enum arguments to strings.
	   *
	   * @param {string} functionName the name of the WebGL function.
	   * @param {number} args The arguments.
	   * @return {string} The arguments as a string.
	   */
	  'glFunctionArgsToString': glFunctionArgsToString,

	  /**
	   * Given a WebGL context returns a wrapped context that calls
	   * gl.getError after every command and calls a function if the
	   * result is not NO_ERROR.
	   *
	   * You can supply your own function if you want. For example, if you'd like
	   * an exception thrown on any GL error you could do this
	   *
	   *    function throwOnGLError(err, funcName, args) {
	   *      throw WebGLDebugUtils.glEnumToString(err) +
	   *            " was caused by call to " + funcName;
	   *    };
	   *
	   *    ctx = WebGLDebugUtils.makeDebugContext(
	   *        canvas.getContext("webgl"), throwOnGLError);
	   *
	   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
	   * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
	   *     to call when gl.getError returns an error. If not specified the default
	   *     function calls console.log with a message.
	   * @param {!function(funcName, args): void} opt_onFunc The
	   *     function to call when each webgl function is called. You
	   *     can use this to log all calls for example.
	   */
	  'makeDebugContext': makeDebugContext,

	  /**
	   * Given a canvas element returns a wrapped canvas element that will
	   * simulate lost context. The canvas returned adds the following functions.
	   *
	   * loseContext:
	   *   simulates a lost context event.
	   *
	   * restoreContext:
	   *   simulates the context being restored.
	   *
	   * lostContextInNCalls:
	   *   loses the context after N gl calls.
	   *
	   * getNumCalls:
	   *   tells you how many gl calls there have been so far.
	   *
	   * setRestoreTimeout:
	   *   sets the number of milliseconds until the context is restored
	   *   after it has been lost. Defaults to 0. Pass -1 to prevent
	   *   automatic restoring.
	   *
	   * @param {!Canvas} canvas The canvas element to wrap.
	   */
	  'makeLostContextSimulatingCanvas': makeLostContextSimulatingCanvas,

	  /**
	   * Resets a context to the initial state.
	   * @param {!WebGLRenderingContext} ctx The webgl context to
	   *     reset.
	   */
	  'resetToInitialState': resetToInitialState
	};

	}();

	module.exports = WebGLDebugUtils;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ]);