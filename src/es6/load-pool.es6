export default class LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadPool class' );

        this.util = util;

        this.webgl = webgl;

        this.glMatrix = glMatrix;

        if ( this.init === true ) {

            // do something 

        }

    }

    init () {

        this.gl = webgl.getContext();

    }


}