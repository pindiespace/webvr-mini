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
    computeObj3d ( data, arr, lineNum ) {

        let vs = data.match( /^(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)\s*(-?\d+(\.\d+)?)/ );

        arr.push( vs[ 1 ], vs[ 3 ], vs[ 5 ] );

    }

    /** 
     * Extract 2 vertex data (texture coordinates) from a string.
     * @param {String} data string to be parsed for 3d coordinate values.
     * @param {Array} arr the array to add the coordinate values to.
     */
    computeObj2d ( data, arr, lineNum ) {

        let uvs = data.match(/^(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)$/);
        
        arr.push( parseFloat( uvs[ 1 ] ), parseFloat( uvs[ 3 ] ) );

    }

    /** 
     * Extract index data from a string. At present, indexing of vertices, 
     * texture coordinates, normals is assumed to be the same, so only one 
     * index array is constructed.
     * @param {String} data string to be parsed for indices (integer).
     * @param {Array} indices array for indices into vertex array.
     * @param {Array} lineNum array for vertices (optional).
     * @param {Array} texCoords array for texture coordinates (optional).
     * @param {Array} normals array for normals coordinates (optional).
     */
    computeObjIndices ( data, indices, lineNum, texCoords = [], normals = [] ) {

        let parts = data.match( /[^\s]+/g );

        let idxs;

        let face = parts.map( ( fs ) => {

            if ( fs.indexOf( '//') !== -1 ) {

                idxs = fs.split( '//' )

            } else if ( fs.indexOf ( '/' ) !== -1 ) {

                idxs = fs.split( '/')

            } else {

                console.error( 'illegal index object index statement at line:' + lineNum );

                return false;

            }

            // TODO: process // differently from /

            // TODO: remap index listings to straight-on listing

            //let idxs = fs.split( '/' ); // could be 10/20/20 10/10/10 20/20/10

            let idx = parseInt( idxs[ 0 ],  10 );

            let normal, texCoord;

            if ( indices.length > 1) {

                if ( idxs[ 1 ].length > 0 ) {

                    texCoord = parseInt( idxs[ 1 ], 10 );

                }
            }
                    
            if ( indices.length > 2 ) {

                normal = parseInt( idxs[ 2 ], 10 );

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

        console.log("PRIM:" + prim)

        // Get the lines of the file.

        let lineNum = 0;

        let lines = data.split( '\n' );

        let iTexCords = [];

        let iNormals = [];

        lines.forEach( ( line ) => {

            line = line.trim();

            let type = line.split( ' ' )[ 0 ];

            let data = line.substr( type.length ).trim();

            switch ( type ) {

                case 'o': // object name

                    if ( ! prim.name ) {

                        prim.name = data;

                    }

                    break;

                case 'g': // group name

                    if ( ! prim.group ) {

                        prim.group = data;

                    }

                    break;

                case 'v': // vertices

                    this.computeObj3d( data, vertices, lineNum );

                    break;

                case 'f': // face, indices

                    this.computeObjIndices( data, indices, lineNum, iTexCords, iNormals );

                    break;

                case 'vn': // normals

                    this.computeObj3d( data, normals, lineNum );

                    break;

                case 'vt': // texture uvs

                    this.computeObj2d( data, texCoords, lineNum );

                    break;

                case 's': // smoothing

                    break;

                case '#': // comment

                    break;

                case 'vp': // parameter vertices
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

                    console.error( 'loadModel::computeMesh(): unknown type ' + type.charCodeAt( 0 ) + ' data:' + data + ' in .obj file at line:' + lineNum );

                    break;

            }

            lineNum++;

        } );

        // Colors and tangents are not part of the Wavefront .obj format


        return {

            vertices: vertices,

            indices: indices,

            texCoords: texCoords,

            normals: normals

        }

    }

    /** 
     * Compute material properties for a model.
     * Similar to:
     * @link https://github.com/tiansijie/ObjLoader/blob/master/src/objLoader.js
     * 
     * Reference:
     * @link http://paulbourke.net/dataformats/mtl/
     */
    computeObjMaterials ( data, prim ) {

        console.log("LOADING MODEL MATERIALS")

        let lineNum = 0;

        let material = prim.material;

        let lines = data.split( '\n' );

        lines.forEach( ( line ) => {

            line = line.trim();

            let data = line.split( ' ' );

            let type = data[ 0 ];

             switch ( type ) {

                case 'newmtl': // name

                    material.name = data[ 1 ];

                    break;

                case 'Ka': // ambient

                    if ( data.length < 3 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );


                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.ambient = [ data[ 1 ], data[ 2 ], data[ 3 ] ];  

                        } else {

                            console.error( 'loadModel::computerObjMaterials(): invalid ambient data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Kd': // diffuse

                    if ( data.length < 3 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );


                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.diffuse = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid diffuse data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ks': // specular

                    if ( data.length < 3 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.specular = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid specular data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ns': // specular exponent
                    if ( data.length < 1 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.specularFactor = data[ 1 ];    

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid Specular Factor at line:' + lineNum );

                        }

                    }

                    break;

                case 'd':
                case 'Tr': // transparent

                    if ( data.length <  1 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.transparency = parseFloat( data[ 1 ] ); // single value, 0.0 - 1.0

                        } else {

                            console.error( 'loadModel::computeObjMaterials(): invalid transparency value at line:' + lineNum );

                        }

                    }

                    break;

                case 'illum':    // illumination mode

                    if ( data.length < 1 ) {

                        console.error( 'loadModel::computeObjMaterials(): error in illumination mode at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseInt( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) && data[ 1 ] > 0 && data[ 1 ] < 11 ) {

                            material.illum = data[ 1 ];

                        }

                    }

                    break;

                case 'map_Kd':   // diffuse map, an image file (e.g. file.jpg)

                    break;

                case 'map_Ks':   // specular map
                case 'map_Ka':   // ambient map
                case 'map_d':    // alpha map
                case 'bump':     // bumpmap
                case 'map_bump': // bumpmap
                case 'disp':     // displacement map

                    break;

                default:

                    break;


            }

            lineNum++;

        } );


    }

    /** 
     * Obj Wavefront file parse.
     * adapted from:
     * @link https://github.com/m0ppers/babylon-objloader/blob/master/src/babylon.objloader.js
     * @param {Object} loadObject custom loader object defined in load-pool.es6
     * @param {Function} callback the callback function.
     */
    uploadModel ( loadObj, callback ) {

        let data = loadObj.data;

        let models = loadObj.prim.models;

        console.log("PRIM IS:" + loadObj.prim)

        // Fire the mesh creation routine.

        console.log(">>>>>>>LOADOBJ fType:" + loadObj.fType );

        // Since we may have different file types for object loads, switch on the file extension

        switch ( loadObj.fType ) {

            case 'obj':
                console.log("OBJ file loaded, now parse it....")
                let d = this.computeObjMesh( data, loadObj.prim );
                loadObj.prim.geometry.createGLBuffers();
                loadObj.prim.geometry.addBufferData( d.vertices, d.indices, d.normals, d.texCoords, [] );
                break;

            case 'mtl':
                console.log("MTL file loaded, parsing....")
                this.computeObjMaterials( data, loadObj.prim );
                break;

            default:
                console.warn( 'uploadModel() unknown file type:' + loadObj.fType );
                break;

        }

        // Clear the object for re-use.

        loadObj.busy = false;

        // Send this loadObj to update for re-use in the queue object.

        this.update( loadObj );

        // NOTE: this goes to the final callback in Prim, which doesn't have to 
        // apply addBufferData.

    }

    /**
     * Create a loader object for model files.
     * @param {Object} waitObj custom object created for load-pool.es6 queue.
     */
    createLoadObj ( waitObj ) {

        console.log(">>>>>>>>>>>>>>>>createLoadObj Loading " + waitObj.source )

        let loadObj = {};

        loadObj.model = {};

        loadObj.model.crossOrigin = 'anonymous';

        loadObj.callback = waitObj.callback;

        loadObj.prim = waitObj.attach; ///////////////////////////

        loadObj.busy = true;

        // Callback from load-pool for next object to load.

        loadObj.next = ( source ) => {

            console.log(">>>>>>>>>>>>>MODEL NEXT SOURCE:" + source)

            loadObj.fType = this.util.getFileExtension( source );
            
            fetch( source )
                .then( response => { return response.text() } )
                .then( xmlString => { loadObj.data = xmlString; this.uploadModel( loadObj, loadObj.callback ) } )

        };

        // Equivalent of a 'next' method for load-pool queue.

        loadObj.next( waitObj.source );

		//fetch( waitObj.source )
        //	.then( response => { return response.text() } )
        //	.then( xmlString => { loadObj.xml = xmlString; this.uploadModel( loadObj, waitObj.callback ) } )
        //  .then( data => console.log( "data:" + data ) );


        // Start the loading.

        this.cacheCt++;

        return loadObj;

    }


}

export default LoadModel;