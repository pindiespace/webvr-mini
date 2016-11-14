export default class Util {

    /** 
     * Utility functions.
     */

    constructor () {

        console.log( 'in Util' );

        // Performance polyfill.

        this.setPerformance();

    }

    /** 
     * Performance polyfill for timing.
     */
    setPerformance () {

        if ( 'performance' in window == false ) {

            window.performance = {};

        }

        Date.now = ( Date.now || function () {  // can't use () => here!

            return new Date().getTime();

        } );

        if ( "now" in window.performance == false ) {
    
            var nowOffset = Date.now();
    
            if ( performance.timing && performance.timing.navigationStart ) {

                nowOffset = performance.timing.navigationStart;

            }

            window.performance.now = () => {

                return Date.now() - nowOffset;

            }

        }

    }


    isString( str ) {

        return typeof str == 'string' || ( isObjectLike( str ) && objToString.call( str ) == stringTag) || false;

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

    isPowerOfTwo( n ) {

        return ( n & (n - 1) ) === 0;

    }

    degToRad( degrees ) {

        return degrees * Math.PI / 180;

    }


    /** 
     * Get a succession of values from a flat array
     * @param {Array} arr a flat array.
     * @param {Number} idx index into the array.
     * @param {Number} size number of elements to get. This is 
     * also assumed to be the 'stride' through the array.
     * @returns {Array} requested elements in an Array.
     */
    getArr ( arr, idx, size ) {

        let alen = arguments.length;

        if ( ! arr || idx < 0 || size < 1 ) {

            console.error( 'getArr() invalid params, arr:' + arr + ', index:' + idx + ' size:' + size );

            return -1;

        }
        
        let o = [];

        for ( let i = 2; i < size; i++ ) {

                o.push( arr[ ( idx * size ) + i ] );

        }

        return o;

    }

    /** 
     * Get an object from a 2d array. Supply a variable list of 
     * values. The number of values is assumed to be the 'walk' size 
     * for the array.
     * @param {Array} arr a flat array.
     * @param {Number} index the stride into 2d array.
     * @param {Number...} additional arguments. The array 'stride' is 
     * assumed equal to the number of additional parameters.
     */
    setArr ( arr, index ) {

        let alen = arguments.length;

        if ( alen < 3 ) {

            console.error( 'no value or index specified' );

            return -1;

        }

        let size = alen - 2;

        for ( let i = 2; i < alen; i++ ) {

            arr[ ( idx * size ) + i ] - arguments[i];

        }

        return idx; // ending position 

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

        var nodes = ( mutable && arr ) || arr.slice(); // return a new array.

        var flattened = [];

        for ( var node = nodes.shift(); node !== undefined; node = nodes.shift() ) {

            if ( Array.isArray( node ) ) {

                nodes.unshift.apply( nodes, node );

            } else {

                flattened.push( node );

            }

        }

        return flattened;

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

        if ( arr1.type ) { // typed array

            let firstLength = arr1.length;

            switch ( arr1.type ) {

                case 'Float32Array':
                    result = new Float32Array( firstLength + second.length );
                    if( arr2.type !== arr1.type ) {
                        arr2 = Float32Array.from( arr2 );

                    }
                    break;

                case 'Uint16Array':
                    result = new Uint16Array( firstLength + second.length );
                    if( arr2.type !== arr1.type ) {
                        arr2 = Uint16Array.from( arr2 );

                    }
                    break;

            }

            result.set( arr1 );

            result.set( arr2, firstLength );

        } else {

            if( arr2.type ) { // typed copied to untyped

                for ( let i = 0; i < arr2.length; i++ ) {

                    arr1.push( arr2[ i ] );

                }

                result = arr1;

            } else {

                result = arr1.concat( arr2 ); // both are untyped

            }

        }

        return result;

    }

    /** 
     * Random seed.
     */
    getSeed() {

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

    getRand ( min, max ) {

        if ( min === undefined || max === undefined ) {

            max = 1;

            min = 0;

        }

        return min + ( ( Math.random() + ( 1 / ( 1 + this.getSeed() ) ) ) %1 ) * ( max - min );

    }

    getRandInt ( range ) {

        return Math.floor( Math.random() * range );

    }

    getFileExtension ( fname ) {

        return fname.slice( ( ( fname.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ) ).toLowerCase();

    }

}