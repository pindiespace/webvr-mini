import Emitter from  './emitter';

class Util {

    /** 
     * Utility functions.
     */

    constructor ( emitter ) {

        console.log( 'in Util' );

        // Shared constants

        this.NOT_IN_LIST = -1; // for .indexOf() checks

        // Create an Emitter object for pseudo-events.

        this.emitter = new Emitter();

        // String polyfills.

        this.setTrim();

        // Performance polyfill.

        this.setPerformance();

        // Finite number polyfill.

        this.setFinite();

        // Add slice to typed arrays, if needed.

        this.setSlice();

    }

    /** 
     * Polyfill for .trim
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
     */
    setTrim () {

        String.trim = String.trim || function ( value ) {

             return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

        }

    }

    /** 
     * Polyfill for isFinite()
     */
    setFinite () {

        Number.isFinite = Number.isFinite || function( value ) {

            return typeof value === 'number' && isFinite( value );

        }

    }

    /** 
     * Performance polyfill for timing.
     */
    setPerformance () {

        if ( ! 'performance' in window ) {

            window.performance = {};

        }

        Date.now = ( Date.now || function () {  // can't use () => here!

            return new Date().getTime();

        } );

        if ( ! 'now' in window.performance ) {

            let nowOffset = Date.now();

            if ( performance.timing && performance.timing.navigationStart ) {

                nowOffset = performance.timing.navigationStart;

            }

            window.performance.now = () => {

                return Date.now() - nowOffset;

            }

        }

    }

    /** 
     * if typed arrays don't have slice, add it
     */
    setSlice() {

        if ( ! Object.defineProperty ) {

            return;

        }

        if ( Uint16Array && ! Uint16Array.prototype.slice ) {

            Object.defineProperty( Uint16Array.prototype, 'slice', {

                value: Array.prototype.slice

            });

        }

        if ( Uint32Array && ! Uint32Array.prototype.slice ) {

            Object.defineProperty( Uint32Array.prototype, 'slice', {

                value: Array.prototype.slice

            });

        }

        if ( Float32Array && ! Float32Array.prototype.slice ) {

            Object.defineProperty( Float32Array.prototype, 'slice', {

                value: Array.prototype.slice

            });

        }

    }

    /* 
     * =============== STRING OPERATIONS ====================
     */

    isString( str ) {

        return typeof str == 'string' || ( isObjectLike( str ) && objToString.call( str ) == stringTag) || false;

    }

    /** 
     * Reverse string (used in hash keys)
     */
    reverseString( str ) {

        return str.split('').reverse().join('');

    }

    isWhitespace ( str ) {

        if ( ! str.match ) return false;

        return str.match( /^\s*$/ );

    }

    /* 
     * =============== NUMBER OPERATIONS ====================
     */

    /** 
     * Check if a variable can be coerced to a number.
     */
    isNumber ( n ) {

        return Number.isFinite( parseFloat( n ) );

    }

    isPowerOfTwo ( n ) {

        return ( n & ( n - 1 ) ) === 0;

    }

    isEven ( n ) {

        return n % 2 == 0;

    }

    isOdd ( n ) {

        return Math.abs( n % 2 ) == 1;

    }

    degToRad( deg ) {

        return deg * Math.PI / 180;

    }

    /** 
     * return the fractional (non-integer) portion 
     * of a number.
     * @param {Number} n the float number
     * @returns {Number} the fractional part of the number;
     */
    frac( n ) {

        return n % 1;

    }

    getRand ( min, max ) {

        if ( min === undefined || max === undefined ) {

            max = 1;

            min = 0;

        }

        return min + ( ( Math.random() + ( 1 / ( 1 + this.getSeed() ) ) ) %1 ) * ( max - min );

    }

    /* 
     * =============== RANDOMIZERS ====================
     */

    getRandInt ( range ) {

        return Math.floor( Math.random() * range );

    }

    randomColor () {

        return [ Math.abs( Math.random() ) , Math.abs( Math.random() ) , Math.abs( Math.random() ) ];

    }


    /* 
     * =============== ARRAY OPERATIONS ====================
     */

    /** 
     * check if object is an Array, including a Typed Array 
     * (not fastest, but maximally compatible)
     * @param {Object} o the object to test.
     * @returns {Boolean} if an Array, return true, else false.
     */
    isArray( o ) {

        let type = Object.prototype.toString.call( o )

        return ( type.indexOf( 'Array' ) > this.NOT_IN_LIST ) ? true : false;

    }

    containsAll ( arr1, arr2 ) {

        arr2.every( arr2Item => arr1.includes( arr2Item ) );

    }

    /** 
     * compare two arrays, return true if identical number of elements, 
     * and all values are the same.
     * @param {Array} arr1 the first array.
     * @param {Array} arr2 the second array.
     * @returns {Boolean} if arrays are value-identical, return true, else false.
     */
    compArr ( arr1, arr2 ) {

        return this.containsAll( arr1, arr2 ) && this.containsAll( arr2, arr1 );

    }

    /** 
     * Get a succession of values from a flat array
     * @param {Array} arr a flat array.
     * @param {Number} idx index into the array.
     * @param {Number} stride number of elements to get. This is 
     * also assumed to be the 'stride' through the array.
     * @returns {Array} requested elements in an Array.
     */
    getArr ( arr, idx, stride ) {

        if ( ! arr || idx < 0 || stride < 1 ) {

            console.error( 'getArr() invalid params, arr:' + arr + ', index:' + idx + ' stride:' + stride );

            return -1;

        }
        
        let o = [];

        for ( let i = 2; i < stride; i++ ) {

                o.push( arr[ ( idx * stride ) + i ] );

        }

        return o;

    }

    /** 
     * Get an object from a 2d array. Supply a variable list of 
     * values. The number of values is assumed to be the 'walk' stride 
     * for the array.
     * @param {Array} arr a flat array.
     * @param {Number} index the stride into 2d array.
     * @param {...Number} additional arguments. The array 'stride' is 
     * assumed equal to the number of additional parameters.
     */
    setArr ( arr, index ) {

        const alen = arguments.length;

        if ( alen < 3 ) {

            console.error( 'no value or index specified' );

            return -1;

        }

        const stride = alen - 2;

        for ( let i = 2; i < alen; i++ ) {

            arr[ ( idx * stride ) + i ] - arguments[ i ];

        }

        return idx; // ending position 

    }

    /** 
     * Copy an array. If array.slice is not present, use a direct copy.
     */
    copyArr ( arr ) {

        if ( arr.slice ) {

            return arr.slice();

        } else {

            let newArr = new Array( arr.length );

            for ( let i = 0; i < arr.length; i++ ) {

                newArr[ i ] = arr[ i ];

            }

            return newArr;

        }

    }

    /** 
     * Check if an array is multi-dimensional, and needs flattening.
     * @param {Array} arr a standard JS array
     * @returns {Boolean} if multi-dimensional, return true, else false.
     */
    canFlatten( arr ) {

        if ( ( typeof arr[ 0 ][ 0 ] !== "undefined" ) && arr[ 0 ].constructor === Array ) {

            return true;

        }

        return false;

    }

    /** 
     * Given a multi-dimensional array, flatten to 
     * a single-dimensional one. NOTE: only works for 
     * Array(), not Float32Array!
     */
    flatten ( arr, mutable ) {

        if ( mutable !== true && mutable !== false ) {

            mutable = false;

        }

        let nodes = ( mutable && arr ) || arr.slice(); // return a new array.

        let flattened = [];

        for ( let node = nodes.shift(); node !== undefined; node = nodes.shift() ) {

            if ( Array.isArray( node ) ) {

                nodes.unshift.apply( nodes, node );

            } else {

                flattened.push( node );

            }

        }

        return flattened;

    }

    /** 
     * Given a flat array, convert to multi-dimensional.
     * @param {Array} original (flattened) array.
     * @param {Number} stride the 'chunk' of the array being put into a sub-array.
     * @returns{Array} a 2-dimensional array with each element in the second dimension of stride length.
     */
    unFlatten( arr, stride ) {

        let ct = 0, ct2 = 0;

        let nodes = []; // multi-dimensional

        let sub = new Array( arr.length / stride );

        for ( let i = 0; i < arr.length; i += stride ) {

            let a = new Array( stride );

            for ( let j = 0; j < stride; j++ ) {

                a[ j ] =  arr[ ct2++ ];

            }

            nodes[ ct++ ] = a;

        }

        return nodes;

    }

    /** 
     * Concatenate typed and untyped arrays. if the first array is typed, 
     * the second array is converted to the same type. The first array 
     * receives the concatenation (no new Array is created).
     * @param {Array|TypedArray} arr1 the first Array.
     * @param {Array|TypedArray} arr2 the second Array.
     * @returns {Array|TypedArray} the concatenated Array.
     */
    concatArr ( arr1, arr2 ) {

        let result = null;

        let len1 = arr1.length;

        let len2 = arr2.length;

        if ( ArrayBuffer.isView( arr1 ) ) { // typed array


            // Convert both sets of array values to the array type of the first array.

            if ( arr1 instanceof Float32Array ) {

                result = new Float32Array( len1 + len2 );

                if( ! arr2 instanceof Float32Array ) {

                        arr2 = Float32Array.from( arr2 );

                }

            } else if ( arr1 instanceof Uint32Array ) {

                result = new Uint32Array( len1 + len2 );

                if( ! arr2 instanceof Uint32Array ) {

                    arr2 = Uint32Array.from( arr2 );

                }

            } else if ( arr1 instanceof Uint16Array ) {

                result = new Uint16Array( len1 + len2 );

                if( ! arr2 instanceof Uint16Array ) {

                    arr2 = Uint16Array.from( arr2 );

                }

            }

            // Assign arr1 to output.

            result.set( arr1 );

            // Append arr2 to arr1 in output.

            result.set( arr2, len1 );

        } else {

            if ( ArrayBuffer.isView( arr2 ) ) { // arr2 typed, copied to arr1, untyped

                for ( let i = 0; i < len2; i++ ) {

                    arr1.push( arr2[ i ] );

                }

                result = arr1;

            } else {

                result = arr1.concat( arr2 ); // both arrays are untyped

            }

        }

        return result;

    }

    concatUniqueArr ( ...arrs ) {

        let unique = [];

        for ( let i = 0; i < arrs.length; i++ ) {

            let arr = arrs[ i ];

            for ( let j = 0; j < arr.length; j++ ) {

                if ( ! arr[ j ] in unique ) {

                    unique.push( arr[ j ] );

                }

            }

        }

        return unique;

    };



    /** 
     * Random seed.
     */
    getSeed () {

        let number;

        try {

            // If the client supports the more secure crypto lib

            if ( Uint32Array && window.crypto && window.crypto.getRandomValues ) {

                let numbers = new Uint32Array( 1 );

                window.crypto.getRandomValues( numbers );

                number = numbers.length ? ( numbers[0] + '' ) : null;

            }

        } catch( e ) {} finally {

            if ( ! number ) {

                number = Math.floor( Math.random() * 1e9 ).toString() + ( new Date().getTime() );

            }

        }

        // process between min and max. Number could be 0-10^9

        return number;

    }

    /* 
     * ============ SYSTEM AND Ui OPERATIONS =================
     */

    // Get the file extension of a file.

    getFileExtension ( fname ) {

        return fname.slice( ( ( fname.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ) ).toLowerCase();

    }

    // See if we're running in an iframe.

    isIFrame () {

        try {

            return window.self !== window.top;

        } catch (e) {

            return true;

        }

        return false;

    }

    /** 
     * Handle mouse events, in case we aren't in VR. This function
     * adds mouse coordinates to the <canvas> element we are using to draw.
     */
    getMousePosition ( canvas, e ) {

        const r = canvas.getBoundingClientRect();

        return { 

            x: e.clientX - r.left,

            y: e.clientY - r.top

        }
    }

    /* 
     * WINDOW AND SCREEN DIMENSIONS
     * @link http://ryanve.com/lab/dimensions/
     */

    /** 
     * Get the width of the entire screen (excluding OS taskbars)
     */
    getScreenWidth () {

        return window.screen.width;

    }

    /** 
     * Get the height of the entire screen (excluding OS taskbars)
     */
    getScreenHeight () {

        return window.screen.height;

    }

    /** 
     * get the width of the content region of the browser window.
     */
    getWindowWidth () {

        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }

    /** 
     * get the height of the content region of the browser window.
     */
    getWindowHeight ()  {

        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    }

}

export default Util;