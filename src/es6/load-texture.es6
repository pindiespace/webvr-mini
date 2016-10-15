import LoadPool from  './load-pool';

export default class LoadTexture extends LoadPool {

    /**
     * Texture loader, using a texture pool.
  	 * @link http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadTexture class' );

        // Init superclass.

        let MAX_CACHE_IMAGES = 3;

        super( init, util, glMatrix, webgl, MAX_CACHE_IMAGES );

        // Specific to texture cache.

        this.MAX_TIMEOUT = 10;

        this.blackPixel = new Uint8Array( [ 0.5, 0.5, 0.5, 1.0 ] );

        if( init ) {

            // Do something specific to the sublclass.

        }

    }

    init () {

    }

    /** 
     * Create a load object wrapper, and start a load.
     * POLYMORPHIC FOR LOAD MEDIA TYPE.
     * @param {Object} waitObj the unresolved wait object holding load directions for the asset.
     */
    createLoadObj ( waitObj ) {

        let gl = this.webgl.getContext();

        let loadObj = {};

        loadObj.image = new Image();

        loadObj.image.crossOrigin = 'anonymous';

        loadObj.callback = waitObj.callback;

        loadObj.prim = waitObj.attach; ///////////////////////////

        loadObj.busy = true;

        // https://www.nczonline.net/blog/2013/09/10/understanding-ecmascript-6-arrow-functions/

        loadObj.image.addEventListener( 'load', ( e ) => this.uploadTexture( loadObj, loadObj.callback ) );

        loadObj.image.addEventListener( 'error', ( e) => console.log( 'error loading image:' + waitObj.source ), false );

        // Start the loading.

        loadObj.image.src = waitObj.source;

        this.cacheCt++;

        return loadObj;

    }

    /** 
     * Create a WebGL texture and upload to GPU.
     * Note: problems with firefox data, see:
     * http://stackoverflow.com/questions/39251254/avoid-cpu-side-conversion-with-teximage2d-in-firefox
     * @param {Object} loadObj the loader object containing Image data.
     * @param {Function} callback callback function for individual texture load.
     */
    uploadTexture ( loadObj, callback ) {

        console.log( 'in uploadTexture() for src:' + loadObj.image.src );

        let gl = this.webgl.getContext();

        loadObj.prim.texture = gl.createTexture();

        console.log("SDFKSJFLSKFJSDLOADOBJ.PRIM.TEXTURE isSSSS:" + loadObj.prim.texture)

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        gl.bindTexture( gl.TEXTURE_2D, loadObj.prim.texture );

        if ( loadObj.image ) {

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loadObj.image );

        } else {

            console.error( 'no loadObj.image for:' + loadObj.image.src + ', default pixel texture' );

            gl.textImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.blackPixel );

        }

        if (this.util.isPowerOfTwo(loadObj.image.width) && this.util.isPowerOfTwo(loadObj.image.height)) {

          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

          gl.generateMipmap(gl.TEXTURE_2D);

        } else {

          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        }

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindTexture( gl.TEXTURE_2D, null );

        // Clear the object for re-use.

        loadObj.busy = false;

        console.log("NNNNNOOOOOWWWWWW.PRIM.TEXTURE isSSSS:" + loadObj.prim.texture)

        // Send this to update for re-use .

        this.update( loadObj );

    }

    // load() and update() are defined in superclass.

}