export default class Map2d {

    /* 
     * NOTE: using 'map.es6' causes a transpile error
     *
     * Generic map object, equivalent to a 
     * multi-dimensional array approximation, used 
     * for heightmaps and color maps.
     * Maps are defined in x (columns)  and z (rows) instead of 
     * x and y to match Prim definitions of heightMaps.
     *
     * @link https://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
     */

    constructor () {

        console.log( 'in Map' );

        this.typeList = {

            FLOAT64: 'float64',

            FLOAT32: 'float32',

            INT32: 'int32',

            INT16: 'int16',

            INT8: 'int8',

            UINT32: 'unit32',

            UINT16: 'unit16',

            UINT8: 'uint8',

            UINT8CLAMP: 'uint8Clamp'

        };

        this.type = null;

        this.width = 0;

        this.height = 0;

        this.data = null;

        this.pixelsize = 0;

        this.ready = false;

    }

    init ( w, h, t ) {

        let type = this.typeList;

        switch ( t ) {

            case type.FLOAT64:
                this.data = new Float64Array( w * h );
                this.pixelSize = 8;
                break;

            case type.FLOAT32:
                this.data = new Float32Array( w * h );
                this.pixelSize = 4;
                break;

            case type.INT32:
                this.data = new Int32Array( w * h );
                this.pixelSize = 4;
                break;

            case type.INT16:
                this.data = new Int16Array( w * h );
                this.pixelSize = 2;
                break;

            case type.INT8:
                this.data = new Int8Array( w * h );
                this.pixelSize = 1;
                break;

            case type.UINT32:
                this.data = new Uint32Array( w * h );
                this.pixelSize = 4;
                break;

            case type.UINT16:
                this.data = new Uint16Array( w * h );
                this.pixelSize = 2;
                break;

            case type.UINT8:
                this.data = new Uint8Array( w * h );
                this.pixelSize = 1;
                break;

            case type.UINT8CLAMP:
                this.data = new Uint8ClampedArray( w * h );
                this.pixelSize = 1;
                break;

            default:
                console.error( 'map pixel type invalid:' + type );
                return;
                break;

        }

        this.type = t;

        this.ready = true;

    }

    initFromImage ( w, h, t, img ) {

        this.init( w, h, t );

        // TODO: type allocation for pixelData in image.
        // allocate image

    }

    getPixel ( x, z ) {

        if (x < 0 || x > this.max || z < 0 || z > this.max) return -1;

        return this.data[ x + this.size * z ];

    }
    
    setPixel ( x, y, val ) {

        this.data[ x + this.size * z ] = val;

    }

    /* 
     * ---------------------------------------
     * SCALING ALGORITHMS (bitmap and heightmap)
     * ---------------------------------------
     */

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
        z *= this.height;

        // Points above and below our position.

        let x1 = Math.min( x );
        let x2 = Math.max( x );
        let z1 = Math.min( z );
        let z2 = Math.max( z );

        // Interpolate along x axis, get interpolations above and below point.

        let a = this.getRaw( x1, z1 ) * (x - x1) + 
            this.getRaw( x1, z2 ) * (1 - x - x1);

        let b = this.getRaw( z1, z2 ) * (x - x1) +
            this.getRaw( x2, z2 ) * (1 - x - x1);

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

        let zf2 = zf * zf
        let xf2 = xf * xf
        let xf3 = xf * xf2

        let x00 = p03 - p02 - p00 + p01
        let x01 = p00 - p01 - x00
        let x02 = p02 - p00
        let x0 = x00*xf3 + x01*xf2 + x02*xf + p01

        let x10 = p13 - p12 - p10 + p11
        let x11 = p10 - p11 - x10
        let x12 = p12 - p10
        let x1 = x10*xf3 + x11*xf2 + x12*xf + p11

        let x20 = p23 - p22 - p20 + p21
        let x21 = p20 - p21 - x20
        let x22 = p22 - p20
        let x2 = x20*xf3 + x21*xf2 + x22*xf + p21

        let x30 = p33 - p32 - p30 + p31
        let x31 = p30 - p31 - x30
        let x32 = p32 - p30
        let x3 = x30*xf3 + x31*xf2 + x32*xf + p31

        let y0 = x3 - x2 - x0 + x1
        let y1 = x0 - x1 - y0
        let y2 = x2 - x0

        return y0*zf*zf2 + y1*zf2 + y2*zf + x1

    }

    biCubic ( x, z ) {

        let x1 = floor(x)
        let z1 = floor(z)
        let x2 = x1 + 1
        let z2 = z1 + 1

        let p00 = this.getRaw(x1 - 1, z1 - 1)
        let p01 = this.getRaw(x1 - 1, z1)
        let p02 = this.getRaw(x1 - 1, z2)
        let p03 = this.getRaw (x1 - 1, z2 + 1)

        let p10 = this.getRaw (x1, z1 - 1)
        let p11 = this.getRaw (x1, z1)
        let p12 = this.getRaw (x1, z2)
        let p13 = this.getRaw (x1, z2 + 1)

        let p20 = this.getRaw (x2, z1 - 1)
        let p21 = this.getRaw (x2, z1)
        let p22 = this.getRaw (x2, z2)
        let p23 = this.getRaw (x2, z2 + 1)

        let p30 = this.getRaw (x2 + 1, z1 - 1)
        let p31 = this.getRaw (x2 + 1, z1)
        let p32 = this.getRaw (x2 + 1, z2)
        let p33 = this.getRaw (x2 + 1, z2 + 1)

        return this.biCubicPoint(
            x - x1, 
            z - z1, 
            p00, p10, p20, p30, 
            p01, p11, p21, p31, 
            p02, p12, p22, p32, 
            p03, p13, p23, p33
        );
    }

    /* 
     * Diamond Algorithm for generating random maps.
     */


    divide( size, roughness ) {

        var x, z, half = size / 2;

        var scale = roughness * size;

        if ( half < 1 ) return;

        for ( z = half; z < self.max; z += size ) {

            for ( x = half; x < self.max; x += size ) {

              this.square( x, z, half, Math.random() * scale * 2 - scale );

            }

        }

        for ( z = 0; z <= self.max; z += half ) {

            for ( x = (z + half) % size; x <= self.max; x += size ) {

              this.diamond( x, z, half, Math.random() * scale * 2 - scale );

            }

          }

        this.divide( size / 2, roughness );

    }
    
    average( values ) {

        var valid = values.filter( function( val ) { 
            return val !== -1; 
        });

        var total = valid.reduce( function( sum, val ) { 
            return sum + val; 
        }, 0);

        return total / valid.length;

    }
    
    square( x, z, size, offset ) {

        var ave = average([
            this.getPixel(x - size, z - size),   // upper left
            this.getPixel(x + size, z - size),   // upper right
            this.getPixel(x + size, z + size),   // lower right
            this.getPixel(x - size, z + size)    // lower left
          ]);

          self.setPixel(x, z, ave + offset);

    }
    
    diamond( x, z, size, offset ) {

        var ave = average([
            getPixel(x, z - size),      // top
            getPixel(x + size, z),      // right
            getPixel(x, z + size),      // bottom
            getPixel(x - size, z)       // left
          ]);

          this.setPixel(x, z, ave + offset);

    }

    /** 
     * Given a 2d x/z space, generate fractal-like z values 
     * for the height or color.
     * @link https://github.com/hunterloftis/plazfuljs-demos/blob/gh-pages/terrain/index.html
     */
    heightMap ( max, roughness ) {

    }

    colorMap ( maxR, maxG, maxB, roughness ) {

    }

}
