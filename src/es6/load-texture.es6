import LoadPool from  './load-pool';

export default class LoadTexture extends LoadPool {

    /**
     * Texture loader, using a texture pool.
  	 * @link http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadTexture class' );

        // Add our configs.

        super( init, util, glMatrix, webgl );

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

        let gl = this.webgl.getContext();

        gl.bindTexture( gl.TEXTURE_2D, loadObj.texture );

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loadObj.image );

        // Delete the image.

        loadObj.image.source = null;

        loadObj.busy = false;  

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
    createLoadObj ( waitObj ) {

        let loadObj = {};

        loadObj.image = new Image();

        loadObj.image.crossOrigin = 'anonymous';

        loadObj.callback = waitObj.callback;

        loadObj.busy = true;

        // https://www.nczonline.net/blog/2013/09/10/understanding-ecmascript-6-arrow-functions/

        //loadObj.image.addEventListener( 'load', ( e ) => this.createTexture( loadObj, waitObj.callback ) );

        loadObj.image.addEventListener( 'load', ( e ) => console.log("SDSLFSHSFSDFSDFFSDSFDFSFSD"), false );

        loadObj.image.addEventListener( 'error', ( e) => console.log("EERRRRRORORRORORORO"), false );

        loadObj.src = waitObj.source; // start the loading

        this.cacheCt++;

        return loadObj;

    }


    /** 
     * update the cache status.
     */
    update () {

        let i = 0;

        // start with the oldest object in the waitCache.

        let len = this.textureImageCache.length;

        if ( this.waitCache.length > 0 ) {

            // scan the cache for open spots.

            let waitObj = this.waitCache[ 0 ];

            while ( i < len ) {

                let loadObj = this.textureImageCache[ i ];

                if ( ! loadObj ) {

                    // Nothing at this position yet, create complete object.


                    loadObj = this.createLoadObj( this.waitCache.shift() );

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

            while ( i < len ) {

                let loadObj = this.textureImageCache[ i ];

                if ( loadObj && loadObj.busy === false ) {

                    // removeEventListener

                    loadObj.image.removeEventListener( 'load', () => this.createTexture );

                    // erase the loadObj

                        loadObj = null;

                        this.cacheCt++;

                }

                i++;

            } // end of while.

        }

        // otherwise, wait until another loading object calls update() again.

    }

    /** 
     * load images into the waiting cache. This can happen very quickly. 
     * images are queue for loading, with callback for each load, and 
     * final callback. We use custom code hear instead of a Promise for 
     * brevity and flexibility.
     * @param {String} source the path to the image file
     * @param {Function} callback each time an image is loaded.
     * @param {Function} finalCallback the callback executed when all objects are loaded.
     */
    load ( source, callback, finalCallback ) {

        if ( callback ) {

            this.callback = callback; 

        } 

        this.waitCache[ this.loadCt++ ] = this.createWaitObj( source, callback );

        // TODO: start the loading in the regular queue

        if ( this.cacheCt < this.MAX_CACHE_IMAGES ) {

            this.update();

        }

    }

}