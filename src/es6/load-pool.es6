export default class LoadPool {

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

        console.log( 'creating wait object...' + source );

        this.loadCt++;

        console.log( 'waitCache length BEFORE push in createWaitObj():' + this.waitCache.length )

        this.waitCache.push( {

            source: source,

            attach: attach,

            callback: callback

        } );

        console.log( 'waitCache length AFTER push in createWaitObj():' + this.waitCache.length );

    }

    // Create LoadObject is specific to subclass.

    // UploadXXX is specific to subclass.

    /** 
     * Update the queue.
     */
    update ( loadObj ) {

        console.log( 'in loadTexture.update()' );

        let waitCache = this.waitCache;

        let wLen = waitCache.length;

        console.log( 'waitCache length in update():' + wLen );

        if ( wLen < 1 ) {

            console.log( 'all objects loaded, nothing to do...' );

            this.ready = true;

            return;

        }

        this.ready = false;

        // Check if there is an available loadCache

        let i = 0;

        let loadCache = this.loadCache;

        let lLen = loadCache.length;

        let waitObj = waitCache[0];

        console.log( 'in update(), have a waitObj waiting...' + waitObj.source );

        if ( loadObj && loadObj.busy === false ) {

            console.log( 'in update(), re-using a loader object:' + ' loadObj:' + loadObj + ' busy:' + loadObj.busy );
            console.log( 'in update(), waitObj prim for re-use:' + waitObj.attach.name );

            loadObj.prim = waitObj.attach;

            loadObj.image.src = waitObj.source;

            waitCache.shift();

        } else {

            console.log( 'in update(), no loadObj, loadCache.length:' + lLen + ', create a new one...' );

            for ( i; i < lLen; i++ ) {

                if ( ! loadCache[ i ] ) {

                    console.log( 'in update(), creating a new Loader object' );

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