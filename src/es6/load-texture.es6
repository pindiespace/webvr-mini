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

        this.cacheCt = 0; // cached loading

        this.loadCt = 0; // total loaded images

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

        // Delete the image.

        if ( ! loadObj.persist ) {

            loadObj.image.source = null;

            loadObj.busy = false;  

        }

        // Fire an update event to the queue.

        this.update();

    }

    createWaitObj ( source, callback, persist ) {

        return {

            source: source,

            callback: callback,

            persist: (persist || false)

        };

    }

    /** 
     * Create a load object wrapper.
     */
    createLoadObj ( persist ) {

        let loadObj = {};

        loadObj.image = new Image();

        loadObj.image.crossOrigin = 'anonymous';

        loadObj.callback = waitObj.callback;

        loadObj.busy = true;

        loadObj.image.addEventListener( 'load', () => this.createTexture( loadObj, waitObj.callback ) );

        loadObj.src = waitObj.source; // start the loading

        loadObj.presist = persist; // keep Image after texture created.

        this.cacheCt++;

        return loadObj;

    }

    /** 
     * update the cache status.
     */
    update () {

        // start with the oldest object in the waitCache.

        let len = this.textureImageCache.length;

        if ( this.waitCache.length > 0 ) {

            // scan the cache for open spots.

            let waitObj = this.waitCache[ 0 ];

            while ( i < len ) {

                let loadObj = this.textureImageCache[ i ];

                if ( ! loadObj ) {

                    // Nothing at this position yet, create complete object.

                    loadObj = createLoadObj( waitObj.persist );

                    this.waitCache.shift();

                    this.loadCt--;

                    break;

                } else if ( loadObj.busy === false ) {

                    // An object exists, but it is not in use. So just update the .src to trigger a new load.

                    loadObj.busy = true;

                    loadObj.src = waitCache.src;

                    this.waitCache.shift();

                    this.loadCt--;

                    break;

                }

                i++;

            } // end of while.

        } else {

            // Empty waitCache, for 'everything done' state.

            let delCache = [];

            while ( i < len ) {

                let loadObj = this.textureImageCache[ i ];

                if ( loadObj && loadObj.busy === false ) {

                    // removeEventListener

                    loadObj.image.removeEventListener( 'load', () => this.createTexture );

                    // erase the loadObj

                    if( loadObj.persist === false ) {

                        loadObj = null;

                        this.cacheCt++;

                    }

                }

                i++;

            } // end of while.

        }

        // otherwise, wait until another loading object calls update() again.

    }

    /** 
     * load images into the waiting cache. This can happen very quickly.
     */
    load ( gl, source, callback, finalCallback ) {

        if ( callback ) {

            this.callback = callback; 

        } 

        this.waitCache[ this.loadCt++ ] = this.createWaitObj( source, callback, persist );

        // TODO: start the loading in the regular queue

        if ( this.cacheCt < this.MAX_CACHE_IMAGES ) {

            this.update();

        }

    }

}