export default class Util {

    constructor () {

        console.log( 'in Util' );

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

    getRand ( min, max ) {

        if ( max === undefined ) {

            max = min;

            min = 0;

        }

        return min + Math.random() * ( max - min );

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

        console.log( 'PRIM name:' + prim.name + 'type:' + prim.type + 
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