import LoadPool from  './load-pool';

'use strict'

class LoadVideo extends LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadVideo class' );

        super( init, util, glMatrix, webgl );

    }

    init () {

    }


}

export default LoadVideo;