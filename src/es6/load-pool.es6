export default class LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl, MAX_CACHE ) {

        console.log( 'in LoadPool class' );

        this.util = util;

        this.webgl = webgl;

        this.glMatrix = glMatrix;

        this.MAX_CACHE = MAX_CACHE; // from subclass

        this.loadCache = new Array( MAX_CACHE );

        this.waitCache = []; // Could be hundreds

        window.loadCache = this.loadCache; //////////////////////////
        window.waitCache = this.waitCache

        this.waitCt = 0; // wait cache pointer

        this.loadCt = 0; // load cache pointer

    }

    /** 
     * Add to the queue of unresolved wait objects, an object holding
     * directions for loading the asset and callback(s).
     * @param {String} source the image path.
     * @param {Function} callback callback function ofr individual waiter.
     */
    createWaitObj ( source, callback ) {

        console.log( 'creating wait object...' + source );

        this.loadCt++;

        this.waitCache.push( {

            source: source,

            callback: callback

        } );

    }

    // Create LoadObject is specific to subclass.

    // UploadXXX is specific to subclass.

    /** 
     * Update the queue.
     */
    update ( loadObj ) {

        console.log( 'in loadTexture.update()' );

        // Check if there is an available loadCache

        let i = 0;

        let loadCache = this.loadCache;

        let lLen = loadCache.length;

        let waitCache = this.waitCache;

        let wLen = waitCache.length;

        console.log('lLen:' + lLen);
        console.log('wLen:' + wLen);

        if( wLen ) {

            // we just finished a texture, and it is available for new loads.

            if ( loadObj && loadObj.busy === false ) {

                console.log( 're-using a loader object' );

                let waitObj = waitCache.shift();

                loadObj.image.src = waitObj.source;

                //loadCache[ i ] = this.createLoadObj( waitObj );



            } else {

                for ( i; i < lLen; i++ ) {

                    if ( ! loadCache[ i ] ) {

                        // grab the first waitCache

                        console.log( 'waitCache:' + waitCache )

                        let waitObj = waitCache.shift();

                        loadCache[ i ] = this.createLoadObj( waitObj );

                        break;

                    }

                }

            }

        }

    } // end of update


    /** 
     * load objects into the waiting queue. This can happen very quickly. 
     * images are queue for loading, with callback for each load, and 
     * final callback. We use custom code here instead of a Promise for 
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