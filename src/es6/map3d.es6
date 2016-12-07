import Mapd from  './mapd';

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

            CLOUD: 'initPlane',

            SPHERE: 'initRandom'
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
    checkParams ( w, h, d, roughness, flatten ) {

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
     * Generate a Map using completely random numbers clamped. 
     * to a range.
     */
    initRandom ( w, h, d, numPoints ) {

        if( this.checkParams( w, d, roughness, 0 ) ) {

            this.type = this.CLOUD;

            this.map = new Float32Array( numPoints );

            this.mapColors = new Float32Array ( numPoints );

            this.width = w;

            this.height = h;

            this.depth = d;

            let util = this.util;

            for ( let i = 0, len = this.map.length; i < len; i++ ) {

                this.map.push( 
                    util.getRand() * w, 
                    util.getRand() * h,
                    util.getRand() * d
                );

                this.mapColors.push(
                    util.getRand( 0, 255 ),
                    util.getRand( 0, 255 ),
                    util.getRand( 0, 255 ),
                    1.0
                );

            }

        } else {

            console.error( 'error creating Map3d using ' + this.type.RANDOM );

        }

    }

    /** 
     * Set points on the surface of a sphere.
     */
    initSphere( w, h, d, numPoints ) {


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