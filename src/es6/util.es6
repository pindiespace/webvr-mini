'use strict'

import Emitter from  './emitter';

class Util {

    /** 
     * Utility functions.
     */

    constructor ( emitter ) {

        console.log( 'in Util' );

        // Shared constants

        this.NOT_IN_LIST = -1, // for .indexOf() checks

        this.DEFAULT_KEY = 'default',

        this.POSITIVE = 1,

        this.NEGATIVE = -1,

        // Create an Emitter object for pseudo-events.

        this.emitter = new Emitter(),

        // String polyfills.

        this.setTrim(),

        // Performance polyfill.

        this.setPerformance(),

        // Finite number polyfill.

        this.setFinite(),

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
     * ---------------------------------------
     * STRING OPERATIONS
     * ---------------------------------------
     */

    /**
     * Check if object is a string.
     * @param {String} str the string.
     * @returns {Boolean} return true/false.
     */
    isString( str ) {

        return Object.prototype.toString.call(str) === '[object String]';

    }

    /** 
     * Check if string is only invisible characters, or is an empty string ''.
     * @param {String} str the string.
     * @returns {Boolean} true/false.
     */
    isWhitespace ( str ) {

        return ( ! /[^\s]/.test( str ) );

    }

    /** 
     * Check if a string looks like a URL.
     * @param {String} str the test string
     */
    isURL ( str ) {

        return ( /^[\w+:\/\/]/.exec( str ) != null );

    }


    /** 
     * Reverse string (used in hash keys).
     * @param {String} str the string.
     * @returns {String} the reversed string.
     */
    reverseString( str ) {

        if ( ! str.split ) return null;

        return str.split('').reverse().join('');

    }

    /** 
     * Get an unique object id.
     * @link https://jsfiddle.net/briguy37/2MVFd/
     * @returns {String} a unique UUID format id.
     */
    computeId () {

        let d = new Date().getTime();

        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {

            let r = (d + Math.random() * 16 ) % 16 | 0;

            d = Math.floor( d / 16 );

            return ( c == 'x' ? r : ( r&0x3|0x8 ) ).toString( 16 );

        } );

        return uuid;

    }

    /*
     * ---------------------------------------
     * NUMBER OPERATIONS
     * ---------------------------------------
     */

    /** 
     * Check if a variable can be coerced to a number.
     * @param {Number} n the variable to be tested.
     * @returns {Boolean} if Number, return true, else false.
     */
    isNumber ( n ) {

        return Number.isFinite( parseFloat( n ) );

    }

    /** 
     * Check if a number is a power of two.
     * @param {Number} n the variable to be tested.
     * @returns {Boolean} if a power of 2, return true, else false.
     */
    isPowerOfTwo ( n ) {

        return ( n & ( n - 1 ) ) === 0;

    }

    /** 
     * Check if a number is even.
     * @param {Number} n the variable to be tested.
     * @returns {Boolean} if even, return true, else false.
     */
    isEven ( n ) {

        return n % 2 == 0;

    }

    /** 
     * Check if a number is odd.
     * @param {Number} n the variable to be tested.
     * @returns {Boolean} if odd, return true, else false.
     */
    isOdd ( n ) {

        return Math.abs( n % 2 ) == 1;

    }

    /** 
     * Return radians for degrees.
     * @param {Number} n the number, in degrees (0-360).
     * @returns {Nu,ber} return the same number, in radians (0-2PI).
     */
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

    /** 
     * Basic easing in operations.
     * @link https://gist.github.com/gre/1650294
     * @link https://github.com/gre/bezier-easing
     * @param {Number} a a number between 0-1
     * @param {Number} type the type of easing.
     */
    easeIn ( a, type ) {

        let t = a;

        switch( type ) {

            case 0: return t * t; // ease-in quad

            case 1: return Math.pow( t, 3 ); // ease-in cubic

            case 2: return t * t * t * t * t; // ease-in quint

            case 3: return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * ( --t ) * t * t * t; // in-out quart

            case 4: return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * ( --t ) * t * t * t * t ; // in-out quint

        }

        return a;

    }

    /** 
     * Basic easing out operations.
     * @link https://gist.github.com/gre/1650294
     * @link https://github.com/gre/bezier-easing
     * @param {Number} a a number between 0-1
     * @param {Number} type the type of easing.
     */
    easeOut ( a, type ) {

        let t = a;

        switch( type ) {

            case 0: return t * ( 2 - t ); // ease-out quad

            case 1: return 1 - Math.pow( 1 - t, 3 ); // ease-out cubic

            case 2: return 1 + (--t ) * t * t * t * t; // ease-out quint

            case 3: return 1 + (--t ) * ( t < 0.5 ? 8  * t * t * t * t : 1 - 8 * ( --t ) * t * t * t ); // in-out quart

            case 4: return 1 + (--t ) * ( t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * ( --t ) * t * t * t * t ); // out-in quint

        }

        return a;

    }

    /*
     * ---------------------------------------
     * RANDOMIZERS
     * ---------------------------------------
     */

    getRandInt ( range ) {

        return Math.floor( Math.random() * range );

    }

    randomColor () {

        return [ Math.abs( Math.random() ) , Math.abs( Math.random() ) , Math.abs( Math.random() ) ];

    }

    /* 
     * ---------------------------------------
     * ASSOCIATIVE ARRAY (OBJECT) OPTIONS
     * ---------------------------------------
     */

    isObject ( obj ) {

        return obj === Object( obj );

    }

    /** 
     * Number of keys in an associative array or object.
     * NOTE: won't work on old browsers, but we should never get here.
     * @param {Object} obj a JS Object.
     * @returns {Number} the number of keys.
     */
    numKeys ( obj ) {

        if ( this.isObject( obj ) ) {

            return Object.keys( obj ).length;

        }

        return this.NOT_IN_LIST;

    }

    /*
     * ---------------------------------------
     * ARRAY OPERATIONS
     * ---------------------------------------
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

    /** 
     * check if two arrays contain exactly the same items.
     * @param {Array} arr1 the first array.
     * @param {Array} arr2 the second Array.
     * @returns {Boolean} if same items, return true, else false.
     */
    containsAll ( arr1, arr2 ) {

        return arr2.every( arr2Item => arr1.includes( arr2Item ) );

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
     * Get a succession of values from a flat array, similar to Array.substring().
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

            console.error( 'setArr() no value or index specified' );

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

    /**
     * Concat multiple arrays, adding only unique elements.
     * @param {...Array} argument list of arrays
     * @returns {Array} the unique composite of inputed Arrays.
     */
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
     * Fastest Array swap method for JS.
     * @link https://jsperf.com/js-list-swap/2
     * @param {Array} arr the array with elements to swap
     * @param {Number|String} p1 the first position.
     * @param {Number|String} p2 the second position.
     */
    swap( arr, p1, p2 ) {

        let t = arr[ p1 ];

        arr[ p1 ] = x[ p2 ];

        arr[ p1 ] = t;

        return arr;

    }

    /** 
     * Some objects NULL their arrays to remove elements, rather than deleting elements. This method
     * provides housekeeping to remove those nulls.
     * @param {Array} arr the Array to remove null values from.
     */
    clearFalsy ( arr ) { // clear null positions when Prims are removed from a rendering list

        return arr.filter( ( elem ) => { return elem; } );

    }


    /* 
     * ---------------------------------------
     * RANDOM NUMBERS
     * ---------------------------------------
     */

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
     * ---------------------------------------
     * Objects
     * ---------------------------------------
     */

    /** 
     * Remove a member from a JS object, ensuring that 
     * values returned are consistent with deletion.
     * @param {String} key the key identifying the object
     */ 
    removeObjMember ( obj, key ) {

        if ( ! obj.hasOwnProperty( key ) ) {

            return;

        }
        if ( isNaN( parseInt( key ) ) || ! ( this instanceof Array ) ) {

            delete obj[ key ];

        }
        else {

            obj.splice( key, 1 );

        }

    }

    /*
     * ---------------------------------------
     * OS AND UI OPERATIONS
     * ---------------------------------------
     */

    /** 
     * Get the path only of a file name.
     */
    getFilePath ( fname ) {

        if ( fname ) {

            return fname.substring( 0, fname.lastIndexOf( '/' ) ) + '/';

        }

        return null;

    }

    /** 
     * Get the file name, without path or extension.
     */
    getBaseName ( fname ) {

        if ( fname ) {

            return fname.replace( /^(.*[/\\])?/, '' ).replace( /(\.[^.]*)$/, '' );

        }

        return null;

    }

    // Get the file extension of a file.

    getFileExtension ( fname ) {

        if ( fname ) {

            return fname.slice( ( ( fname.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ) ).toLowerCase();

        }

        return null;

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
     * ---------------------------------------
     * WINDOW AND SCREEN DIMENSIONS
     * ---------------------------------------
     */

    /** 
     * Get the width of the entire screen (excluding OS taskbars)
     * @link http://ryanve.com/lab/dimensions/
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