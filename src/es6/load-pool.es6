export default class LoadPool {

    /**
     * Base loader class.
     */

    constructor ( config ) {

    	if ( config.webgl ) {

    		this.gl = config.webgl.getContext();

    	}

    }

    init () {

    }


}