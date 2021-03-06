import Mesh from  './mesh';
import Lights from './lights';
import AssetPool from './asset-pool';
import GeometryPool from './geometry-pool';
import TexturePool from './texture-pool';
import ModelPool from './model-pool';
import AudioPool from './audio-pool';
import GeometryBuffer from './geometry-buffer';

'use strict'

class PrimFactory extends AssetPool {

    /** 
     * @class
     * Object Factory for Prims, and return vertex and index data 
     * suitable for creating a VBO and IBO.
     * 
     * Because objects can vary widely in composition and have lots of 
     * properties, we use an Object-Factory pattern here instead of an ES6 class, and 
     * don't use 'new' operator to create individual Prims.
     *
     * Members of the manufactured Prim (values are units, with 1.0 being normalized size).
     *
     * Elements of Prims:
     * 
     * prim.position      = (glMatrix.vec5) [ x, y, z, rounding, | startSlice, endSlice,  ]
     * prim.dimensions    = (glMatrix.vec4) [ x, y, z ]
     * prim.divisions     = (glMatrix.vec5) [ x, y, z ]
     * prim.acceleration  = (glMatrix.vec3) [ x, y, z ]
     * prim.rotation      = (glMatrix.vec3) [ x, y, z ]
     * prim.angular       = (glMatrix.vec3) [ x, y, z ]
     * 
     * prim.geometry      = GeometryBuffer flattened arrays plus WebGL objects with the following datatypes:
     *
     *  { 
     *    vertices:  [],   // Float32Array
     *    indices:   [],   // Uint32Array (Uint16Array if 32-bit indices not supported)
     *    texCoords: [],   // Float32Array
     *    normals:   [],   // Float32Array
     *    tangents:  [],   // Float32Array
     *    colors:    []    // Float32Array
     *  }
     * 
     * prim.shader        = Shader used by this prim.
     * prim.materials     = materials used by this prim, may contain textures.
     * prim.audio         = array of audio files use by this prim.
     * prim.video         = array of video files used by this prim.
     *
     * Array optimization
     * https://gamealchemist.wordpress.com/2013/05/01/lets-get-those-javascript-arrays-to-work-fast/
     *
     * @constructor
     * Note don't call anything in World that requires World.init() in constructor.
     *
     * @param {Boolean} init if true, initialize immediately.
     * @param {Util} util shared utility methods, patches, polyfills.
     * @param {glMatrix} glMatrix fast array manipulation object.
     * @param {WebGL} webgl object holding the WebGLRenderingContext.
     * @param {TexturePool} a TexturePool object for accessing textures.
     * @param {ModelPool} a ModelPool for reading OBJ WaveFront and similar 3d object files.
     * @param {GeometryPool} Creates geometry, procedural or Mesh (by invoking ModelPool).
     */
    constructor ( init, world ) {

        /* 
         * Initialize AssetLoader class
         */

        super( world.webgl.util );

        // Keep a copy of the World for up-communication.

        this.world = world,

        this.util = world.util,

        this.webgl = world.webgl,

        this.vr = world.vr,

        this.glMatrix = world.glMatrix,

        // Attach 1 copy of the Texture loader to this Factory.

        this.texturePool = world.texturePool, // new TexturePool( init, util, webgl );

        // Attach 1 copy of the Model loader to this Factory.

        this.modelPool = world.modelPool, // new ModelPool( init, util, webgl );

        // Attach 1 copy of GeometryPool to this Factory (itself loading a reference to world.modelPool.

        this.geometryPool = world.geometryPool,

        // Attach 1 copy of MaterialPool to this Factory.

        this.materialPool = world.materialPool;

        // Keep a list of all created Prims here.

        /////////////////////this.prims = [];

        /** 
         * ---------------------------------------
         * EMITTER CALLBACKS
         * ---------------------------------------
         */

        // Bind the callback for geometry initialization applied to individual prims (GeometryPool, Mesh, and ModelPool).

        // Alias Wavefront OBJ format files.

        this.util.emitter.on( this.util.emitter.events.OBJ_GEOMETRY_READY, 

            ( prim, key, options ) => {

                ////console.log( 'PrimFactory::' + prim.name + ' OBJ geometry ready, key:' + key + ' pos:' + options.pos );

                // Object, Group, SmoothingGroup starts.

                let coords = this.modelPool.keyList[ key ];

                prim.objects = coords.options.objects;

                // Start of section of a model, typically with a new material.

                prim.groups = coords.options.groups;

                // Use smoothingGroups to redefine normals.

                prim.smoothingGroups = coords.options.smoothingGroups;

                // Material start array.

                prim.matStarts = coords.options.matStarts;

                this.initPrimGeometry( prim, coords, options );

                prim.shader.addPrim( prim ); // TRY to add it

        } );

        // HYG stellar database (only fires once for each database load).

        this.util.emitter.on( this.util.emitter.events.HYG_GEOMETRY_READY, 

            ( prim, key, options ) => {

                console.log( 'PrimFactory::HYG_GEOMETRY_READY event' );

                let coords = this.modelPool.keyList[ key ];

                // Star data, one for each vertex.

                prim.objects = coords.options.objects;

                // Default material.

                prim.matStarts = coords.options.matStarts;

                // Note: this routine computes the bounding box, needed for the rotation.

                this.initPrimGeometry( prim, coords, options );

                // If the World is gelocated, check if this Prim reacts to Geolocation data. If so, fire a position/rotation update.

                if ( prim.geolocate === true ) {

                    let geoData = this.world.geoData;

                    if ( geoData && this.util.isNumber( geoData.latitude ) && this.util.isNumber( geoData.longitude ) ) {

                        console.log( 'PrimFactory::HYG_GEOMETRY_READY event, world.geoData:' + geoData);

                        this.world.computeSkyRotation( prim, geoData );

                    }

                }

                // Add the completed Prim to the Shader.

                prim.shader.addPrim( prim );

        } );

        // Heightmap terrain.

        this.util.emitter.on( this.util.emitter.events.HEIGHTMAP_GEOMETRY_READY, 

            ( prim, key, options ) => {

                console.log('PrimFactory::HEIGHTMAP_GEOMETRY_READY event, key:' + key );

                let hm = this.modelPool.keyList[ key ];

                let heightMap = hm.options.map;
                //let heightMap = options.map;

                let geo = prim.geometry;

                let vertices = geo.vertices.data;

                let xScale = heightMap.w / prim.divisions[ 0 ];

                let zScale = heightMap.d / prim.divisions[ 2 ];

                let pixels = heightMap.pixels;

                // Loop through the heightMap, adjusting y values.

                for ( let i = 0; i < pixels.length; i++ ) {

                    vertices[ ( i * 3 ) + 1 ] = ( ( pixels[ i ] - heightMap.minHeight ) / 128 );

                }

                // Don't run initPrimGeometry (it has already run), just update.

               prim.geometry.setVertices( vertices );

               prim.geometry.setNormals( this.geometryPool.computeNormals( vertices, geo.indices.data, geo.normals.data ) );

        } );

        // Standard procedural Prim shapes

        this.util.emitter.on( this.util.emitter.events.PROCEDURAL_GEOMETRY_READY, 

            ( prim, key, options ) => {

                ////console.log( 'PrimFactory::' + prim.name + ' Procedural geometry ready, key:' + key + ' pos:' + options.pos );

                let coords = this.modelPool.keyList[ key ];

                // Create a default matStarts over the entire Geometry.

                prim.matStarts = [ [ this.materialPool.createDefaultName( prim.name ), 0, coords.indices.length ] ]; //////////////////////////////

                this.initPrimGeometry( prim, coords, options );

                prim.shader.addPrim ( prim ); // TRY to add it

        } );

         // Bind Prim callback for a new material applied to individual Prims.

        this.util.emitter.on( this.util.emitter.events.MATERIAL_READY, 

            ( prim, key, materialName ) => {

                this.initPrimMaterial( prim, this.materialPool.keyList[ key ], materialName ); // associative array

                prim.shader.addPrim ( prim ); // TRY to add it

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_2D_READY, 

            ( prim, key, options ) => {

                this.initPrimTexture( prim, this.texturePool.keyList[ key ], options );

                prim.shader.addPrim( prim ); // TRY to add its

        } );


        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_3D_READY, 

            ( prim, key, options ) => {

                this.initPrimTexture3d( prim, this.texturePool.keyList[ key ], options );

                // Check if complete, add if it is...

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_CUBE_MAP_READY, 

            ( prim, key, options ) => {

                this.initPrimTextureCubeMap( prim, this.texturePool.keyList[ key ], options );

                // Check if complete, add if it is...

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a Shader accepting a Prim for rendering.

        this.util.emitter.on( this.util.emitter.events.PRIM_ADDED_TO_SHADER, 

            ( prim ) => {

                // If we are a Prim that needs geolocation, update our rotation (STARDOME, TERRAIN)

                // Get the maximum alpha in all the defined textures. If we have more than one, don't use 'default'.

                let maxAlpha = 0;

                for ( let i in prim.materials ) {

                    let m = prim.materials[ i ];

                    if ( m.name.indexOf( this.util.defaultKey ) !== this.util.NOT_IN_LIST ) {

                        if ( Number.isFinite( m.transparency ) ) {

                            let alpha = 1.0 - m.transparency;

                            if ( alpha > maxAlpha ) maxAlpha = alpha;

                        }

                    }

                }

                if ( maxAlpha > 0 ) {

                    prim.alpha = maxAlpha;

                } // otherwise, keep the default of 1.0

                // Fade in from invisible to our assigned alpha value.

                //console.log(prim.name + " SETTING PRIM FADEIN, shader:" + prim.shader.name + ' and defaultShader:' + prim.defaultShader)

                prim.setFade( 0, prim.alpha, 0.001, 'easeQuad' );

                prim.failCount = 0;

        } );


        this.util.emitter.on( this.util.emitter.events.PRIM_REMOVED_FROM_SHADER, 

            ( prim ) => {

                // TODO:

        } );

    } // end of constructor

    getPrimData () {

        let pData = [];

        for ( let i in this.keyList ) {

            let p = this.keyList[ i ];

            pData.push( {

                name: p.name,

                shader: p.shader.name,

                key: p.key

            } );

        }

        return pData;

    }

    /**
     * Remove a Prim, which means removing from this.prims[], AND 
     * removing from the base class AssetPool, AND any Shaders it is in.
     */
    deletePrim ( prim ) {

        let p = null;

        if ( prim && prim.key ) {

            p = this.getAsset( prim.key );

            if ( p === prim ) {

                 // Remove from AssetPool.

                if ( p === this.removeAsset( prim.key ) ) {

                    ///////console.log( "......primFactory::removeAsset() found and removed:" + p.name );

                } else {

                    console.error( 'PrimFactory::deletePrim(): Prim:' + p.name + ' not removed from PrimFactory' );

                }

                // Remove from its Shaders.

                p.shader.removePrim( p );

                p.defaultShader.removePrim( p );

                // double-check.

                let shaders = this.world.getShaders();

                for ( let i = 0; i < shaders.length; i++ ) {

                    if ( shaders[ i ].removePrim( p ) ) { // THIS IS JUST TESTING DOUBLE CHECK. TODO: TODO: REMOVE THIS CODE.

                        console.error( '....PrimFactory::deletePrim(): prim:' + p.name + ' found in unexpected Shader:' + shaders[ i ].name );

                    }

                }

            } else {

                    console.warn( '.....PrimFactory::deletePrim(): prim:' + p.name + ' not found in PrimFactory' );

                }

        } else {

            console.warn( '....PrimFactory::deletePrim(): invalid prim passed' );

        }

        return p;

    }

    /** 
     * Set the current Prim list to a specific World by adding and 
     * removing Prims from the Shader.
     * @param {Array[Prim]} newPrims
     */
    setActivePrims ( world ) {

        let p = null;

        // Come in with a list of keys belonging to World.

        for ( let i in this.keyList ) {

            p = this.keyList[ i ];

            p.shader.removePrim( p, false );

        }

        console.log( 'PrimFactory::setActivePrims(): adding back active world prims to their Shaders' );

        // Empty, now reset with our world.

        for ( let i in world ) {

            switch ( i ) {

                case 'scene':
                case 'path':
                case 'key':

                    break;

                default: // an initialized.

                    p = world[ i ];

                    console.log( 'PrimFactory::setActivePrims(): prim is:' + p );

                   p.alpha = 1; // NOTE: triggers fadein!

                   p.shader.addPrim( p, true );

                    break;

            }

        }

    }

    /** 
     * Add a new texture to the Prim (callback for TEXTURE_2D_READY event).
     * @param {Prim} prim the prim to be updated.
     * @param {TextureObj} textureObj the texture object returned from TexturePool.
     * @param {Number} pos a position to write the texture to.
     */
    initPrimTexture ( prim, textureObj, options ) {

        //console.log("Prim::initPrimTexture(): new texture for prim:" + prim.name + ', options:' + options );

        // Find the associated material from the material key given to the texture.

        let m = prim.materials[ options.materialName ];

        if ( m ) {

            console.log( 'PrimFactory::initPrimTexture(): adding texture ' + options.type + ' to material:' + options.materialName );

        } else if ( options.materialKey ) {

            console.log( 'PrimFactory::initPrimTexture(): using material ' + options.materialName + ' supplied in options' );

            m = this.materialPool.getAssetByKey( options.materialKey );

            prim.materials[ options.materialName ] = m;

        } else {

            console.log( 'PrimFactory::initPrimTexture(): no material for prim:' + prim.name + ', creating placeholder for material:' + options.materialName + ' using it...' );

            m = this.materialPool.default( options.materialName );

            prim.materials[ options.materialName ] = m;

        }

        m[ options.type ] = textureObj.texture,

        m[ options.type + '_path' ] = textureObj.path,

        m[ options.type + '_key' ] = textureObj.key,

        m[ options.type + '_options' ] = options[ options.type + '_options' ];     

    }

    /** 
     * Add a new 3d texture to the Prim.
     */
    initPrimTexture3d( prim, textureObj, options ) {

        console.log("Prim::initPrimTexture(): new 3D texture for prim:" + prim.name + ', options:' + options);

    }

    /** 
     * Add a new cubemap texture to the Prim
     */
    initPrimTextureCubeMap( prim, textureObj, options ) {

        console.log("Prim::initPrimTexture(): new CubeMap texture for prim:" + prim.name + ', options:' + options);

    }

    /** 
     * Add ma material description to the Prim.
     * Note: a single .mtl file may add multiple materials.
     * @param {Prim} prim the prim.
     * @param {Material} material the material object.
     * @param {Number} pos starting position in array (usually 0).
     */
    initPrimMaterial ( prim, material, options ) {

        console.log('Prim::initMaterial(): new material:' + material.name + ' for prim:' + prim.name + ' key:' + material.key );

        let m = prim.materials[ material.name ];

        /* 
         * If a texture arrives before a material (PrimFactor.initPrimTexture()), it creates a placeholder material with 
         * default values. Check if it exists, and merge our material values onto it if necessary.
         */

        if ( m && m.name === options.materialName ) { // merge over our values, except for textures and texture options.

            console.log( 'Prim::initMaterial(): found existing material:' + material.name + ' for prim:' + prim.name );

           this.materialPool.mergeTo( m, material );

        } else {

            // Just add the material.

            console.log( 'Prim::initMaterial(): adding new material:' + material.name + ' for prim:' + prim.name );

            prim.materials[ material.name ] = material;

        }

    }

    /** 
     * Initialize Prim geometry from proceedural geometry routines or OBJ wavefront files.
     * @param {prim} prim the Prim.
     * @param {String} key the identifying the geometry in the ModelPool.
     * @param {Object} coords coordinates object returned by procedural, Mesh, or ModelPool. Added 
     * to the ModelPool. The method gets the coords object from ModelPool via a key (see constructor).
     * { 
     *   vertices: vertices, 
     *   indices: indices,
     *   normals: normals, 
     *   texCoords: texCoords, 
     *   tangents: tangents
     *   type: type.
     *   path: file path.
     *   options: grouping of vertices under objects, groups, materials, smoothinGroups...
     * };
     */
    initPrimGeometry ( prim, coords, options ) {

        // Update vertices if they were supplied.

        prim.updateVertices( coords.vertices );

        // Compute bounding box.

        prim.computeBoundingBox( prim.geometry.vertices.data );

        /* 
         * Procedural geometry is already at scale = 1, so bounding box should be computed 
         * automatically.
         * 
         * For a Mesh, look at dimensions supplied in the initial Prim call, 
         * relative to topleft and bottomright of bounding box
         * and determine a scale. Use this to scale in the MV matrix
         *
         */

        let scale =  prim.dimensions[ 0 ] / prim.boundingBox.dimensions[ 0 ];

        scale = Math.max( scale, prim.dimensions[ 1 ] / prim.boundingBox.dimensions[ 1 ] );

        scale = Math.max( prim.dimensions[ 2 ] / prim.boundingBox.dimensions[ 2 ] );

        prim.scale = [ scale, scale, scale ];

        // Update indices if they were supplied.

        prim.updateIndices ( coords.indices );

        // If normals are used, re-compute.

        prim.updateNormals( coords.normals );

        // If texcoords are used, re-compute.

        prim.updateTexCoords( coords.texCoords );

        // Tangents aren't supplied by OBJ format, so re-compute.

        prim.updateTangents();

        // Colors aren't supplied by OBJ format, but are supplied by others (e.g. Hyg) so re-compute.

        prim.updateColors( coords.colors );

        // If a usemtl was specified by a file load

        // Check our buffers for consistency.

        //////////prim.geometry.checkBufferData();

        //if ( prim.name === 'cubesphere' ) {
        //if ( prim.name === 'TestCapsule' ) {
        //if ( prim.name === 'colored cube' ) {
        //if ( prim.name === 'texsphere' ) {

            let mesh = new Mesh( prim );

            // SUBDIVIDE TEST

            //mesh.subdivide( true );
            //mesh.subdivide( true );
            //mesh.subdivide( true );
            //mesh.subdivide( true );
            //mesh.subdivide( true );
            //mesh.subdivide( true );
            //mesh.subdivide( true );
            //mesh.subdivide( true );
            //mesh.subdivide( true ); // this one zaps from low-vertex < 10 prim

         //}

        //console.log("checking buffer data for " + prim.name );

        /////////prim.geometry.checkBufferData();

    }

    /** 
     * Create an standard 3d object.
     * @param {Function} shader Shader-derived object that can add and remove this Prim from rendering list.
     * @param {String} type assigned type of object (required for prim generation)
     * @param {String} name assigned name of object (not necessarily unique).
     * @param {vec5} dimensions object dimensions (width, height, depth, (plus additional info for some Prims)
     * @param {vec5} divisions number of divisions in the x, y, z surface, (plus additional info for some Prims)
     * @param {glMatrix.vec3} position location of center of object.
     * @param {glMatrix.vec3} acceleration movement vector (acceleration) of object.
     * @param {glMatrix.vec3} rotation rotation vector (spin) around center of object.
     * @param {glMatrix.vec3} angular orbital rotation around a defined point ///TODO!!!!! DEFINE########
     * @param {String[]} textureImages array of the paths to images used to create a texture (one Prim can have several).
     * @param {glMatrix.vec4[]|glMatrix.vec4} color the default color(s) of the object, either a single color or color array.
     * @param {Boolean} applyTexToFace if true, apply texture to each face, else apply texture to the entire object.
     * @param {String[]} modelFiles path to model OBJ (and indirectly, material files ) used to define non-procedural Mesh Prims.
     */
    computePrim ( 

        shader, // Shader which attaches/detaches this Prim from display list

        type, 

        name = 'unknown', 

        dimensions = [ 1, 1, 1, 0, 0 ], // vec5

        divisions = [ 1, 1, 1, 0, 0 ], // vec5

        position = this.glMatrix.vec3.create(), 

        acceleration = this.glMatrix.vec3.create(), 

        rotation = this.glMatrix.vec3.create(), 

        angular = this.glMatrix.vec3.create(), // TWO COORDS? ROTATION SPEED AND ORBITED POINT?

        textureImages = [], // textures (may be blank)

        modelFiles = [], // heightMap file (HEIGHTMAP) or array of coordinate and material files (MESH)

        useColorArray = false, // if true, don't use the texture, use a modelFile instead

        applyTexToFace = false, // if true, apply textures to each face, not whole Prim

        useLighting = true, // if true, light the object with the World Light

        useMetaData = false, // if true, use meta-data associated with array, store it in objects[] array

        pSystem = false,  // if not false, the Prim should be duplicated as a particle system accd to this object

        animSystem = false // if not false, the Prim has animation waypoints

        ) { // function to execute when prim is done (e.g. attach to drawing list shader).

        const vec3 = this.glMatrix.vec3,

        mat4 = this.glMatrix.mat4;

        // Check to see if the Prim type is defined.

        if ( ! this.geometryPool.checkType( type ) ) {

            console.error( 'Prim::computePrim(): unsupported Prim type:' + type + 'for:' + prim.name );

            return null;
        }

        if ( modelFiles && modelFiles.length === 0 && type === this.geometryPool.typeList.MESH ) {

            console.error( 'PrimFactory::computePrim(): type MESH does not have an defining file for Prim:' + prim.name );

            return null;
        }

        // Start the object factory.

        let prim = {};

        let p = prim;

        /** 
         * Update the model-view matrix with position, translation, rotation, and orbital motion for individual Prims.
         * @param {glMatrix.mat4} mvMatrix model-view matrix.
         * @returns {glMatrix.mat4} the altered model-view matrix.
         */
        prim.setMV = ( mvMatrix ) => {

            // TODO: translate everything.

            mat4.translate( mvMatrix, mvMatrix, p.position );

            // Set the Model matrix.

            prim.setM( mvMatrix );

            return mvMatrix;

        };

        /** 
         * Update the Model part of the Model-View matrix, when we need just the Model.
         * @param {glMatrix.mat4} mvMatrix model-view matrix.
         * @returns {glMatrix.mat4} the altered model-view matrix.
         */
        prim.setM = ( mMatrix ) => {

            mat4.rotate( mMatrix, mMatrix, p.rotation[ 0 ], [ 1, 0, 0 ] );

            mat4.rotate( mMatrix, mMatrix, p.rotation[ 1 ], [ 0, 1, 0 ] );

            mat4.rotate( mMatrix, mMatrix, p.rotation[ 2 ], [ 0, 0, 1 ] );

            mat4.scale( mMatrix, mMatrix, p.scale );

            return mMatrix;

        };

        /** 
         * Update the position, rotation, and orbit of a Prim during rendering loop. Called 
         * in the Shader.program.update() routine, conditionally if mono (always) 
         * or stereo (called evern other render).
         */
        prim.updateCoords = () => {

            vec3.add( p.position, p.position, p.acceleration ); // translate

            vec3.add( p.rotation, p.rotation, p.angular ); // rotate

            // Scale doesn't need to be updated, just passed in the .setM and .setMV above.

        }

        /** 
         * Set the Prim as a emissive glowing object. Global Lights 
         * are handled by the World.
         * @param {glMatrix.vec3} direction the direction of the light.
         * @param {glMatrix.vec4} color light color
         */
        prim.setLight = ( direction = [ 1, 1, 1 ], color = [ 255, 255, 255 ] ) => {

            p.light.direction = direction,

            p.light.color = color;

        };

        /** 
         * Set Prim material, with defaults available from MaterialPool.
         */
        prim.setMaterial = ( name = this.util.DEFAULT_KEY, ambient, diffuse, specular, 

            specularExponent, sharpness, refraction, transparency, illum, map_Kd ) => {

            console.log('Prim::setMaterial(): to name:' + name );

            // Default material.

            // TODO: IF NAME IS DEFAULT, GET THE DEFAULT MATERIAL FROM THE POOL.

            return this.initPrimMaterial( prim, this.materialPool.default( name, ambient, diffuse, specular, 

                specularExponent, sharpness, refraction, transparency, illum, map_Kd ), name );

        };

        // We don't have a .setMaterial - set directly in loadModel.updateMateria()

        // Update vertices (no re-compute available).

        prim.updateVertices = ( vertices ) => {

            let geo = p.geometry;

            if ( vertices && vertices.length > 0 ) {

                geo.setVertices( vertices );

            }

        };

        // update indices (no re-compute available).

        prim.updateIndices = ( indices ) => {

            let geo = p.geometry;

            if ( indices && indices.length > 0 ) {

                geo.setIndices( indices );

            }

        };

        // Update or re-compute normals.

        prim.updateNormals = ( normals ) => {

            let geo = p.geometry;

            if ( normals && normals.length > 0 ) {

                geo.setNormals( normals );

            } else {

                console.log("Prim::updateNormals():" + p.name + ' recalculating normal coordinates' );

                geo.setNormals( this.geometryPool.computeNormals( geo.vertices.data, geo.indices.data, [], p.useFaceNormals ) );

            }

        };

        // Update or re-compute texture coordinates.

        prim.updateTexCoords = ( texCoords ) => {

            let geo = p.geometry;

            if ( texCoords && texCoords.length > 0 ) {

                geo.setTexCoords( texCoords );

            } else if ( geo.numTexCoords() !== geo.numVertices() ) {

                console.log("Prim::updateTexCoords():" + p.name + ' recalculating texture coordinates' );

                geo.setTexCoords( this.geometryPool.computeTexCoords( geo.vertices.data, texCoords ) );

            }

        };

        // Update or re-compute tangents.

        prim.updateTangents = ( tangents ) => {

            let geo = p.geometry;

            if ( tangents && tangents.length > 0 ) {

                geo.setTangents( tangents );

            } else {

                /////////console.log("Prim::updateTangents():" + p.name + ' recalculating tangent coordinates' );

                geo.setTangents( this.geometryPool.computeTangents ( geo.vertices.data, geo.indices.data, geo.normals.data, geo.texCoords.data, [] ) );

            }

        };

        // Update or re-compute colors.

        prim.updateColors = ( colors ) => {

            let geo = p.geometry;

            if ( colors && colors.length > 0 ) {

                geo.setColors( colors );

            } else {

                ////////console.log("Prim::updateColors():" + p.name + ' recalculating color coordinates' );

                geo.setColors( this.geometryPool.computeColors( geo.normals.data, [] ) );

            }

        };

        // Compute the bounding box.

        prim.computeBoundingBox = () => {

            prim.boundingBox = this.geometryPool.computeBoundingBox( prim.geometry.vertices.data );

        };

        // Compute the bounding sphere (could be used for auto-computation of texture coordinates).

        prim.computeBoundingSphere = () => {

            this.geometryPool.computeBoundingSphere( prim.geometry.vertices.data );

        };

        // Copy just the geometry of a Prim into another geometry.

        prim.copyGometry = ( scale, pos, geo ) => {

            let vertices = this.util.copyArr( prim.geometry.vertices.data ),

            indices = this.util.copyArr( prim.geometry.indices.data ),

            texCoords = this.util.copyArr( prim.geometry.texCoords.data ),

            normals = this.util.copyArr( prim.geometry.normals.data ),

            tangents = this.util.copyArr( prim.geometry.tangents.data ),

            colors = this.util.copyArr( prim.geometry.tangents.data );

            this.geometryPool.scale( newVertices, scale );

            this.geometryPool.computeMove( newVertices, pos );

            if ( ! geo ) {

                geo = this.geometryPool.default( vertices, indices, texCoords, normals, tangents, colors );

            } else {

                geo.vertices = this.util.concatArr( geo.vertices, vertices );

                // INDICES

                for ( let i = 0; i < indices.length; i++ ) {

                    indices[ i ] += geo.vertices.length; // shift index by current length of vertices

                }

                geo.indices = this.util.contactArr( geo.indices, indices ),

                geo.texCoords = this.util.concatArr( geo.texCoords, texCoords ),

                geo.normals = this.util.concatArr( geo.normals, normals ),

                geo.tangents = this.util.concatArr( geo.tangents, tangents ),

                geo.colors = this.util.concatArr( geo.colors, colors );

            }

            return geo;

        };

        // Scale. Normally, we use matrix transforms to accomplish this.

        prim.resize = ( scale ) => { 

            this.geometryPool.computeScale( prim.geometry.vertices.data, scale );

        };

        // Move. Normally, we use matrix transforms to accomplish this.

        prim.move = ( pos ) => { 

            this.geometryPool.computeMove( prim.geometry.vertices.data, pos );

        };

        // Move to a specificed coordinate. Normally, we use matrix transforms to accomplish this.

        prim.moveTo = ( pos ) => {

            this.geometryPool.computeMove( [ 

                this.position[ 0 ] - pos[ 0 ],

                this.position[ 1 ] - pos[ 1 ],

                this.position[ 2 ] - pos[ 2 ]

            ] );

        }

        /** 
         * Fade the Prim in or out, optionally using a define equation. Note that 
         * We have to sort Prims back to front to get the fade to be 'transparent'.
         * @param {Boolean} direction if true, fade in, else fade out.
         * @param {Number} start starting alpha.
         * @param {Number} end ending alpha.
         * @param {Number} inc the incremental fade value.
         * @param {Function} eq (optional) fading equation (optional).
         */

        prim.setFade = ( start, end, inc, eq ) => {

            prim.fade.startAlpha = start;

            prim.fade.endAlpha = end;

            // Can only fade up or down to the Prim's material transparency.

            let defaultMaterial = prim.materials[ prim.matStarts[ 0 ][ 0 ] ];

            prim.alpha = start;

            // Increment.

            if ( Number.isFinite( inc ) ) {

                prim.fade.incr = inc;

            }

            // Fade equation.

            if ( eq ) {

                if ( end > start ) { // fadein

                    prim.fade.eq = this.util[ eq + 'In' ];

                } else { // fadeout

                    prim.fade.eq = this.util[ eq + 'Out' ];

                }

            } else {

                prim.fade.eq = this.util[ 'easeLinearIn' ];

            }

            console.log("PRIM NAME:" + prim.name + ' defaultMaterial transparency:' + defaultMaterial.transparency)

            // Save our current Shader as a default (automatically swapped back by s0).

            if ( prim.shader !== this.world.s0 ) {

                prim.defaultShader = prim.shader;

                // Move the Prim WITHOUT emitting a Prim add/remove event.

                prim.shader.movePrim( prim, this.world.s0 );

            }

        }

        // Prim name (arbitrary).

        prim.name = name;

        // Shader after the Prim has initialized.

        prim.defaultShader = shader; // Our post-fadein Shader

        prim.shader = this.world.s0; // fadein shader

        ///console.log(prim.name + " SHADER IS:" + prim.shader.name + " AND DEFAULT SHADER IS:" + prim.defaultShader.name )

        // Initially we aren't rendering.

        prim.rendering = false;

        // Type (must match type defined in Prim.typeList).

        prim.type = type;

        // UUID key similar to other program objects.

        prim.key = this.util.computeId();

        // Size in world coordinates.

        prim.dimensions = dimensions || this.vec5( 1, 1, 1, 0, 0, 0, 0 );

        // Amount of division of the Prim along each axis.

        prim.divisions = divisions || this.vec5( 1, 1, 1, 0, 0, 0 );

        // Prim position in World coordinates.

        prim.position = position || vec3.create();

        // Prim speed in World coordinates.

        prim.acceleration = acceleration || vec3.create();

        // Prim rotation on x, y, z axis.

        prim.rotation = rotation || vec3.create();

        // Prim angular rotation indicates circular velocity in x, y, z

        prim.angular = angular || vec3.create();

        // If orbiting, the radius to orbit around.

        prim.orbitRadius = 0.0;

        // Angular velocity in an orbit.

        prim.orbitAngular = 0.0;

        // Prim scale, default in World coordinates (adjusted after Geometry created).

        prim.scale = [ 1.0, 1.0, 1.0 ];

        // Visible from outside (counterclockwise winding) or inside (clockwise winding).

        prim.visibleFrom = this.geometryPool.OUTSIDE;

        // If this is set to true, ignore the texture material and use the Prim's color array to render.

        prim.useColorArray = useColorArray;

        // If this is set to true, use GL_TRIANGLES to draw. True by default.

        prim.drawTris = true;

        // If this is set to true, use GL_POINTS to draw (determined by prim.type = GeometryPool.typeList).

        prim.drawPoints = false;

        prim.pointSize = 2.0; // size if drawn

        // If this is set to true, use GL_LINES instad of GL_TRIANGLES to draw (determined by prim type = GeometryPool.typeList).

        prim.drawLines = false;

        /* 
         * Repeatedly apply the texture to each defined Face of the Prim (instead of wrapping around the Mesh).
         * If we have multiple textures, apply in succession.
         */

        prim.applyTexToFace = applyTexToFace;

        // Whether to use face normals for a Face of the prim.

        prim.useFaceNormals = false; // TODO: optional setting

        // Whether to include tangents 

        prim.useTangents = false; // TODO: optional setting

        // Information for making this Prim into a particle system

        prim.pSystem = pSystem;

        // Waypoints for scripted motion or timelines

        prim.animSystem = animSystem;

        // By default, Prims do not adjust to geolocation data. If ModelPool loads data, this may be set to true for TERRAIN and STARDOME objects.

        prim.geolocate = false;

        // Material array (stores textures as well).

        prim.materials = []; 

        // Set default material for the Prim (similar to OBJ format).

        let defaultName = this.materialPool.createDefaultName( prim.name );

        prim.materials[ defaultName ] = this.materialPool.setDefaultMaterial( prim, this.materialPool.createDefaultName( prim.name ), textureImages );

        // prim.defaultMaterial = prim.materials[ defaultName ];

        // Set Prim alpha from the active Material's transparency (opposite of prim.alpha === opacity).

        prim.alpha = 1.0 - prim.materials[ defaultName ].transparency; // typically 1.0

        // Use lighting in Shader.

        prim.useLighting = useLighting;

        // So the Prim can emit light.

        prim.glow = new Lights( this.glMatrix );

        // Note: fade equations in util.

        prim.fade = {

            startAlpha: 0.0, // starting opacity value
 
            endAlpha: prim.alpha, // ending opacity value

            incr: 0.002 // animation fade increment

        };

        // Store multiple sounds for one Prim.

        prim.audio = [];

        // Store multiple videos for one Prim.

        prim.video = [];

        // Parent Node.

        prim.parentNode = null;

        // Child Prim array.

        prim.children = [];

        // Execute geometry creation routine (which may be a file load).

        console.log( 'PrimFactory::computePrim(): Generating:' + prim.name + '(' + prim.type + ')' );

        // Geometry factory function, create empty WebGL Buffers.

        prim.geometry = new GeometryBuffer( prim.name, this.util, this.webgl );

        // Create Geometry data, or load Mesh data (may alter some of the above default properties).

        if ( modelFiles.length > 0 ) {

            // Some Prim types use both procedural and Model files (e.g. heightmaps).

            if ( prim.type === this.geometryPool.typeList.TERRAIN ) {

                this.geometryPool.getGeometry( prim, null, true, { pos:0, defaultMatStarts: true } );

            }

            // Get the model data.

            for ( let i = 0; i < modelFiles.length; i++ ) {

                this.geometryPool.getGeometry( prim, modelFiles[ i ], true, { pos: i, defaultMatStarts: false } );

            }

        } else {

            this.geometryPool.getGeometry( prim, null, true, { pos: 0, defaultMatStarts: true } );

        }


        // Prim timecheck. If it is failing to add to a Shader, will keep track of number of attempts.

        prim.failCount = 0;

        // Add to our 'quick list'

        ///////////////////////////////////////////this.prims.push( prim );

        // Add to our Asset Pool.

        this.addAsset( prim );

        // Return the completed Prim.

        return prim;

    }

    /** 
     * Create a Particle System from a Prim.
     * @param {Prim} The Prim to use to create the particle system.
     * @param {PsSystem} particle system configuration (PSystem class)
     */
    createParticleSystem ( prim ) {

        if ( ! prim.pSystem ) {

            console.error( 'PrimFactory::createParticleSystem(): no particle system defined' );

        }

        let ps = prim.pSystem;

        // Loop through the prim points, and shift them accd. to pSystem coordinates. If 
        // a function is defined (e.g. another Prim) use its coordinates, to place the Prim. 
        // scale so it works.

        if ( ps.coords ) {

            // Move the first Prim to the first coordinate.

            let geo = this.geometryPool.default();

            for ( let i = 1; i < ps.coords.length; i++ ) {

                geo = prim.copyGeometry( ps.coords.scale[ i ], ps.coords.pos[ i ], geo );

            }

        }

        // force geometry to update.

        let options = {};

        this.initPrimGeometry( prim, geo, options );


    }

    createAnimationSystem ( prim ) {

        if ( ! prim.animSystem ) {

            console.error( 'PrimFactory::createAnimationSystem(): no animation system defined' );

        }


    }

} // End of class.

// We put this here because of JSDoc(!).

export default PrimFactory;