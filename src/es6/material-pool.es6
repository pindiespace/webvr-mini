import AssetPool from './asset-pool';

'use strict'

class MaterialPool extends AssetPool {

    constructor ( init, util, webgl, texturePool ) {

        console.log( 'in MaterialPool' );

        // Initialize superclass.

        super( util );

        this.util = util,

        this.webgl = webgl,

        this.texturePool = texturePool;

        this.materialMimeTypes = {

            'mtl': 'text/plain',

        };

        if ( init ) {

            // do something

        }

    }

    /** 
     * Compute material properties for a model.
     * Similar to:
     * @link https://github.com/tiansijie/ObjLoader/blob/master/src/objLoader.js
     * 
     * Reference:
     * @link http://paulbourke.net/dataformats/mtl/
     * 
     * @param {String} data the incoming data from the file.
     * @param {Prim} prim the Prim object defined in prim.es6
     * @param {String} path the path to the file. MTL files may reference other files in their directory.
     */
    computeObjMaterials ( data, prim, path ) {

        console.log( 'MaterialPool::computeObjMaterials(): loading model:' + path + ' for:' + prim.name );

        let lineNum = 0;

        let material = {};

        let lines = data.split( '\n' );

        lines.forEach( ( line ) => {

            line = line.trim();

            let data = line.split( ' ' );

            let type = data[ 0 ];

             switch ( type ) {

                case 'newmtl': // name of material.

                    material.name = data[ 1 ];

                    break;

                case 'Ka': // ambient

                    if ( data.length < 3 ) {

                        console.error( 'MaterialPool::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.ambient = [ data[ 1 ], data[ 2 ], data[ 3 ] ];  

                        } else {

                            console.error( 'MaterialPool::computerObjMaterials(): invalid ambient data at line:' + lineNum );

                        }

                    }

                    break;

                case 'Kd': // diffuse

                    if ( data.length < 3 ) {

                        console.error( 'MaterialPool::computeObjMaterials(): error in diffuse material array at line:' + lineNum );


                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.diffuse = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'MaterialPool::computeObjMaterials(): invalid diffuse array at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ks': // specular

                    if ( data.length < 3 ) {

                        console.error( 'MaterialPool::computeObjMaterials(): error in specular array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] ),

                        data[ 2 ] = parseFloat( data[ 2 ] ),

                        data[ 3 ] = parseFloat( data[ 3 ] );

                        if ( Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) && Number.isFinite( data[ 3 ] ) ) {

                            material.specular = [ data[ 1 ], data[ 2 ], data[ 3 ] ];

                        } else {

                            console.error( 'MaterialPool::computeObjMaterials(): invalid specular array at line:' + lineNum );

                        }

                    }

                    break;

                case 'Ns': // specular exponent

                    if ( data.length < 1 ) {

                        console.error( 'MaterialPool::computeObjMaterials(): error in specular exponent array at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.specularFactor = data[ 1 ];    

                        } else {

                            console.error( 'MaterialPool::computeObjMaterials(): invalid specular exponent array at line:' + lineNum );

                        }

                    }

                    break;

                case 'd':
                case 'Tr': // transparent

                    if ( data.length <  1 ) {

                        console.error( 'MaterialPool::computeObjMaterials(): error in transparency value at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseFloat( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) ) {

                            material.transparency = parseFloat( data[ 1 ] ); // single value, 0.0 - 1.0

                        } else {

                            console.error( 'MaterialPool::computeObjMaterials(): invalid transparency value at line:' + lineNum );

                        }

                    }

                    break;

                case 'illum':    // illumination mode

                    if ( data.length < 1 ) {

                        console.error( 'MaterialPool::computeObjMaterials(): error in illumination value at line:' + lineNum );

                    } else {

                        data[ 1 ] = parseInt( data[ 1 ] );

                        if ( Number.isFinite( data[ 1 ] ) && data[ 1 ] > 0 && data[ 1 ] < 11 ) {

                            material.illum = data[ 1 ];

                        }

                    }

                    break;

                case 'map_Kd':   // diffuse map, an image file (e.g. file.jpg)

                    /* 
                     * This loads the file, and appends to Prim texture list using the LoadTexture object.
                     * @link  "filename" is the name of a color texture file (.mpc), a color 
                     * procedural texture file (.cxc), or an image file.
                     * @link http://paulbourke.net/dataformats/mtl/
                     * 
                     * TODO: support options
                     * -blenu on | off    texture blending in horizontal direction
                     * -blenv on | off    texture blending in vertical direction
                     * -bm    mult        bump multiplier, only with 'bump'.
                     * -boost value       sharpens mipmaps (may cause texture crawling)
                     * -cc on | off       color correction, can only be used for colormaps map_Ka, map_Kd, and map_Ks
                     * -clamp on | off    texture clamped 0-1
                     * -imfchan r | g | b | m | l | z channel used to create bump texture
                     * -mm base gain      range of variation for color, base adds base value (brightens), gain increases contrast
                     * -o u v w           shifts map origin from 0, 0
                     * -t u v w           adds turbulence, so tiling is less repetitive
                     * -texres resolution scale up non-power of 2
                     */

                     console.log("MaterialPool::computeObjMaterials():::::::::::::GOTTA DIFFUSE MAP (TEXTURE) in OBJ MTL file: " + data[ 1 ] )

                    // TODO: maket this attach to prim.textures

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

        return material;

    }

    /** 
     * Add a model
     * @param {Prim} prim the requesting Prim object.
     * @param {Object} data data to construct the Prim GeoBuffer.
     * @param {String} path the file path to the object.
     * @param {Number} pos the index of the object in the calling Prim's array.
     * @param {String} mimeType the MIME type of the file.
     * @param {String} type the GeometryPool.typeList type of the object, e.g. MESH, SPHERE...
     */
    addMaterial ( prim, data, path, pos, mimeType, type ) {

        if ( pos === undefined ) {

            console.error( 'TextureObj::addTexture(): undefined pos' );

            return null;

        }

        let m;

        let fType = this.util.getFileExtension( path );

        switch ( fType ) {

            case 'mtl':

                console.log("MTL file for prim:" + prim.name + " loaded, parsing....")

                m = this.computeObjMaterials( data, prim, path );

                if ( ! m.name ) {

                    m.name = this.util.getBaseName( path );

                }

                console.log("ADDING MATERIAL ARRAY:" + m.name + " to Prim:" + prim.name )

                break;

            default:

                console.warn( 'MaterialPool::addModel(): unknown material file:' + path + ' MIME type:' + mimeType );

                break;

        }

        // Set up the Material object.

        if ( m ) {

             m.type = type,

            m.path = path,

            m.emits = this.util.emitter.events.MATERIAL_READY;

        }

        return this.addAsset( m );

    }

    /** 
     * Load models, using a list of paths. If a Model already exists, 
     * just return it. Otherwise, do the load.
     * @param {Array[String]} pathList a list of URL paths to load.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     */
    getMaterials ( prim, pathList, cacheBust = true ) {

        for ( let i = 0; i < pathList.length; i++ ) {

            let path = pathList[ i ];

            let poolMaterial = this.pathInList( path );

            if ( poolMaterial ) {

                prim.materials.push( poolMaterial ); // just reference an existing texture in this pool.

            } else {

                 // Get the image mimeType.

                let mimeType = this.materialMimeTypes[ this.util.getFileExtension( path ) ];

                // check if mimeType is OK.

                if( mimeType ) {

                    this.doRequest( path, i, 

                        ( updateObj ) => {

                            /* 
                             * updateObj returned from GetAssets has the following structure:
                             * { 
                             *   pos: pos, 
                             *   path: requestURL, 
                             *   data: null|response, (Blob, Text, JSON, FormData, ArrayBuffer)
                             *   error: false|response 
                             * } 
                             */

                             if ( updateObj.data ) {

                                let materialObj = this.addMaterial( prim, updateObj.data, updateObj.path, updateObj.pos, mimeType, prim.type );

                                if ( materialObj ) {

                                    prim.materials.push( materialObj );

                                    this.util.emitter.emit( materialObj.emits, prim, materialObj.key );

                                } // end of material addition.

                             } else {

                                console.error( 'MaterialPool::getMaterials(): no data found for:' + updateObj.path );

                             }

                        }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

                } else {

                    console.error( 'MaterialPool::getModels(): file type "' + this.util.getFileExtension( path ) + ' not supported, not loading' );

                }

            }

        } // end of loop

    }

}

export default MaterialPool;