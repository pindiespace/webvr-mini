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

        // Map textureMap types to position in prim.textures array. If new positions added, update this.computeObjectMaterials();

        this.textureRoles = {

            'map_Kd': 0,   // diffuse map, an image file (e.g. file.jpg)

            'map_Ka': 1,   // ambient map

            'map_bump': 2, // bumpmap

            'bump': 2,     // bumpmap

            'map_Km': 2,   // bumpmap

            'map_Ks': 3,   // specular map

            'map_refl': 4, // environment Map Path 

            'refl': 4,     // environment Map Path 

            'map_d': 5,    // alpha map

            'map_disp': 6, // displacement map

            'disp': 6      // displacement map

        };

        // Reverse map for texture Roles (due to redundancy, don't use Object.keys()).

        this.texturePositions = [ 'map_Kd', 'map_Ka', 'map_bump', 'map_Ks', 'map_refl', 'map_d', 'disp' ];

        this.defaultTextureRole = 'map_Kd'; // also pos zero for texturePositions

        if ( init ) {

            // Create and store a default Material asset.

            this.defaultKey = this.addAsset( this.default() ).key;

        }

    }

    /** 
     * Create the default MaterialPool object.
     * @param {String} name the name of the material, either 'defaul' in .mtl file.
     * @param {Array} ambient ambient color.
     * @param {Array} diffuse diffuse color.
     * @param {Array} specular specular color.
     * @param {Number} specularExponent the shininess of the object.
     * @param {Number} sharpness of reflection map.
     * @param {Number} refraction light-bending of transparent objects.
     * @param {Number} transparency.
     * @param {Number} enumerated list of lighting modes.
     * @param {String} map_Kd the default texture for diffuse mapping.
     */
    default ( name = this.util.DEFAULT_KEY, ambient = [ 1, 1, 1 ], diffuse = [ 0.7, 0.7, 0.7 ], specular = [ 1.0, 1.0, 1.0 ], 

        specularExponent = 64.0, emissive = [ 0, 0, 0 ], sharpness = 60, refraction = 1, transparency = 0, illum = 1, 

        map_Kd = null ) {

        return {

            name: name,

            key: null,           // key in MaterialPool

            path: null,          // path to file

            ambient: ambient,    // Ka ambient color, white

            diffuse: diffuse,    // Kd diffuse color, white

            specular: specular,  // Ks specular color, black (off)
   
            specularExponent: specularExponent,  // Ns specular exponent, ranges between 0 and 1000

            emissive: emissive,

            sharpness: sharpness,         // sharpness of reflection map (0-1000)

            refraction: refraction,       // refraction, 1.0 = no refraction

            transparency: transparency,   // d | Tr = transparency 1.0 = transparent

            illum: illum,                 // illium, color and ambient on

            map_Kd: map_Kd,               // diffuse map, an image file (other maps not in default)

            map_Ks: null,                 // specular map

            map_Ka: null,                 // ambient map

            map_refl: null,               // environment map

            map_d: null,                  // alpha map

            map_bump: null,               // bumpmap

            disp: null,                   // displacement map

        }

    }

    /** 
     * extract additional options for texture maps in OBJ format. Assumes that 
     * a texture file was specified as the last data item in the line. Only the 
     * options specified in the file are added (so calling program must test for them).
     * @param {Array} data the line of the file for a texture map.
     */
    computeTextureMapOptions( data ) {

        let options = {};

         ///////console.log('computeTextureMapOptions data:' + data + ' length:' + data.length )

        // If there there are no options, return an empty object.

        if ( data.length < 4 ) {

            return options;

        }

        ///////console.log('...analyzing TextureMapOptions:' + data);

        /* 
         * Texturemap format:
         * -s 1 1 1 -o 0 0 0 -mm 0 1 filename.png
         * 
         * Copy the data string, sans filename.
         */

        let p = [];

        for ( let i = 0; i < data.length - 1; i++ ) {

            p[ i ] = data[ i ]

        }

        let pp = p.join( ' ' ).split( '-' );

        for ( let i = 0; i < pp.length; i++ ) {

            let ppp = pp[ i ].split( ' ' );

            if ( ppp.length > 1 ) {

                ////////console.log( 'ppp[0]:' + ppp[0] )

                let d = ppp[ 0 ],

                d1 = ppp[ 1 ];

                switch ( d ) {

                    case 'blenu':  // texture blends in horizontal direction
                    case 'blenv': // texture blends in vertical direction
                    case 'cc': // color correction, only with color maps (map_Ka, map_Kd, and map_Ks)
                    case 'clamp': // restrict textures to 0-1 range

                    if ( d1 === 'off' ) options[ d ] = false; else options[ d ] = true;

                        break;

                    case 'bm': // bump map multiplier, should be 0-1
                    case 'mm': // base gain multiplier (makes brighter, 0-1)

                        if ( Number.isFinite( parseFloat( d1 ) ) ) {

                            options[ d ] = parseFloat( d1 );

                        }

                        break;

                    case 'boost': // sharpen, any non-negative number

                        if ( Number.isFinite( parseFloat( d1 ) ) && d1 >= 0 ) {

                            options[ d ] = parseFloat( d1 );

                        }

                        break;

                    case 'imfchan': // channel used to create scalar or bump texture, (r | g | b | m | l | z)
                    case 'texres':  // scale up images to the next power of 2.

                        options[ d ] = d1;

                        break;

                    case 'o': // offset texture map origin x, y z
                    case 's': // scales the size of the texture pattern, default 1,1,1
                    case 't': // turn on texture turbulence (u, v, w )

                        // Remove anything that isn't a number.

                        let ct = 0;

                        options[ d ] = [];

                        for ( let j = 1; j < ppp.length; j++ ) {

                            let pi = ppp[ j ];

                            if ( Number.isFinite( parseFloat( pi ) ) ){

                                options[ d ][ ct++ ] = parseFloat( pi )

                            }

                        }

                        if ( options[ d ].length !== 3 ) {

                            console.warn( 'MaterialPool::computeTextureMapOptions(): in valid texture param for:' + d );

                            options[ d ] = [ 0, 0, 0 ];

                        }

                        break;

                    default: 

                        console.error( 'unknown texture map option: ' + data );

                        break;

                }

            }

        }

        // Options could be empty.

        return options;

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

        ////////console.log( 'MaterialPool::computeObjMaterials(): loading model:' + path + ' for:' + prim.name );

        let lineNum = 0;

        let materials = [];

        let currName = null;

        let dir = this.util.getFilePath( path );

        let lines = data.split( '\n' );

        lines.forEach( ( line ) => {

            line = line.trim();

            // First value, the directive.

            let type = line.split( ' ' )[ 0 ].trim();

            // All other values as an array.

            let data = line.substr( type.length ).trim().split( ' ' );

            // If there's no data, don't process.

            if ( data !== '' ) {

                switch ( type ) {

                    case 'newmtl': // name of material.

                        currName = data[ 0 ].trim();

                        // Apply file data to our default Material.

                        materials[ currName ] = this.default( currName );

                        break;

                    case 'Ka': // ambient

                        if ( data.length < 3 ) {

                            console.error( 'MaterialPool::computeObjMaterials(): error in ambient material array at line:' + lineNum );

                        } else {

                            data[ 0 ] = parseFloat( data[ 0 ] ),

                            data[ 1 ] = parseFloat( data[ 1 ] ),

                            data[ 2 ] = parseFloat( data[ 2 ] );

                            if ( currName && Number.isFinite( data[ 0 ] ) && Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) ) {

                                materials[ currName ].ambient = [ data[ 0 ], data[ 1 ], data[ 2 ] ];  

                            } else {

                                console.error( 'MaterialPool::computerObjMaterials(): invalid ambient data at line:' + lineNum );

                            }

                        }

                        break;

                    case 'Kd': // diffuse (usually the same as ambient)

                        if ( data.length < 3 ) {

                            console.error( 'MaterialPool::computeObjMaterials(): error in diffuse material array at line:' + lineNum );

                        } else {

                            data[ 0 ] = parseFloat( data[ 0 ] ),

                            data[ 1 ] = parseFloat( data[ 1 ] ),

                            data[ 2 ] = parseFloat( data[ 2 ] );

                            if ( currName && Number.isFinite( data[ 0 ] ) && Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) ) {

                                materials[ currName ].diffuse = [ data[ 0 ], data[ 1 ], data[ 2 ] ];

                            } else {

                                console.error( 'MaterialPool::computeObjMaterials(): invalid diffuse array at line:' + lineNum );

                            }

                        }

                        break;

                    case 'Ks': // specular

                        if ( data.length < 3 ) {

                            console.error( 'MaterialPool::computeObjMaterials(): error in specular array at line:' + lineNum );

                        } else {

                            data[ 0 ] = parseFloat( data[ 0 ] ),

                            data[ 1 ] = parseFloat( data[ 1 ] ),

                            data[ 2 ] = parseFloat( data[ 2 ] );

                            if ( currName && Number.isFinite( data[ 0 ] ) && Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) ) {

                                materials[ currName ].specular = [ data[ 0 ], data[ 1 ], data[ 2 ] ];

                            } else {

                                console.error( 'MaterialPool::computeObjMaterials(): invalid specular array at line:' + lineNum );

                            }

                        }

                        break;

                    case 'Ns': // specular exponent

                        if ( data.length < 1 ) {

                            console.error( 'MaterialPool::computeObjMaterials(): error in specular exponent array at line:' + lineNum );

                        } else {

                            data[ 0 ] = parseFloat( data[ 0 ] );

                            if ( currName && Number.isFinite( data[ 0 ] ) && data[ 0 ] >= 0 && data[ 0 ] < 1001 ) {

                                materials[ currName].specularExponent = data[ 0 ];    

                            } else {

                                console.error( 'MaterialPool::computeObjMaterials(): invalid specular exponent array at line:' + lineNum );

                            }

                        }

                        break;

                    case 'Ke': // emissive coefficient

                        if ( data.length < 3 ) {

                            console.error( 'MaterialPool::computeObjMaterials(): error in specular array at line:' + lineNum );

                        } else {

                            data[ 0 ] = parseFloat( data[ 0 ] ),

                            data[ 1 ] = parseFloat( data[ 1 ] ),

                            data[ 2 ] = parseFloat( data[ 2 ] );

                            if ( currName && Number.isFinite( data[ 0 ] ) && Number.isFinite( data[ 1 ] ) && Number.isFinite( data[ 2 ] ) ) {

                                materials[ currName ].emissive = [ data[ 0 ], data[ 1 ], data[ 2 ] ];

                            } else {

                                console.error( 'MaterialPool::computeObjMaterials(): invalid specular array at line:' + lineNum );

                            }

                        }

                        break;

                    case 'sharpness': // sharpness, 0-1000, default 60, for reflection maps

                        data[ 0 ] = parseFloat( data[ 0 ] );

                        if ( currName && Number.isFinite( data[ 0 ] ) && data[ 0 ] >= 0 && data[ 0 ] < 1001 ) {

                            materials[ currName].sharpness = data[ 0 ];

                        }

                        break;

                    case 'Ni': // optical density (refraction index, 1.0 = no refraction)

                        data[ 0 ] = parseFloat( data[ 0 ])

                        if ( currName && Number.isFinite( data[ 0 ] ) && data[ 0 ] >= 0 && data[ 0 ] < 1001 ) {

                            materials[ currName].refraction = data[ 0 ];

                        }

                        break;

                    case 'd':  // opacity
                    case 'Tr': // transparent

                    // TODO: handle -halo parameter  d -halo factor

                        if ( data.length <  1 ) {

                            console.error( 'MaterialPool::computeObjMaterials(): error in transparency value at line:' + lineNum );

                        } else {

                            data[ 0 ] = parseFloat( data[ 0 ] );

                            if ( currName && Number.isFinite( data[ 0 ] ) ) {

                                if ( type === 'Tr' ) data[ 0 ] = 1.0 - data[ 0 ]; // Invert

                                materials[ currName ].transparency = parseFloat( data[ 0 ] ); // single value, 0.0 - 1.0

                            } else {

                                console.error( 'MaterialPool::computeObjMaterials(): invalid transparency value at line:' + lineNum );

                            }

                        }

                        break;

                    case 'illum':    // illumination mode

                        if ( data.length < 1 ) {

                            console.error( 'MaterialPool::computeObjMaterials(): error in illumination value at line:' + lineNum );

                        } else {

                            data[ 0 ] = parseInt( data[ 0 ] );

                            if ( currName && Number.isFinite( data[ 0 ] ) && data[ 0 ] > 0 && data[ 0 ] < 11 ) {

                                /* 
                                 * VALUES:
                                 * 0. Color on and Ambient off
                                 * 1. Color on and Ambient on (DEFAULT FOR THIS APP)
                                 * 2. Highlight on
                                 * 3. Reflection on and Ray trace on
                                 * 4. Transparency: Glass on, Reflection: Ray trace on
                                 * 5. Reflection: Fresnel on and Ray trace on
                                 * 6. Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
                                 * 7. Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
                                 * 8. Reflection on and Ray trace off
                                 * 9. Transparency: Glass on, Reflection: Ray trace off
                                 * 10. Casts shadows onto invisible surfaces
                                 */

                                materials[ currName ].illum = data[ 0 ];

                            }

                        }

                        break;

                    case 'map_Kd':   // diffuse map, an image file (e.g. file.jpg)
                    case 'map_Ks':   // specular map
                    case 'map_Ka':   // ambient map
                    case 'map_d':    // alpha map
                    case 'bump':     // bumpmap
                    case 'map_bump': // bumpmap
                    case 'map_refl': // environment map
                    case 'refl':     // environment map
                    case 'disp':     // displacement map

                        /* 
                         * These commands all load single image files, and append to Prim texture list 
                         * after being emitted with a TEXTURE_2D_READY in PrimFactory.
                         * @link  "filename" is the name of a color texture or image file.
                         * @link http://paulbourke.net/dataformats/mtl/
                         * Additional texture parameters go in texture.options
                         * map_Ka -s 1 1 1 -o 0 0 0 -mm 0 1 file.png
                         */

                        let tPath = data[ data.length - 1 ].trim();

                        //////////console.log('path:' + path + ' data:' + data + ' tPath:' + tPath)

                        if ( currName ) { // if not, file is corrupt.

                            // Convert 'bump' to 'map_bump'.

                            if ( type === 'bump' ) type = 'map_bump';

                                // Set the materials value to texture path.

                                materials[ currName ][ type ] = tPath;

                                /* 
                                 * get (hyphenated) texture options, if present, and add them to the getTextures() call.
                                 */

                                let options = this.computeTextureMapOptions( data );

                                // Give each texture a list of materials it is associated with.

                                if ( ! options.materials ) {

                                    options.materials = [ currName ];

                                } else {

                                    options.materials.push( currName );

                                }

                            /* 
                             * multiple textures have a defined order in the textures array.
                             */

                            // Convert equivalent types.

                            if ( type === 'bump' || type === 'map_Km' ) type = 'map_bump';

                            if ( type === 'refl' ) type = 'map_refl';

                             options.pos = this.textureRoles[ type ];

                             // Save the string version of type to pass to the called texture.

                             options.type = type;

                            /*
                             * NOTE: the texture attaches to prim.textures, so the fourth parmeter is the texture type (map_Kd, map_Ks...).
                             * NOTE: the sixth paramater, is NULL since it defines a specific WebGL texture type (we want the default).
                             * NOTE: thex seventh paramater, options, if present, we pass those in as well.
                             */

                            this.texturePool.getTextures( prim, [ dir + tPath ], true, false, null, options );

                        }

                        break;

                    case 'Tf': // transmission filter
                    case '#':  // comment
                    case '':   // no parameter

                        break;

                    default: 

                        console.warn( 'MaterialPool::computeObjMaterials(): unknown property:' + type + ' in file' );

                        break;

                } // end of switch

            } // end of if data !== ''

            lineNum++;

        } );

        return materials;

    }

    /** 
     * Add a material.
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

                /////////////console.log("MTL file for prim:" + prim.name + " loaded, parsing....")

                // Returns an array with one or more materials.

                m = this.computeObjMaterials( data, prim, path );

                break;

            default:

                console.warn( 'MaterialPool::addModel(): unknown material file:' + path + ' MIME type:' + mimeType );

                break;

        }

        // Set up the Material object(s).

        if ( m ) {

            for ( let i in m ) {

                let mi = m[ i ];

                mi.type = type,

                mi.path = path,

                mi.emits = this.util.emitter.events.MATERIAL_READY;

                ///////////console.log("MaterialPool::addMaterial(): adding:" + mi.name + " to Prim:" + prim.name )

                this.addAsset( mi );

            }

        }

        return m ;

    }

    /** 
     * Load models, using a list of paths. If a Model already exists, 
     * just return it. Otherwise, do the load.
     * @param {Prim} prim the calling Prim.
     * @param {Array[String]} pathList a list of URL paths to load, or a key for a material in our pool.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     */
    getMaterials ( prim, pathList, cacheBust = true, start = 0 ) {

        // Wrap single strings in an Array.

        if ( this.util.isString( pathList ) ) {

            pathList = [ pathList ];

        }

        for ( let i = 0; i < pathList.length; i++ ) {

            let path = pathList[ i ];

            // Could have an empty path.

            if ( ! this.util.isWhitespace( path ) ) {

                // See if the 'path' is actually a key for our MaterialPool.

                let poolMaterial = this.pathInList( path );

                if ( poolMaterial ) {

                    console.log("REFERENCING EXISTING MATERIAL...")

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

                                    // Multiple materials may be present in one .mtl file.

                                    if ( materialObj ) {

                                        for ( let i in materialObj ) {

                                            ////////////console.log("MaterialPool sending:" + materialObj[ i ].emits + ' key:' + materialObj[ i ].key + ' i:' + i )

                                            // Note that 'i' is the name of the material, instead of a numerical index (which it is in ModelPool and TexturePool).

                                            this.util.emitter.emit( materialObj[ i ].emits, prim, materialObj[ i ].key, i );

                                        }

                                    } // end of material addition.

                                } else {

                                    console.error( 'MaterialPool::getMaterials(): no data found for:' + updateObj.path );

                                }

                            }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

                    } else {

                        console.error( 'MaterialPool::getModels(): file type "' + this.util.getFileExtension( path ) + ' not supported, not loading' );

                    }

                }

            } else {

                console.warn( 'MaterialPool::getMaterials(): no path supplied for position ' + i );

            } // end of valid path

        } // end of for loop

    }

}

export default MaterialPool;