import Map2d from './map2d';
import Map3d from './map3d';
import Mesh from  './mesh';
import Lights from './lights';
import GeometryPool from './geometry-pool';
import TexturePool from './texture-pool';
import ModelPool from './model-pool';
import AudioPool from './audio-pool';
import GeometryBuffer from './geometry-buffer';

'use strict'

class PrimFactory {

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
     * prim.textures      = array of textures used by this prim.
     * prim.materials     = materials used by this prim.
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

        console.log( 'in PrimFactory class' );

        // Keep a copy of the World for up-communication.

        this.world = world,

        this.util = world.util,

        this.webgl = world.webgl,

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

        this.prims = [];

        /** 
         * ---------------------------------------
         * EMITTER CALLBACKS
         * ---------------------------------------
         */

        // Bind the callback for geometry initialization applied to individual prims (GeometryPool, Mesh, and ModelPool).

        this.util.emitter.on( this.util.emitter.events.GEOMETRY_READY, 

            ( prim, key, pos ) => {

                this.initPrimGeometry( prim, this.modelPool.keyList[ key ], pos );

                // Check if complete, add if it is...

                prim.shader.addPrim ( prim );

        } );

         // Bind Prim callback for a new material applied to individual Prims.

        this.util.emitter.on( this.util.emitter.events.MATERIAL_READY, 

            ( prim, key, materialName ) => {

                this.initPrimMaterial( prim, this.materialPool.keyList[ key ], materialName ); // associative array

                // Check if complete, add if it is...

                prim.shader.addPrim ( prim );

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_2D_READY, 

            ( prim, key, pos ) => {

                this.initPrimTexture( prim, this.texturePool.keyList[ key ], pos );

                // Check if complete, add if it is...

                prim.shader.addPrim( prim );

        } );


        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_3D_READY, 

            ( prim, key ) => {

                this.initPrimTexture3d( prim, this.texturePool.keyList[ key ], pos );

                // Check if complete, add if it is...

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_CUBE_MAP_READY, 

            ( prim, key ) => {

                this.initPrimTextureCubeMap( prim, this.texturePool.keyList[ key ], pos );

                // Check if complete, add if it is...

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a Shader accepting a Prim for rendering.

        this.util.emitter.on( this.util.emitter.events.PRIM_ADDED_TO_SHADER, 

            ( prim ) => {

                // post-addition events.

                prim.alpha = 0.0;

                prim.setFade( 0, 1 );

        } );

    } // end of constructor


    /** 
     * Create a large coordinate data array with data for multiple Prims.
     * When a Prim is made, we store a reference in the this.prims[] 
     * array. So, to make one, we just concatenate their  
     * vertices. Use to send multiple prims sharing the same Shader.
    // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
    // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
    // TODO: http://max-limper.de/tech/batchedrendering.html
     * @param {glMatrix.vec3[]} vertices
     * @returns {glMatrix.vec3[]} vertices
     */
    setVertexData ( vertices ) {

        vertices = [];

        for ( let i in this.prims ) {

            vertices = vertices.concat( this.prims[ i ].geometry.vertices.data );

        }

        return vertices;

    }

    /** 
     * get the big array with all index data. Use to 
     * send multiple prims sharing the same Shader.
     * @param {Array} indices the indices to add to the larger array.
     * @returns {Array} the indices.
     */
    setIndexData ( indices ) {

        indices = [];

        for ( let i in this.prims ) {

            indices = indices.concat( this.prims[ i ].geometry.indices.data );

        }

        return indices;

    }

    /** 
     * Add a new texture to the Prim (callback for TEXTURE_2D_READY event).
     * @param {Prim} prim the prim to be updated.
     * @param {TextureObj} textureObj the texture object returned from TexturePool.
     * @param {Number} pos a position to write the texture to.
     */
    initPrimTexture ( prim, textureObj, pos ) {

        prim.textures[ pos ] = textureObj;

        /* 
         * Check materials files, and link texture to the files. We do the reverse in initPrimMaterial()
         * NOTE: prim.materials[ i ] initially has the FILE PATH of the texture. If we fail to find a 
         * WebGL texture the file path will remain as a debugging string.
         */

        for ( let i in prim.materials ) {

            let material = prim.materials[ i ];

            let tex = material[ textureObj.textureUse ];

            //////////console.log( 'PrimFactory::initPrimTexture():finding texture for:' + material.name + ' to:' + prim.name );
            ////////console.log( 'TEX:' + tex + ' instanceof WebGLTexture:' + ( tex instanceof WebGLTexture) )

            if ( ! ( tex instanceof WebGLTexture ) ) {

                //////////console.log( 'PrimFactory::initPrimTexture():matching texture ' + material.name + ' to:' + prim.name );

                material[ textureObj.textureUse ] = textureObj.texture;

            }

        }

    }

    /** 
     * Add a new 3d texture to the Prim.
     */
    initPrimTexture3d( prim, textureObj, pos ) {

        prim.textures[ pos ] = textureObj;

    }

    /** 
     * Add a new cubemap texture to the Prim
     */
    initPrimTextureCubeMap( prim, textureObj, pos ) {

        prim.textures[ pos ] = textureObj;

    }

    /** 
     * Add ma material description to the Prim.
     * Note: a single .mtl file may add multiple materials.
     * @param {Prim} prim the prim.
     * @param {Material} material the material object.
     * @param {Number} pos starting position in array (usually 0).
     */
    initPrimMaterial ( prim, material, materialName ) {

        // Material is returned as an associative array, since multiple materials may be found in one .mtl file.

        // If we have a default, remove it, since we have a non-default material.

        if( prim.materials [ this.util.DEFAULT_KEY ] ) {

            console.log("REMOVING DEFAULT MATERIAL")

            this.util.removeObjMember( prim.materials, this.util.DEFAULT_KEY );

        }

        /* 
         * If the material already has an entry, it was put there parsing the 
         * OBJ file. so pull the 'start' value from it, and replace with 
         * the full material data. Otherwise, add material - this.initPrim() 
         * will add the start position for the material later.
         */

        if ( prim.materials[ materialName ] ) {

            ///////console.log('initPrimMaterial():found existing material ' + materialName + ' with start:' + prim.materials[ materialName ].starts )

            material.starts = prim.materials[ materialName ].starts;

        }

        ///////////console.log( 'initPrimMaterial():adding material:' + materialName + ' for prim:' + prim.name )

        prim.materials[ materialName ] = material;

        /* 
         * Check the texture files to see if we can map a texture to a material declaration.
         * We use the list of possible texture use types in MaterialPool. 
         * NOTE: unlikely, since material file is read for textures!
         *
         * NOTE: Prim.setMaterial() is used to create a default material in Prim.createPrim();
         */

        for ( let key in this.materialPool.texturePositions ) {

            // Get the keys, map_Kd, map_Ka, map_Ks 

            //console.log( 'PrimFactory::initPrimMaterial(): material texture ' + key + ' for prim:' + prim.name + ' present...' );
            //console.log( 'PRIM.TEXTURES LENGTH IS A:' + prim.textures.length )

            for ( let  j = 0; j < prim.textures.length; j++ ) {

                if ( prim.textures[ j ][ key ] && ( prim.textures[ j ][ key ].texture instanceof WebGLTexture ) ) {

                    console.log( 'PrimFactory::initPrimMaterial(): matching material:' + material.name + ' texture type:' + key + ' with prim.textures:' + j );

                    material[ i ] = prim.textures[ j ][ key ].texture;

                }

            }

        }

        // Finally, set a default material for Shaders that only use one material. Pick the material with the smallest 'start'.

        prim.defaultMaterial = material;

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
    initPrimGeometry ( prim, coords, pos ) {

        /* 
         * Options contain material name declarations, groups, smoothing groups, etc. 
         * Their value is their start in coords.vertices.
         */

         if ( coords.options ) {

            window.coords = coords.options;

            // Object, Group, SmoothingGroup starts.

            prim.objects = coords.options.objects;

            prim.groups = coords.options.groups;

            // Material starts.

            for ( var i in coords.options.materials ) {

                /* 
                 * If the material exists in prim.materials under its name (meaning that it was loaded 
                 * by MaterialPool, add the position start in coords.options.materials[i] to it.
                 * Otherwise, create a empty object with the information.
                 * NOTE: Prim.setMaterial() is used to create a default material in Prim.createPrim();
                 */

                if ( ! prim.materials[ i ] ) {

                    console.log('initPrimGeometry():creating new material for ' + i )

                    prim.materials[ i ] = { starts: [] };

                }

                // Add the start position for this material.

                console.log("i:" + i + ' coords.options.materials[i]:' + coords.options.materials[i])
                prim.materials[ i ].starts.push( coords.options.materials[ i ] );

                // TODO: see if we can bind a texture to it.

            }

         }

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

        // Colors aren't supplied by OBJ format, so re-compute.

        prim.updateColors();

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
     * @param {String[]} textureImagea array of the paths to images used to create a texture (one Prim can have several).
     * @param {glMatrix.vec4[]|glMatrix.vec4} color the default color(s) of the object, either a single color or color array.
     * @param {Boolean} applyTexToFace if true, apply texture to each face, else apply texture to the entire object.
     * @param {String[]} modelFiles path to model OBJ (and indirectly, material files ) used to define non-procedural Mesh Prims.
     */
    createPrim ( 

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

        colors = null,  // color array (may be blank)

        applyTexToFace = false,

        modelFiles = [] // heightMap file (HEIGHTMAP) or array of coordinate and material files (MESH)

        ) { // function to execute when prim is done (e.g. attach to drawing list shader).

        const vec3 = this.glMatrix.vec3;

        const mat4 = this.glMatrix.mat4;

        if ( ! this.geometryPool.checkType( type ) ) {

            console.error( 'Prim::createPrim(): unsupported Prim type:' + type );

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

            //let pov = this.world.getPOV();

            // Adds View - Translate to World default POV (position).

            // NOTE: THIS WORLD TRANSLATION WAS FORMERLY HERE. TEST ON VIVE!!!!!!!!

            //mat4.translate( mvMatrix, mvMatrix, pov.position );

            mat4.translate( mvMatrix, mvMatrix, p.position );

            //mat4.translate( mvMatrix, mvMatrix, [ pov.position[ 0 ] + p.position[ 0 ], pov.position[ 1 ] + p.position[ 1 ], pov.position[ 2 ] + p.position[ 2 ] ] );

            // Set the Model matrix.

            prim.setM( mvMatrix );

            return mvMatrix;

        };

        /** 
         * Back out the translation from the Model-View matrix, when we need just the Model.
         * @param {glMatrix.mat4} mvMatrix model-view matrix.
         * @returns {glMatrix.mat4} the altered model-view matrix.
         */
        prim.setM = ( mMatrix ) => {

            // Internal Prim Translate.

            vec3.add( p.position, p.position, p.acceleration );

            // Rotate.

            vec3.add( p.rotation, p.rotation, p.angular );

            mat4.rotate( mMatrix, mMatrix, p.rotation[ 0 ], [ 1, 0, 0 ] );

            mat4.rotate( mMatrix, mMatrix, p.rotation[ 1 ], [ 0, 1, 0 ] );

            mat4.rotate( mMatrix, mMatrix, p.rotation[ 2 ], [ 0, 0, 1 ] );

            mat4.scale( mMatrix, mMatrix, p.scale );

            return mMatrix;

        }

        /** 
         * Set the Prim as a glowing object. Global Lights 
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

            //p.materials[ name ] = this.materialPool.default( name, ambient, diffuse, specular, 

            // specularExponent, sharpness, refraction, transparency, illum, map_Kd );

            let material = this.materialPool.default( name, ambient, diffuse, specular, 

                specularExponent, sharpness, refraction, transparency, illum, map_Kd );

            // Check for links in Prim.textures.

            this.initPrimMaterial ( prim, material, material.name );

            return material; // use to set default material.

        };

        // We don't have a .setMaterial - set directly in loadModel.updateMateria()

        // Update vertices (no re-compute available).

        prim.updateVertices = ( vertices ) => {

            let geo = p.geometry;

            if ( vertices && vertices.length ) {

                geo.setVertices( vertices );

            }

        };

        // update indices (no re-compute available).

        prim.updateIndices = ( indices ) => {

            let geo = p.geometry;

            if ( indices && indices.length ) {

                geo.setIndices( indices );

            }

        };

        // Update or re-compute normals.

        prim.updateNormals = ( normals ) => {

            let geo = p.geometry;

            if ( normals && normals.length ) {

                geo.setNormals( normals );

            } else {

                //////////console.log("Prim::updateNormals():" + p.name + ' recalculating normal coordinates' );

                geo.setNormals( this.geometryPool.computeNormals( geo.vertices.data, geo.indices.data, [], p.useFaceNormals ) );

            }

        };

        // Update or re-compute texture coordinates.

        prim.updateTexCoords = ( texCoords ) => {

            let geo = p.geometry;

            if ( texCoords && texCoords.length > 0 ) {

                geo.setTexCoords( texCoords );

            } else if ( geo.numTexCoords() !== geo.numVertices() ) {

                //////////console.log("Prim::updateTexCoords():" + p.name + ' recalculating texture coordinates' );

                geo.setTexCoords( this.geometryPool.computeTexCoords( geo.vertices.data ) );

            }

        };

        // Update or re-compute tangents.

        prim.updateTangents = ( tangents ) => {

            let geo = p.geometry;

            if ( tangents && tangents.length ) {

                geo.setTangents( tangents );

            } else {

                /////////console.log("Prim::updateTangents():" + p.name + ' recalculating tangent coordinates' );

                geo.setTangents( this.geometryPool.computeTangents ( geo.vertices.data, geo.indices.data, geo.normals.data, geo.texCoords.data, [] ) );

            }

        };

        // Update or re-compute colors.

        prim.updateColors = ( colors ) => {

            let geo = p.geometry;

            if ( colors && colors.length ) {

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

        // Scale. Normally, we use matrix transforms to accomplish this.

        prim.scale = ( scale ) => { 

            this.geometryPool.scale ( scale, prim.geometry.vertices.data );

        };

        // Move. Normally, we use matrix transforms to accomplish this.

        prim.move = ( pos ) => { 

            this.geometryPool.computeMove( scale, prim.geometry.vertices.data );

        };

        // Move to a specificed coordinate.

        prim.moveTo = ( pos ) => {

            this.geometryPool.move( [ 

            this.position[ 0 ] - pos[ 0 ],

            this.position[ 1 ] - pos[ 1 ],

            this.position[ 2 ] - pos[ 2 ]

            ] );

        }

        /** 
         * Fade the Prim in or out, optionally using a define equation.
         * @param {Boolean} direction if true, fade in, else fade out.
         * @param {Number} start starting alpha.
         * @param {Number} end ending alpha.
         * @param {Function} eq (optional) fading equation.
         */

        prim.setFade = ( start, end, eq ) => {

            prim.fade.startAlpha = start;

            prim.fade.endAlpha = end;

            prim.alpha = start;

            if ( eq ) prim.fade.eq = eq;

            // Save our current Shader as a default (swapped back by s0).

            if ( prim.shader !== this.world.s0 ) {

                prim.defaultShader = prim.shader;

                // Move the Prim WITHOUT emitting a Prim add/remove event.

                prim.shader.movePrim( prim, this.world.s0 );

            }

        }

        // Give the Prim a unique Id.

        prim.id = this.util.computeId();

        // Shader after the Prim has initialized.

        ///////////////////////prim.shader = prim.defaultShader = shader;

        prim.shader = this.world.s0; // Fadein shader

        prim.defaultShader = shader;

        // Name (arbitrary).

        prim.name = name;

        // Type (must match type defined in Prim.typeList).

        prim.type = type;

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

        // Set Prim lighting (use Shader-defined lighting).

        prim.light = new Lights( this.glMatrix );

        // Prim's overall opacity at creation (default is invisible).

        prim.alpha = 1.0;

        // Note: fade equations in util.

        prim.fade = {

            startAlpha: 0.0,

            endAlpha: 1.0

        };

        // Visible from outside (counterclockwise winding) or inside (clockwise winding).

        prim.visibleFrom = this.geometryPool.OUTSIDE;

        /* 
         * Repeatedly apply the texture to each defined Face of the Prim (instead of wrapping around the Mesh).
         * If we have multiple textures, apply in succession.
         */

        prim.applyTexToFace = applyTexToFace;

        // Whether to use face normals for a Face of the prim.

        prim.useFaceNormals = false; //////////////////CHANGE SHOULD BE SET OPTIONALLY !!!!!!!!!!!!!!!!!!!!!

        // Whether to include tangents 

        prim.useTangents = false; // TODO:///////CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // Waypoints for scripted motion or timelines.

        prim.waypoints = [];

        // Store multiple textures for one Prim (must be defined for prim.materials to work).

        prim.textures = [];

        // Material array.

        prim.materials = [];

        // Set default material for the Prim (similar to OBJ format).

        prim.defaultMaterial = prim.setMaterial( this.util.DEFAULT_KEY );

        // Store multiple sounds for one Prim.

        prim.audio = [];

        // Store multiple videos for one Prim.

        prim.video = [];

        // Parent Node.

        prim.parentNode = null;

        // Child Prim array.

        prim.children = [];

       // Execute geometry creation routine (which may be a file load).

       console.log( 'Generating Prim:' + prim.name + '(' + prim.type + ')' );

        // Geometry factory function, create empty WebGL Buffers.

        prim.geometry = new GeometryBuffer( prim.name, this.util, this.webgl );

        // Create Geometry data, or load Mesh data (may alter some of the above default properties).

        this.geometryPool.getGeometries( prim, modelFiles );

        /* 
         * Add a default texture to all Prims so Shaders always have something to 
         * bind, even if they are not used. On slower systems, WebGL can generate errors 
         * due to finite time needed to generate mipmaps after the WebGL texture is first created.
         */

        prim.textures[ 0 ] = this.texturePool.getDefault();

        // Get textures assigned directly ( .mtl files may assign others ) in the createPrim() call.

        this.texturePool.getTextures( prim, textureImages, true, false, this.materialPool.defaultTextureMap ); // assume cacheBust === true, mimeType determined by file extension.

        // Push into our list of all Prims. Shaders keep a local list of Prims they are rendering.

            // TODO: DEBUG REMOVE
            if ( prim.name === 'capsule' ) {

                window.capsule = prim; //////////////TODO: remove
            }

            if ( prim.name === 'TORUS1' ) {

                window.torus = prim;

            }

            if ( prim.name === 'teapot' ) {

                window.teapot = prim;

            }

            if ( prim.name === 'objfile' ) {

                window.objfile = prim;

            }

            if ( prim.name === 'cubespheretransparent' ) {

                window.cubetrans = prim;

            }

            if ( prim.name === 'TestTearDrop' ) {

                window.teardrop = prim;

            }

            if ( prim.name === 'skydome' ) {

                window.skydome = prim;

            }

        this.prims.push( prim );

        return prim;

    }

    /** 
     * Convert a Prim to its JSON equivalent
     * @param {Prim} prim the object to stringify.
     */
    toJSON ( prim ) {

        return JSON.stringify( prim );

    }

} // End of class.

// We put this here because of JSDoc(!).

export default PrimFactory;