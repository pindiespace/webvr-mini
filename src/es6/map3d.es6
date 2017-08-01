import Mapd from  './mapd';

'use strict'

class Map3d extends Mapd {

    /* 
     * NOTE: using 'map.es6' causes a transpile error
     *
     * Generic map object, equivalent to a 2-dimensional array, used 
     * for heightmaps and color maps and other "maplike" data, including 
     * Image data in arrays.
     * Maps are defined in x (columns)  and z (rows) instead of 
     * x and y to match Prim definitions of heightMaps.
     * Maps can be scaled using bilinear or bicubic algorithms.
     *
     * @link https://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
     *
     */
    constructor ( util ) {

        console.log( 'in Map3d' );

        super ( util );

        //this.util = util;

        this.type = {

            CLOUD: 'initRandom',

            SPHERE: 'initRandomSphere'

        };


        this.width = 0;

        this.depth = 0;

        this.low = 0;

        this.high = 0;

        this.map = null; // actual heightmap

    }

    /** 
     * confirm our data is ok for a 3d map (pointcloud).
     */
    checkParams ( w, h, d, flatten ) {

        if ( w && h && d && ( ( w + h + d ) > 0 ) ) {

            return true;

        }

        return false;

    }


    /** 
     * Get a 3D pixel. This allows interpolation of values (colors or other 
     * meta-data ) using 3d coordinates.
     *
     * @param {Number} x the x coordinate of the pixel (column)
     * @param {Number} z the z coordinate of the pixel (row)
     * @param {Enum} edgeFlag how to handle requests off the edge of the map 
     * - WRAP: grab from other side, divide to zero).
     * - TOZERO: reduce to zero, depending on unit distance from edge.
     * @returns {Number} the Map value at the x, z position.
     */
    getPoint ( x, y, z ) {

    }

    /** 
     * Set a pixel in the Map.
     * @param {Number} x the x (column) coordinate in the Map.
     * @param {Number} z the z (row) coordinate in the Map.
     * @param {Number} val the value at a map coordinate, typically Float32
     */
    setPoint ( x, y, z, val ) {

    }

    /** 
     * Generate a 3d Map using completely random numbers clamped. 
     * to a range.
     */
    initRandom ( w, h, d, numPoints ) {

        if( this.checkParams( w, h, d, 0 ) ) {

            this.type = this.CLOUD;

            this.map = new Float32Array( numPoints * 3 );

            this.width = w;

            this.height = h;

            this.depth = d;

            let util = this.util;

            let colorPtr = 0;

            for ( let i = 0; i < this.map.length; i += 3 ) {

                this.map[ i ] = util.getRand() * w,

                this.map[ i + 1 ] = util.getRand() * h,

                this.map[ i + 2 ] = this.util.getRand() * d;

            }

        } else {

            console.error( 'error creating Map3d using ' + this.type.CLOUD );

        }

    }

    /** 
     * Return a set of random UV coordinates.
     */
    initRandomSphere( w, h, d, numPoints ) {

        let util = this.util;

        this.mapUV = new Float32Array( numPoints * 2 );

        for ( let i = 0; i < numPoints; i += 2 ) {

            // Distribute evenly over sphere.

            this.mapUV[ i ] = Math.PI * 2 * util.getRand(); // theta or u

            this.mapUV[ i + 1 ] = Math.acos( 2 * util.getRand() - 1 ); // phi or v

        }

        this.map = this.uvToCartesian( this.mapUV, w, h, d );

        //this.initRandom( w, h, d, numPoints )


    }

    /** 
     * Given a uv (latitude, longitude) array, return cartesian coordinate equivalents.
     */
    uvToCartesian ( uvPositions, w, h, d ) {

        let m = new Float32Array( 3 * uvPositions.length / 2 );

        let idx = 0;

        for ( let i = 0; i < uvPositions.length; i += 2 ) {

            let u = uvPositions[ i ];

            let v = uvPositions[ i + 1 ];

            m[ idx++ ] = Math.cos( u ) * Math.sin( v ) * w; // x

            m[ idx++ ] = Math.sin( u ) * Math.sin( v ) * h; // y

            m[ idx++ ] = Math.cos( v ) * d; // z

        }

        return m;

    }

    /** 
     * Initialize a Map3d from data. The first parameter is always 3d coordinates,
     * after that an arbitrary number of arrays may be assigned at comparable positions
     * in the map object.
     */
    initFromData( positions ) {

        // TODO: use stellar or other data.

    }


}

export default Map3d;