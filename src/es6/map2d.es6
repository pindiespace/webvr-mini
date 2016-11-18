

export default class Map2d {

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

        console.log( 'in Map' );

        this.util = util;

        this.type = {

            PLANE: 'initPlane',

            RANDOM: 'initRandom',

            DIAMOND: 'initDiamond',

            IMAGE: 'initImage'

        };

        this.edgeType = {

            NONE: 0,      // don't do anything

            WRAP: 1,      // wrap a out of range side to the opposite side

            TOZERO: 2     // push down to zero

        };

        this.width = 0;

        this.depth = 0;

        this.low = 0;

        this.high = 0;

        this.map = null; // actual heightmap

        this.squareSize = 0; // max square that starts at 0, 0 and fits in Map2d.

        this.max = 0;

        // offscreen canvas for heightmaps from images.

        this.canvas = this.ctx = this.imgData = null;

    }

    checkParams ( w, d, roughness, flatten ) {

        if( w < 1 || d < 1 ) {

            console.error( 'invalid map width or height, was:' + w + ', ' + d );

            return false;

        } else if ( roughness < 0 || roughness > 1.0 ) {

            console.error( 'invalid Map roughness (0-1), was:' + roughness );

            return false;

        } else if ( flatten < 0 || flatten > 1.0 ) {

            console.error( 'invalid Map flatten (0-1.0), was:' + flatten );

            return false;

        }

        return true;

    }


    /** 
     * Get a Map pixel. For the diamond algorithm, this.max is a width or 
     * height. For all others, it is the length of the entire array.
     * @param {Number} x the x coordinate of the pixel (column)
     * @param {Number} z the z coordinate of the pixel (row)
     * @param {Enum} edgeFlag how to handle requests off the edge of the map 
     * - WRAP: grab from other side, divide to zero).
     * - TOZERO: reduce to zero, depending on unit distance from edge.
     * @returns {Number} the Map value at the x, z position.
     */
    getPixel ( x, z, edgeFlag = 1 ) {

        if ( x < 0 || x > this.width || z < 0 || z > this.depth ) {

            switch ( edgeFlag ) {

                case this.edgeType.WRAP:
                    if ( x < 0 ) x = this.width - x;
                    if ( x > this.width - 1 ) x = x - this.width;
                    if ( z < 0 ) z = this.depth - z;
                    if ( z > this.depth - 1 ) z = z - this.depth;
                    break;

                case this.edgeType.TOZERO:
                    let xs = x;
                    let zs = z;
                    if ( x < 0 ) x = 0;
                    if( x > this.width - 1 ) x = this.width - 1;
                    if( z < 0 ) z = 0;
                    if( z > this.depth - 1 ) z = this.depth - 1;
                    return this.map[ x + this.squareSize * z ] / ( Math.abs( xs - x ) + Math.abs( zs - z ) );
                    break;

                default:
                    console.error( 'getPixel out of range x:' + x + ' z:' + z + ' width:' + w + ' height:' + h + ' max:' + this.max );
                    return -1;
                    break;

            }

        }

        return this.map[ x + this.width * z ];

    }

    /** 
     * Set a pixel in the Map.
     * @param {Number} x the x (column) coordinate in the Map.
     * @param {Number} z the z (row) coordinate in the Map.
     * @param {Number} val the value at a map coordinate, typically Float32
     */
    setPixel ( x, z, val ) {

        if ( x < 0 || x > this.max || z < 0 || z > this.max ) {

            console.error( 'setPixel out of range x:' + x + ' z:' + z + ' max:' + this.max );

            return -1;

        }

        if ( this.low > val ) this.low = val;

        if( this.high < val ) this.high = val;

        ///////////////////////////////////console.log("SETPIXEL: x:" + x + " z:" + z + " val:" + val + ' size:' + this.squareSize )

        this.map[ x + this.width * z ] = val; // NOTE: was squareSize!!!!!!!

    }

    /** 
     * Create a completely flat Map.
     */
    initPlane ( w, d ) {

        if ( this.checkParams ( w, d, 0, 0 ) ) {

            this.img = this.map = null;

            this.map = new Float32Array( w * d );

            this.width = w;

            this.depth = d;

            this.squareSize = Math.min( w * d ); // shortest face.

        } else {

            console.error( 'error creating Map using ' + this.type.PLANE );

        }

    }

    /** 
     * Generate a Map using completely random numbers clamped. 
     * to a range.
     */
    initRandom ( w, d, roughness ) {

        if( this.checkParams( w, d, roughness, 0 ) ) {

            this.map = new Float32Array( w * d );

            this.width = w;

            this.depth = d;

            this.squareSize = Math.min( w, d );

            this.max = this.squareSize - 1;

            let util = this.util;

            for ( let i = 0, len = this.map.length; i < len; i++ ) {

                this.map[i] = util.getRand() * roughness;

            }

        } else {

            console.error( 'error creating Map using ' + this.type.RANDOM );

        }

    }

    /** 
     * Create a blank heightmap in canvas ImageData format. If 
     * random === true, make a random heightmap.
     * https://github.com/hunterloftis/playfuljs-demos/blob/gh-pages/terrain/index.html
     * @param {Number} w the width of the heightmap (x).
     * @param {Number} h the height of the heightmap (z).
     * @param {Boolean} create if true, make a proceedural heightmap using diamond algorithm.
     * @param {Number} roughness if create === true, assign a roughness (0 - 1) to generated terrain.
     */
    initDiamond ( w, d, roughness, flatten ) {

        if( this.checkParams( w, d, roughness, flatten ) ) {

            this.img = this.map = null;

            // Get next highest power of 2 (scale back later).

            console.log('starting width:' + w + ' height:' + d + ' roughness:' + roughness );

            let n = Math.pow( 2, Math.ceil( Math.log( ( w + d ) / 2 ) / Math.log( 2 ) ) );

            console.warn( 'random map, selecting nearest power of 2 (' + n + ' x ' + n + ')' );

            // Set up for diamond algorithm.

            this.squareSize = n + 1;

            this.width = this.depth = n; // SQUARE

            this.map = new Float32Array( this.squareSize * this.squareSize );

            // For the Diamond algorithm, this.max is the length or width of the terrain.

            this.max = this.squareSize - 1;

            this.setPixel( 0, 0, this.max );

            this.setPixel( this.max, 0, this.max / 2 );

            this.setPixel( this.max, this.max, 0 );

            this.setPixel( 0, this.max, this.max / 2 );

            // Start recursive terrain generation.

            this.divide( this.max, roughness );

            // The first pixel may be too high.

            this.setPixel( 0, 0, (this.getPixel( 0, 1 ) + this.getPixel( 1, 0 ) ) / 2 );

            this.flatten( flatten / this.squareSize ); // if divisions = 100, shrink height 1/ 100;

            } else {

                console.error( 'error creating Map using ' + this.type.DIAMOND );

            }

    }

    /** 
     * Use an RGBA image to create the heightmap, after drawing into <canvas>.
     * @link https://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
     * @link http://stackoverflow.com/questions/39678642/trying-to-convert-imagedata-to-an-heightmap
     * @param {Number} w desired heightmap width (x).
     * @param {Number} d desired height (z) of heightmap.
     */
    initImage ( w, d, path, callback ) {

        if( this.checkParams( w, d, roughness, flatten ) ) {

        }

        if ( ! this.canvas ) {

            this.canvas = document.createElement( 'canvas' );

        }

        if ( ! this.ctx ) {

            this.ctx = this.canvas.getContext( '2d' );

        }

        let img = new Image();

        img.style.display = 'none';

        img.onload = () => {

            this.ctx.drawImage( img, 0, 0 );

            // Uint8ClampedArray, RGBA 32-bit for all images.
            //  let rgba = 'rgba(' + data[0] + ',' + data[1] + ',' + data[2] + ',' + (data[3] / 255) + ')';

            this.imgData = this.ctx.getImageData(0, 0, img.width, img.height );

            this.width = img.width;

            this.depth = img.height;

            this.squareSize = Math.min( w, h ); // largest square area starting with 0, 0

            this.max = this.squareSize - 1;

            // Pixel-level view.
            //this.pixels = new Uint32Array( this.data.buffer );

            this.map = new Float32Array( this.squareSize );

            let j = 0;

            let data = this.imgData;

            for ( let i = 0, len = this.data.length; i < len; i++ ) {

                this.map[j++] = data[i] + data[i + 1] + data [ i + 2 ] / 3;

            }

        }

        img.onerror = () => {

            console.error( 'image could not be loaded:' + path );
        }

        img.src = path;

        callback( this.data );

    }

    /* 
     * ---------------------------------------
     * HEIGHTMAP GENERATION ALGORITHMS
     * ---------------------------------------
     */

    /** 
     * Divide Map in Diamond algorithm.
     */
    divide( size, roughness ) {

        let x, z, half = size / 2;

        let scale = roughness * size;

        const util = this.util;

        if ( half < 1 ) return;

        for ( z = half; z < this.max; z += size ) {

            for ( x = half; x < this.max; x += size ) {

              this.square( x, z, half, util.getRand() * scale * 2 - scale );

            }

        }

        for ( z = 0; z <= this.max; z += half ) {

            for ( x = (z + half) % size; x <= this.max; x += size ) {

              this.diamond( x, z, half, util.getRand() * scale * 2 - scale );

            }

          }

        this.divide( size / 2, roughness );

    }

    /** 
     * Get average in Diamond algorithm.
     */
    average( values ) {

        let valid = values.filter( function( val ) { 

            return val !== -1; 

        });

        let total = valid.reduce( function( sum, val ) { 

            return sum + val;

        }, 0);

        return total / valid.length;

    }

    /** 
     * new square, average value. Alternates with diamond.
     */
    square( x, z, size, offset ) {

        let ave = this.average ( [
            this.getPixel( x - size, z - size ),   // upper left
            this.getPixel( x + size, z - size ),   // upper right
            this.getPixel( x + size, z + size ),   // lower right
            this.getPixel( x - size, z + size )    // lower left
        ] );

        this.setPixel( x, z, ave + offset );

    }

    /** 
     * new diamond, average value. Alternates with square.
     */
    diamond( x, z, size, offset ) {

        let ave = this.average( [
            this.getPixel( x, z - size ),      // top
            this.getPixel( x + size, z ),      // right
            this.getPixel( x, z + size ),      // bottom
            this.getPixel( x - size, z )       // left
        ] );

        this.setPixel( x, z, ave + offset );

    }

    /* 
     * ---------------------------------------
     * SCALING/SMOOTHING ALGORITHMS
     * ---------------------------------------
     */


    /** 
     * Scale heightMap y values (0.1 = 1/10 the max), 
     * passing 0 will completely flatten the map.
     */
    flatten ( scale ) {

        let val;

        if( this.map && this.map.length ) {

            let map = this.map;

            for ( let i = 0, len = map.length; i < len; i++ ) {

                map[ i ] *= scale;

                val = map[ i ];

                if( this.high < val ) this.high = val;

                if( this.low > val ) this.low = val;

            }

        }

    }

    /** 
     * roughen an existing Map.
     */
    roughen ( percent ) {

        if( this.map && this.map.length ) {

        }

    }

    /** 
     * given an existing Map, scale to new dimensions, smoothing 
     * with the biCubic or biLinear algorithm.
     */
    scale ( w, h ) {

        if ( this.checkParams( w, h, 0, 0 ) ) {

            let map = new Float32Array( w * h );

            let xScale = this.width / w;

            let zScale = this.depth / h;

            console.log('original width:' + this.width + ' new:' + w + 'original height:' + this.depth + ' new:' + h )

            console.log('xScale:' + xScale + ' zScale:' + zScale);

            for ( let z = 0; z < h; z++ ) {

                for ( let x = 0; x < w; x++ ) {

                    map[ w * z + x ] = this.biCubic( x * xScale, z * zScale);

                }

            }

        console.log('WIDTH:' + w + " HEIGHT:" + h)

        this.map = map;

        this.width = w;

        this.depth = h;

        this.squareSize = Math.min( w, h );

        this.max = this.squareSize - 1;

        }

    }

    /** 
     * Given a point defined in 2d between 
     * x and z, return an interpolation using a bilinear algorithm.
     * @param {Array} heightmap 
     * @param {Number} x = desired x position (between 0.0 and 1.0)
     * @param {Number} z = desired z position (between 0.0 and 1.0)
     */
    biLinear ( x, z ) {

        if ( x < 0 || x > 1.0 || z < 0 || z > 1.0 ) {

            console.error( 'heightmap x index out of range, x:' + x + ' z:' + z );

            return null;
        }

        // Our x and z, scaled to heightmap divisions.

        x *= this.width;
        z *= this.depth;

        // Points above and below our position.

        let x1 = Math.min( x );
        let x2 = Math.max( x );
        let z1 = Math.min( z );
        let z2 = Math.max( z );

        // Interpolate along x axis, get interpolations above and below point.

        let a = this.getPixel( x1, z1 ) * (x - x1) + 
            this.getPixel( x1, z2 ) * (1 - x - x1);

        let b = this.getPixel( z1, z2 ) * (x - x1) +
            this.getPixel( x2, z2 ) * (1 - x - x1);

        // Interpolate these results along z axis.

        let v = a * (z - z1) + b * (1 - z - z1);

        return v;

    }

    /** 
     * Given a point, and a collection of 16 neighboring points in 
     * 2d, return a smoothed value for the point using the 
     * biCubic interpolation algorithm.
     * Adapted from:
     * https://github.com/hughsk/bicubic-sample/blob/master/index.js
     * https://github.com/hughsk/bicubic/blob/master/index.js
     * @param {Number} xf 
     * @param {Number} zf
     */

    biCubicPoint ( xf, zf, 
        p00, p01, p02, p03, 
        p10, p11, p12, p13, 
        p20, p21, p22, p23, 
        p30, p31, p32, p33
    ) {

        let zf2 = zf * zf;
        let xf2 = xf * xf;
        let xf3 = xf * xf2;

        let x00 = p03 - p02 - p00 + p01;
        let x01 = p00 - p01 - x00;
        let x02 = p02 - p00;
        let x0 = x00*xf3 + x01*xf2 + x02*xf + p01;

        let x10 = p13 - p12 - p10 + p11;
        let x11 = p10 - p11 - x10;
        let x12 = p12 - p10;
        let x1 = x10*xf3 + x11*xf2 + x12*xf + p11;

        let x20 = p23 - p22 - p20 + p21;
        let x21 = p20 - p21 - x20;
        let x22 = p22 - p20;
        let x2 = x20*xf3 + x21*xf2 + x22*xf + p21;

        let x30 = p33 - p32 - p30 + p31;
        let x31 = p30 - p31 - x30;
        let x32 = p32 - p30;
        let x3 = x30*xf3 + x31*xf2 + x32*xf + p31;

        let y0 = x3 - x2 - x0 + x1;
        let y1 = x0 - x1 - y0;
        let y2 = x2 - x0;

        return y0*zf*zf2 + y1*zf2 + y2*zf + x1;

    }

    /** 
     * value interpolation
     */
    biCubic ( x, z ) {

        let x1 = Math.floor( x );
        let z1 = Math.floor( z );
        let x2 = x1 + 1;
        let z2 = z1 + 1;

        //console.log('lower pixel: for x:' + x + ' value:' + this.getPixel( x1, z1 ) + ' upper pixel for z:' + z + ' value:' + this.getPixel( x2, z2 ) );

        let p00 = this.getPixel( x1 - 1, z1 - 1);
        let p01 = this.getPixel( x1 - 1, z1 );
        let p02 = this.getPixel( x1 - 1, z2 );
        let p03 = this.getPixel( x1 - 1, z2 + 1 );

        let p10 = this.getPixel( x1, z1 - 1 );
        let p11 = this.getPixel( x1, z1 );
        let p12 = this.getPixel( x1, z2 );
        let p13 = this.getPixel( x1, z2 + 1 );

        let p20 = this.getPixel( x2, z1 - 1);
        let p21 = this.getPixel( x2, z1 );
        let p22 = this.getPixel( x2, z2 );
        let p23 = this.getPixel( x2, z2 + 1);

        let p30 = this.getPixel( x2 + 1, z1 - 1);
        let p31 = this.getPixel( x2 + 1, z1 );
        let p32 = this.getPixel( x2 + 1, z2 );
        let p33 = this.getPixel( x2 + 1, z2 + 1 );

        return this.biCubicPoint(
            x - x1, 
            z - z1, 
            p00, p10, p20, p30, 
            p01, p11, p21, p31, 
            p02, p12, p22, p32, 
            p03, p13, p23, p33
        );
    }

}
