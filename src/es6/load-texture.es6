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

    /** 
     * Add to the queue of unresolved wait objects.
     */
    createWaitObj ( source, callback ) {

        this.waitCache.push( {

            source: source,

            callback: callback

        } );

    }

    /** 
     * when a wait object shifts to loading, remove it.
     */
    removeWaitObj ( waitObj ) {

        let len = this.waitCache.length;

        let i = 0;

        while ( i < len ) {

            let waitPos = this.waitCache[ i ];

            if ( waitObj === waitPos ) {

                // Delete from array

                this.waitCache.splice( i, 1 );

                break;

            }

            i++;

        }

    }

    /** 
     * Create a load object wrapper, and start a load.
     */
    createLoadObj ( waitObj ) {

        let gl = this.webgl.getContext();

        let loadObj = {};

        loadObj.image = new Image();

        loadObj.image.crossOrigin = 'anonymous';

        loadObj.callback = waitObj.callback;

        loadObj.texture = gl.createTexture();

        loadObj.busy = true;

        // https://www.nczonline.net/blog/2013/09/10/understanding-ecmascript-6-arrow-functions/

        loadObj.image.addEventListener( 'load', ( e ) => this.createTexture( loadObj, waitObj.callback ) );

        loadObj.image.addEventListener( 'error', ( e) => console.log( 'error loading image:' + waitObj.source ), false );

        // Start the loading.

        loadObj.image.src = waitObj.source;

        this.cacheCt++;

        return loadObj;

    }

    createTexture ( loadObj, callback ) {

        console.log( 'in createTexture() for src:' + loadObj.image.src );

        let gl = this.webgl.getContext();

        gl.bindTexture( gl.TEXTURE_2D, loadObj.texture );

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loadObj.image );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );

        gl.generateMipmap( gl.TEXTURE_2D );

        gl.bindTexture( gl.TEXTURE_2D, null );

        loadObj.busy = false;  

        // Find another object in the queue to load.

        this.update();

    }

    /** 
     * Update the queue.
     */
    update () {

        console.log( 'in loadTexture.update()' );

        let i = 0;

        let cLen = this.textureImageCache.length;

        let wLen = this.waitCache.length;

        if( wLen > 0 ) {

            let waitObj = this.waitCache[ 0 ];

            // Loop through the loader slots.

            while ( i < cLen ) {

                let loadPos = this.textureImageCache[ i ];

                if ( ! loadPos ) {

                    console.log( 'creating new loader object' );

                    loadPos = this.createLoadObj( waitObj );

                    this.removeWaitObj( waitObj );

                    break;

                } else if ( ! loadPos.busy ) {

                    console.log( 'reusing existing loader object' );

                    loadObj.busy = true;

                    this.removeWaitObj( waitObj );

                    loadObj.image.src = waitCache.src;

                    break;

                }

            }

        } else {

            // Nothing in the cache, remove the event listeners.

        }

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

        // Push a load request onto the queue.

        this.createWaitObj( source, callback );

        // Start loading, if space available.

        this.update();

    }

}