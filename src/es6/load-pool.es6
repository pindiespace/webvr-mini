'use strict' 

class LoadPool {

    /**
     * Base loader class. We don't use promise.all since we want to keep a 
     * limited pool of loaders, which accept a large number of waitObjs. As 
     * each loadObj completes a load, it checks the queue to see if there is 
     * another loadObj neededing a load.
     */

    constructor ( init, util, glMatrix, webgl, MAX_CACHE ) {

        console.log( 'in LoadPool class' );

        this.util = util;

        this.webgl = webgl;

        this.glMatrix = glMatrix;

        this.MAX_CACHE = MAX_CACHE; // from subclass

        this.NOT_IN_LIST = util.NOT_IN_LIST;

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

            path: this.util.getFilePath( source ),

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

        let waitCache = this.waitCache;

        let wLen = waitCache.length;

        if ( wLen < 1 ) {

            console.log( 'all assets loaded for:' + loadObj.prim.name );

            this.finalCallback( loadObj.prim );

            this.ready = true;

            return;

        }

        this.ready = false;

        // Check if there is an available loadCache

        let i = 0;

        let loadCache = this.loadCache;

        let waitObj = waitCache[ 0 ];

        /////////console.log( 'in update(), have a waitObj waiting...' + waitObj.attach.name + ' src:' + waitObj.source );

        if ( loadObj && loadObj.busy === false ) {

            //////////console.log( 're-using a loader object:' + ' loadObj:' + loadObj  );

            loadObj.prim = waitObj.attach;

            // The loadObj next() function should start loading of the next object.

            if ( ! loadObj.next ) {

                console.error( 'load-pool::update(): error .next() function not defined in loadObj, file type: .' + loadObj.fType );

            } else {

                loadObj.next( waitObj.source );

            }

            waitCache.shift();

        } else {

            for ( i; i < loadCache.length; i++ ) {

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
     * @param {String} source the path to the asset file
     * @param {Object} what to attach the loaded object to.
     * @param {Function} callback each time an asset is loaded.
     * @param {Function} finalCallback (optional) the callback executed when all objects are loaded.
     */
    load ( source, attach, callback, finalCallback ) {

        // If we need a callback or final callback, apply it here.

        /////////////console.log("SOURCE:" + source + " attach:" + attach + " callback:" + callback + " finalCallback" + finalCallback )

        if ( ! callback ) {

            callback = () => {};

        }

        if ( finalCallback ) {

            this.finalCallback = finalCallback;

        } else {

            this.finalCallback = () => { console.warn('empty final callback')};

        }

        // Push a load request onto the queue.

        this.createWaitObj( source, attach, callback );

        // Start loading, if space available.

        this.update();

    }

}

export default LoadPool;