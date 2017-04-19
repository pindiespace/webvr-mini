import AssetPool from './asset-pool';

'use strict'

class VideoPool extends AssetPool {

    /** 
     * @class
     * audio resources
     * @constructor
     * Create an audio pool.
     * @param {Boolean} init if true, initialize immediately.
     * @param {Util} util utility methods.
     * @param {WebGL} webgl the webgl module.
     */
    constructor ( init, util, webgl ) {

        super ( init, util, webgl );

        if ( init ) {

            // do something

        }

    }

}

export default VideoPool;