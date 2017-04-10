'use strict'

import LoadPool from  './load-pool';

class LoadFont extends LoadPool {

    /** 
     * Load and configure fonts for use.
     * Working with fonts:
     * @link https://www.html5rocks.com/en/tutorials/webgl/million_letters/
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadFont class' );

        // Init superclass.

        let MAX_CACHE_FONTS = 3;

        super( init, util, glMatrix, webgl, MAX_CACHE_FONTS );

    }


}

export default LoadFont;