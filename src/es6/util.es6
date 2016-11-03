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