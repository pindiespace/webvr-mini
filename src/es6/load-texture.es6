import LoadPool from  './load-pool';

export default class LoadTexture extends LoadPool {

    /**
     * Texture loader, using a texture pool.
  	 * @link http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html
     */

    constructor ( config ) {

        // Add our configs.

        super( config );

        // Specific to texture cache.

        this.MAX_TIMEOUT = 10;

        this.MAX_CACHE_IMAGES = 16;

        this.blackPixel = new Uint8Array( [ 0, 0, 0 ] );

        this.textureImageCache = new Array( this.MAX_CACHE_IMAGES );

        this.cachePtr = 0;

        this.waitCache = []; // Could be hundreds

        this.remainingCacheImages = this.MAX_CACHE_IMAGES;

        this.pendingTextureRequests = [];

    }

    init () {

    }

    getQueue () {

        for ( let i = 0; i < this.textureImageCache.length; i++ ) {

            let c = this.textureImageCache[ i ];

            if ( ! c ) {

                return i; // no object exists yet

            } else if ( c && c.busy === false ) {

                return c; // empty object we can reuse

            }
        }

        return -1; // have to wait

    }


    createTexture ( loadObj, callback ) {

        let gl = this.gl;

        gl.bindTexture( gl.TEXTURE_2D, loadObj.texture );

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loadObj.image );

        this.release( loadObj );

        if ( loadObj.callback ) { 

            self.callback( self.texture ); 

        }

    }

    release ( loadObj ) {

        loadObj.image.source = null;

        loadObj.busy = false;

        this.update();

    }

    createWaitObj ( source, callback, persist ) {

        return {

            source: source,

            callback: callback,

            persist: (persist || false)
        };

    }

    createLoadObj ( waitObj ) {

        let loadObj = {};

            loadObj.image = new Image();

            loadObj.image.crossOrigin = 'anonymous';

            loadObj.callback = waitObj.callback;

            loadObj.busy = true;

            loadObj.addEventListener( 'load', () => this.createTexture( loadObj, waitObj.callback ) );

            loadObj.src = waitObj.source; //start the loading

        return loadObj;

    }

    /** 
     * update the cache status.
     */
    update () {

        // start with the oldest object in the waitCache.

        if ( this.waitCache.length > 0 ) {

        // scan the cache for open spots.

        let waitObj = this.waitCache[ 0 ];

        for ( let i = 0; i < this.textureImageCache.length; i++ ) {

            let cPos = this.textureImageCache[ i ];

            if ( ! cPos ) {

                cPos = createLoadObj( waitObj );

            } else if ( cPos.busy === false ) {

                

            }

        }

        // if there's an open spot, pop the next waiting object of its queue.

        }

        // otherwise, wait until another loading object calls update() again.

    }

    load ( gl, source, callback ) {

        this.waitCache[ this.loadNum++ ] = this.createWaitObj( source, callback, persist );

        // TODO: start the loading in the regular queue

       this.update();

    }

}