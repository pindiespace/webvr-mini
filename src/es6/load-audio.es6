import LoadPool from  './load-pool';

export default class LoadAudio extends LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadAudio class' );

        super( init, util, glMatrix, webgl );

    }

    init () {

    }


}