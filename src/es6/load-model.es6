import LoadPool from  './load-pool';

export default class LoadModel extends LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadModel class' );

        super( init, util, glMatrix, webgl );

    }

    init () {

    }


}