import LoadPool from  './load-pool';

export default class LoadVideo extends LoadPool {

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