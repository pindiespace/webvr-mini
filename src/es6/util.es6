export default class Util {

    /** 
     * Utility functions.
     * Mersene Twister from:
     */

    constructor () {

        console.log( 'in Util' );

        // Mersene Twister parameters

    }

    // Confirm we have a string (after lodash)


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
     * a single-dimensional one.
     */
    flatten ( arr, mutable ) {
        var nodes = (mutable && arr) || arr.slice(); // return a new array.
        var flattened = [];

        for (var node = nodes.shift(); node !== undefined; node = nodes.shift()) {
            if (Array.isArray(node)) {
                nodes.unshift.apply(nodes, node);
            } else {
                flattened.push(node);
            }
        }

        return flattened;

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

    /** 
     * Check the values of a Prim.
     */
    primReadout ( prim ) {

        console.log( 'prim:' + prim.name + 'type:' + prim.type + 
            ' vertex:' + prim.geometry.vertices.itemSize + 
            ', ' + prim.geometry.vertices.numItems + 
            ', texture:' + prim.geometry.texCoords.itemSize + 
            ', ' + prim.geometry.texCoords.numItems + 
            ', index:' + prim.geometry.indices.itemSize, 
            ', ' + prim.geometry.indices.numItems + 
            ', normals:' + prim.geometry.normals.itemSize + 
            ', ' + prim.geometry.normals.numItems );

    }

}