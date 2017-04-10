import LoadPool from  './load-pool';

'use strict'

class LoadTexture extends LoadPool {

    /**
     * Texture loader, using a texture pool.
  	 * @link http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadTexture class' );

        // Init superclass.

        let MAX_CACHE_IMAGES = 3;

        super( init, util, glMatrix, webgl, MAX_CACHE_IMAGES );

        this.webgl = webgl;

        // Specific to texture cache.

        this.MAX_TIMEOUT = 10;

        this.greyPixel = new Uint8Array( [ 0.5, 0.5, 0.5, 1.0 ] );

        if( init ) {

            // Do something.

        }

    }

  /**
   * Sets a texture to a 1x1 pixel color. 
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext.
   * @param {WebGLTexture} texture the WebGLTexture to set parameters for.
   * @param {WebGLParameter} target.
   * @memberOf module: webvr-mini/LoadTexture
   */
    setDefaultTexturePixel ( gl, texture, target ) {

        // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.

        let color = this.greyPixel;

        if ( target === gl.TEXTURE_CUBE_MAP ) {

            for ( let i = 0; i < 6; ++i ) {

                gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

            }

        } else if ( target === gl.TEXTURE_3D ) {

            gl.texImage3D( target, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

        } else {

            gl.texImage2D( target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

        }

    }

    /** 
     * Create a load object wrapper, and start a load.
     * POLYMORPHIC FOR LOAD MEDIA TYPE.
     * @param {Object} waitObj the unresolved wait object holding load directions for the asset.
     * @memberOf module: webvr-mini/LoadTexture
     */
    createLoadObj ( waitObj ) {

        let loadObj = {};

        loadObj.image = new Image();

        loadObj.image.crossOrigin = 'anonymous',

        loadObj.path = waitObj.path,

        loadObj.callback = waitObj.callback,

        loadObj.prim = waitObj.attach,

        loadObj.busy = true;

        // https://www.nczonline.net/blog/2013/09/10/understanding-ecmascript-6-arrow-functions/

        loadObj.image.addEventListener( 'load', ( e ) => this.uploadTexture( loadObj, loadObj.callback ) );

        loadObj.image.addEventListener( 'error', ( e ) => console.log( 'error loading image:' + waitObj.source ), false );

        // Start the loading.

        loadObj.next = ( source ) => {

            loadObj.fType = this.util.getFileExtension( source );

            // Force generation of image.

            loadObj.image.src = source;

        };

        //loadObj.image.src = waitObj.source;

        loadObj.next( waitObj.source );

        this.cacheCt++; // TODO: NOT NEEDED?

        return loadObj;

    }

    /** 
     * Given the standard Prim texture object, bind it for drawing. 
     * gl.TEXTURE0, gl.TEXTURE1...
     */

    bindTexture ( textureObj ) {

        let gl = this.webgl.getContext();

        // Bind the texture data to the videocard, receive a WebGL texture in our textureObject.

        gl.bindTexture( gl.TEXTURE_2D, textureObj.texture );

        // Use image, or default to single-color texture if image is not present.

        if ( textureObj.image ) {

            //////////console.log( 'binding image:' + textureObj.image.src );

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureObj.image );

            // TODO: WHEN TO USE gl.renderBufferStorage()???

        } else {

            console.error( 'no loadObj.image for:' + textureObj.image.src + ', using default pixel texture' );

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.greyPixel );

        }

        // Generate mipmaps if we are a power of 2 texture.

        if ( this.util.isPowerOfTwo( textureObj.image.width ) && this.util.isPowerOfTwo( textureObj.image.height ) ) {

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );

            gl.generateMipmap( gl.TEXTURE_2D );

        } else {

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );

        }

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

        gl.bindTexture( gl.TEXTURE_2D, null );

        return textureObj;

    }

    /** 
     * Create a WebGL texture and upload to GPU.
     * Note: problems with firefox data, see:
     * http://stackoverflow.com/questions/39251254/avoid-cpu-side-conversion-with-teximage2d-in-firefox
     * @param {Object} loadObj the loader object containing Image data.
     * @param {Function} callback callback function for individual texture load.
     * @memberOf module: webvr-mini/LoadTexture
     */
    uploadTexture ( loadObj, callback ) {

        ////////////console.log( 'In uploadTexture() for:' + loadObj.prim.name + ' src:' + loadObj.image.src );

        let gl = this.webgl.getContext();

        let textures = loadObj.prim.textures;

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        // Create a textureObj that we will bind to the Prim texture array later.

        // Bind the texture in WebGL.

        let textureObj = this.bindTexture( {

            image: loadObj.image,

            src: loadObj.image.src,

            texture: gl.createTexture()

        } );

        /* 
         * We save all the texture information into the Prim, both path, 
         * image data, and WebGL texture reference.
         */

        textures.push( textureObj );

        // Clear the loadObj for re-use.

        loadObj.busy = false;

        // Send this loadObj to our .update() method so it can be re-used.

        this.update( loadObj );

    }

    /** 
     * Upload a cubemap texture.
     * @memberOf module: webvr-mini/LoadTexture
     */
    uploadCubeTexture () {

    }

    /** 
     * Upload a 3d texture.
     * @memberOf module: webvr-mini/LoadTexture
     */
    upload3DTexture () {

    }

    // load() and update() are defined in the superclass.

}

export default LoadTexture;