class LoadPool {

    /**
     * Base loader class. We don't use promise.all since we want to keep a 
     * limited pool of loaders, which accept a larger number of waitObjs. As 
     * each loadObj completes a load, it checks the queue to see if there is 
     * another loadObj neededing a load.
     */

    constructor ( init, util, glMatrix, webgl, MAX_CACHE ) {

        console.log( 'in LoadPool class' );

        this.util = util;

        this.webgl = webgl;

        this.glMatrix = glMatrix;

        this.MAX_CACHE = MAX_CACHE; // from subclass

        this.loadCache = new Array( MAX_CACHE );

        this.waitCache = []; // Could be hundreds

        this.waitCt = 0; // wait cache pointer

        this.loadCt = 0; // load cache pointer

        this.ready = false;

    }

    /** 
     * Add to the queue of unresolved wait objects, an object holding
     * directions for loading the asset and callback(s).
     * @param {String} source the image path.
     * @param {Function} callback callback function ofr individual waiter.
     */
    createWaitObj ( source, attach, callback ) {

        /////////////console.log( 'creating wait object...' + source );

        this.loadCt++;

        this.waitCache.push( {

            source: source,

            attach: attach,

            callback: callback

        } );

    }

    // Create LoadObject is specific to subclass.

    // UploadXXX is specific to subclass.

    /** 
     * Update the queue.
     */
    update ( loadObj ) {

        /////////////console.log( 'in loadTexture.update()' );

        let waitCache = this.waitCache;

        let wLen = waitCache.length;

        if ( wLen < 1 ) {

            console.log( 'all assets loaded for:' + loadObj.prim.name );

            this.ready = true;

            return;

        }

        this.ready = false;

        // Check if there is an available loadCache

        let i = 0;

        let loadCache = this.loadCache;

        let lLen = loadCache.length;

        let waitObj = waitCache[0];

        /////////console.log( 'in update(), have a waitObj waiting...' + waitObj.attach.name + ' src:' + waitObj.source );

        if ( loadObj && loadObj.busy === false ) {

            //////////console.log( 're-using a loader object:' + ' loadObj:' + loadObj  );

            loadObj.prim = waitObj.attach;

            loadObj.image.src = waitObj.source;

            waitCache.shift();

        } else {

            for ( i; i < lLen; i++ ) {

                if ( ! loadCache[ i ] ) {

                    //////////console.log( 'creating a new Loader object at cache pos:' + i );

                    loadCache[ i ] = this.createLoadObj( waitObj );

                    waitCache.shift();

                    break;

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
     * @param {Function} finalCallback (optional) the callback executed when all objects are loaded.
     */
    load ( source, attach, callback, finalCallback ) {

        // Push a load request onto the queue.

        this.createWaitObj( source, attach, callback );

        // Start loading, if space available.

        this.update();

    }

}

export default LoadPool;