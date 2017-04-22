import AssetPool from './asset-pool';

'use strict'

class FontPool extends AssetPool {

    /** 
     * @class
     * font resources
     * convert fonts to texture
     * https://github.com/framelab/fontmatic
     * @constructor
     * Create a font pool.
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

export default FontPool;