import LoadPool from  './load-pool';

class LoadModel extends LoadPool {

    /**
     * Model .obj file format loader.
     * @param {Boolean} init if true, run immediately.
     * @param {Util} util local reference to utility functions object.
     * @param {glMatrix} glMatrix reference to glMatrix library.
     * @param {WebGL} webgl reference to webgl object.
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadModel class' );

        super( init, util, glMatrix, webgl );

    }

    /** 
     * Extract 3d vertex data (vertices, normals) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     */
    computeObj3d ( data, arr ) {

        let vs = data.match( /^(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)/ );

        /////////console.log('>>>>>>>>>>>>>V IS:' + vs)

        arr.push( vs[ 1 ], vs[ 3 ], vs[ 5 ] );

    }

    /** 
     * Extract 2 vertex data (texture coordinates) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     */
    computeObj2d ( data, arr ) {

        let uvs = data.match(/^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/);
        
        arr.push( parseFloat( uvs[ 1 ] ), parseFloat( uvs[ 3 ] ) );

    }

    /** 
     * Extract index data from a string. At present, indexing of vertices, 
     * texture coordinates, normals is assumed to be the same, so only one 
     * index array is constructed.
     * @param {String} data string to be parsed for indices (integer).
     * @param {Array} indexArr array for indices into vertex array.
     * @param {Array} vtxArr array for vertices (optional).
     * @param {Array} texCoordArr array for texture coordinates (optional).
     */
    computeObjIndices ( data, indices, texCoords = [], normals = [] ) {

        let parts = data.match( /[^\s]+/g );

        let face = parts.map( ( fs ) => {

            let indices = fs.split( '/' ); // could be 10/20/20 10/10/10 20/20/10
                    
            let idx = parseInt( indices[ 0 ],  10 );

            let normal, texCoord;

            if ( indices.length > 1) {

                if ( indices[ 1 ].length > 0 ) {

                    texCoord = parseInt( indices[ 1 ], 10 );

                }
            }
                    
            if ( indices.length > 2 ) {

                normal = parseInt( indices[ 2 ], 10 );

            }

            // TODO: can we use with most obj files?
            // TODO: what if texture coords don't match order of vertices (convert???)
            // https://github.com/AndrewRayCode/three-collada-loader
            // TODO: write adapter for THREE Collada loader.
            // TODO: write adapter for glTF loader
            // https://github.com/KhronosGroup/glTF
            // https://github.com/mrdoob/three.js/blob/dev/examples/js/loaders/GLTFLoader.js
            // https://github.com/AnalyticalGraphicsInc/obj2gltf

            indices.push( idx );

            texCoords.push ( texCoord );

            normals.push( normal );

        } );

    }

    /** 
     * Parse the .obj file into flattened object data
     * @link http://paulbourke.net/dataformats/obj/
     */
    computeObjMesh ( data, prim ) {

        console.log("LOADING MODEL COMPUTEVERTICES")

        let vertices = [];

        let indices = [];

        let texCoords = [];

        let normals = [];

        let tangents = [];

        let colors = [];

        console.log("PRIM:" + prim)

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
                    this.computeObj3d( data, vertices );
                    break;

                case 'f': // face, indices
                    this.computeObjIndices( data, indices );
                    break;

                case 'vn': // normals
                    this.computeObj3d( data, normals);
                    break;

                case 'vp': // parameter vertices

                    break;

                case 'vt': // texture uvs
                    this.computeObj2d( data, texCoords );
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

                    console.error( 'loadModel::computeMesh(): unknown type ' + type.charCodeAt( 0 ) + ' in .obj file' );

                    break;

            }

        } );

        // Colors and tangents are not part of the Wavefront .obj format

        prim.geometry.addBufferData( vertices, indices, normals, texCoords );

    }

    /** 
     * Compute material properties for a model.
     */
    computeObjMaterials ( data, prim ) {

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
                this.computeObjMesh( data, loadObj.prim );
                break;

            case 'mtl':
                console.log("MTL file loaded, not parse it....")
                this.computeObjMaterials( data, loadObj.prim );
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