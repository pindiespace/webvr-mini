import LoadPool from  './load-pool';

class LoadModel extends LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadModel class' );

        super( init, util, glMatrix, webgl );

    }

    computeVertices ( data ) {

        console.log("LOADING MODEL COMPUTEVERTICES")

    }

    computeMaterials ( data ) {

        console.log("LOADING MODEL MATERIALS")

    }

    uploadModel ( loadObj, callback ) {

        let data = loadObj.data;

        let models = loadObj.prim.models;

        //window.lines = lines;

        // Parse XML to load data.

        // Adapted from https://github.com/m0ppers/babylon-objloader/blob/master/src/babylon.objloader.js

        console.log("PRIM IS:" + loadObj.prim)

        // Fire the mesh creation routine.

        console.log(">>>>>>>LOADOBJ fType:" + loadObj.fType );

        // Since we may have different file types for object loads, switch on the file extension

        switch ( loadObj.fType ) {

            case 'obj':
                console.log("OBJ file loaded, now parse it....")
                this.computeVertices( data );
                break;

            case 'mtl':
                console.log("MTL file loaded, not parse it....")
                this.computeMaterials( data );
                break;

            default:
                console.warn( 'uploadModel() unknown file type:' + loadObj.fType );
                break;

        }

        // Clear the object for re-use.

        loadObj.busy = false;

        // Send this loadObj to update for re-use .

        this.update( loadObj );

        //let vertices = [];

        //let indices = [];

        //let normals = [];

		//return {
		//	vertices: vertices,
		//	indices: indices,
		//	normals: normals
		//};

    }

    createLoadObj ( waitObj ) {

        console.log(">>>>>>>>>>>>>>>>createLoadObj Loading " + waitObj.source )

        let loadObj = {};

        loadObj.model = {};

        loadObj.model.crossOrigin = 'anonymous';

        loadObj.callback = waitObj.callback;

        loadObj.prim = waitObj.attach; ///////////////////////////

        loadObj.busy = true;

        // Callback from load-poll for next object to load.

        loadObj.next = ( source ) => {

            console.log(">>>>>>>>>>>>>MODEL NEXT SOURCE:" + source)

            loadObj.fType = this.util.getFileExtension( source );
            
            fetch( source )
                .then( response => { return response.text() } )
                .then( xmlString => { loadObj.data = xmlString; this.uploadModel( loadObj, loadObj.callback ) } )

        };

        //loadObj.image.src = waitObj.source;

        loadObj.next( waitObj.source );

		//fetch( waitObj.source )
        //	.then( response => { return response.text() } )
        //	.then( xmlString => { loadObj.xml = xmlString; this.uploadModel( loadObj, waitObj.callback ) } )
        	//.then( data => console.log( "data:" + data ) );


        // Start the loading.

        this.cacheCt++;

        return loadObj;

    }


}

export default LoadModel;