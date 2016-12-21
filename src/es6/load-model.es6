import LoadPool from  './load-pool';

class LoadModel extends LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadModel class' );

        super( init, util, glMatrix, webgl );

    }

    init () {

    }

    uploadModel ( loadObj, callback ) {

        let lines = loadObj


		
		return {
			vertices: vertices,
			indices: indices,
			normals: normals
		};

    }

    createLoadObj ( waitObj ) {

        let loadObj = {};

        loadObj.model = {};

        //loadObj.model.crossOrigin = 'anonymous';
        // TODO: set headers and crossorigin here

        loadObj.callback = waitObj.callback;

        loadObj.prim = waitObj.attach; ///////////////////////////

        loadObj.busy = true;

		fetch( waitObj.source )
        	.then( response => response.text() )
        	.then( xmlString => uploadModel( loadObj, waitObj.callback ) )
        	.then( data => console.log( data ) );

        // Start the loading.

        this.cacheCt++;

        return loadObj;

    }


}

export default LoadModel;