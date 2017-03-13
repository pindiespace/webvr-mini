import LoadPool from  './load-pool';

class LoadModel extends LoadPool {

    /**
     * Base loader class.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadModel class' );

        super( init, util, glMatrix, webgl );

    }

    compute3d ( data, arr ) {

        let vs = data.match( /^(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)/ );

        /////////console.log('>>>>>>>>>>>>>V IS:' + vs)

        arr.push( vs[ 1 ], vs[ 3 ], vs[ 5 ] );

    }

    compute2d ( data, arr ) {

        let uvs = data.match(/^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/);
        
        arr.push( parseFloat( uvs[ 1 ] ), parseFloat( uvs[ 3 ] ) );

    }

    /** 
     * Pare the .obj file
     * @link http://paulbourke.net/dataformats/obj/
     */
    computeMesh ( data ) {

        console.log("LOADING MODEL COMPUTEVERTICES")

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        // Get the lines of the file.

        let lines = data.split( '\n' );

        lines.forEach( ( line ) => {

            ///////////console.debug( line );

            line = line.trim();

            let type = line.split( ' ' )[ 0 ];

            let data = line.substr( type.length ).trim();

            //////////console.log("DATA IS:" + data)
            /////////console.log('TYPE:' + type)

            switch ( type ) {

                case 'o': // object name

                    break;

                case 'g': // group name

                    break;

                case 'v': // vertices
                    this.compute3d( data, vertices );
                    break;

                case 'f': // face, indices

                    break;

                case 'vn': // normals
                    this.compute3d( data, normals);
                    break;

                case 'vp': // parameter vertices

                    break;

                case 'vt': // texture uvs
                    this.compute2d( data, texCoords );
                    break;

                case 's': // smoothing

                    break;


                case '#': // comment
                case 'p': // point
                case 'l': // line
                case 'curv': // 2d curve
                case 'surf': //surface
                case 'parm': // parameter values
                case 'trim': // outer trimming loop
                case 'hole': // inner trimming loop
                case 'scrv': //special curve
                case 'sp': // special point
                case 'end': // end statment
                case 'con': // connectivity between free-form surfaces
                case 'g': // group name
                case 's': // smoothing group
                case 'mg': // merging group
                case 'bevel': // bevel interpolation
                case 'c_interp': // color interpolation
                case 'd_interp': // dissolve interpolation
                case 'lod': // level of detail
                case 'shadow_obj': // shadow casting
                case 'trace_obj': // ray tracing
                case 'ctech': // curve approximation
                case 'stech': // surface approximation
                case 'mtllib': // materials
                case 'usemtl':

                    console.warn( 'loadModel::computeMesh(): type ' + type + ' in .obj file not supported' );

                    break;

                default:

                    console.error( 'loadModel::computeMesh(): unknown type ' + type + ' in .obj file' );

                    break;

            }


        } );

        return {

            vertices: vertices,

            indices: indices,

            texCoords: texCoords,

            normals: normals

        };

    }

    computeMaterials ( data ) {

        console.log("LOADING MODEL MATERIALS")

    }

    uploadModel ( loadObj, callback ) {

        let data = loadObj.data;

        let models = loadObj.prim.models;

        let meshData, mtlData;

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
                meshData = this.computeMesh( data );
                break;

            case 'mtl':
                console.log("MTL file loaded, not parse it....")
                mtlData = this.computeMaterials( data );
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