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

        this.util = world.util;

        this.webgl = world.webgl;

        this.glMatrix = world.glMatrix;

        // Attach 1 copy of the Texture loader to this Factory.

        this.texturePool = world.texturePool, // new TexturePool( init, util, webgl );

        // Attach 1 copy of the Model loader to this Factory.

        this.modelPool = world.modelPool, // new ModelPool( init, util, webgl );

        // Attach 1 copy of LoadGeometry to this Factory.

        this.geometryPool = world.geometryPool, // new GeometryPool( init, util, glMatrix, webgl, this.modelPool, this.texturePool );

        this.materialPool = world.materialPool;

        this.prims = []; // Keep a reference to all created Prims here.

        /** 
         * EMITTER CALLBACKS
         */

        // Bind the callback for geometry initialization applied to individual prims (GeometryPool, Mesh, and ModelPool).

        this.util.emitter.on( this.util.emitter.events.GEOMETRY_READY, 

            ( prim, key, pos ) => {

                this.initPrimGeometry( prim, this.modelPool.keyList[ key ], pos );

                prim.shader.addPrim ( prim );

        } );

         // Bind Prim callback for a new material applied to individual Prims.

        this.util.emitter.on( this.util.emitter.events.MATERIAL_READY, 

            ( prim, key, pos) => {

                this.initPrimMaterial( prim, this.materialPool.keyList[ key ], pos );

                prim.shader.addPrim ( prim );

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_2D_READY, 

            ( prim, key, pos ) => {

                this.initPrim2dTexture( prim, this.texturePool.keyList[ key ], pos );

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_2D_ARRAY_READY, 

            ( prim, key ) => {

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_3D_READY, 

            ( prim, key ) => {

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a new texture loaded .(TexturePool).

        this.util.emitter.on( this.util.emitter.events.TEXTURE_CUBE_MAP_READY, 

            ( prim, key ) => {

                prim.shader.addPrim( prim );

        } );

        // Bind Prim callback for a Shader accepting a Prim for rendering.

        this.util.emitter.on( this.util.emitter.events.PRIM_ADDED_TO_SHADER, 

            ( prim ) => {

                // If there is no material description, add the default.

                if ( prim.materials.length < 1 ) {

                    prim.setMaterial( this.util.DEFAULT_KEY );

                }

        } );

    } // end of constructor


    /** 
     * Create a large coordinate data array with data for multiple Prims.
     * When a Prim is made, we store a reference in the this.prims[] 
     * array. So, to make one, we just concatenate their  
     * vertices. Use to send multiple prims sharing the same Shader.
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
    initPrim2dTexture ( prim, textureObj, pos ) {

        prim.textures[ pos ] = textureObj;

    }

    /** 
     * Prims don't contrl their initialization, so let the factory do it. This standard structure 
     * is used to return values from proceedural geometry and OBJ wavefront files.
     * @param {prim} prim the Prim.
     * @param {String} key the identifying the geometry in the ModelPool.
     * @param {Object} coords coordinates object returned by procedural, Mesh, or ModelPool.
     * { 
     *   vertices: vertices, 
     *   indices: indices,
     *   normals: normals, 
     *   texCoords: texCoords, 
     *   tangents: tangents
     *   type: type.
     *   path: file path.
     *   usemtl: util.DEFAULT_KEY ('default') or from OBJ file.
     * };
     */
    initPrimGeometry ( prim, coords, pos ) {

        /* 
         * It is possible to get a usemtl command from an OBJ file, without a corresponding material file. 
         * If so, check our MaterialPool for it.
         */

        if ( coords.usemtl !== this.util.DEFAULT_KEY ) {

            // If we don't find it, don't worry. Either added with a 'mtllib' or leave it at the default material.

            // TODO: confirm that we can grab a different material from the MaterialPool...

            let material = this.materialPool.nameInList( coords.usemtl );

            if ( prim.materials.length > 0 && prim.materials[ 0 ].name === this.util.DEFAULT_KEY ) {

                prim.materials[ 0 ] = material; // replace default, if we loaded a material after initialization.

            }

        }

        // Update vertices if they were supplied.

        prim.updateVertices( coords.vertices );

        // Compute bounding box.

        prim.boundingBox = prim.computeBoundingBox( prim.geometry.vertices.data );

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

        console.log("checking buffer data for " + prim.name )

        /////////prim.geometry.checkBufferData();

    }


    /** 
     * Add ma material description to the Prim.
     * Note: a single .mtl file may add multiple materials.
     * @param {Prim} prim the prim.
     * @param {Material} material the material object.
     * @param {Number} pos starting position in array (usually 0).
     */
    initPrimMaterial ( prim, material, pos ) {

        //prim.materials.push( material );

        // Material is returned as an associative array, since multiple materials may be found in one .mtl file.

        if ( prim.materials.length > 0 && prim.materials[ 0 ].name === this.util.DEFAULT_KEY ) {

            prim.materials[ 0 ] = material; // replace default, if we loaded a material after initialization.

        } else {

            prim.materials.push( material );

        }

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

            let z = -5; // TODO: default position relative to camera! !!! CHANGE??????

            // Translate.

            vec3.add( p.position, p.position, p.acceleration );

            // Translate to default position.

            mat4.translate( mvMatrix, mvMatrix, [ p.position[ 0 ], p.position[ 1 ], z + p.position[ 2 ] ] );

            // Rotate.

            vec3.add( p.rotation, p.rotation, p.angular );

            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 0 ], [ 1, 0, 0 ] );

            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 1 ], [ 0, 1, 0 ] );

            mat4.rotate( mvMatrix, mvMatrix, p.rotation[ 2 ], [ 0, 0, 1 ] );

            // TODO: rotate second for orbiting.
            // TODO: rotate (internal), translate, rotate (orbit)

            return mvMatrix;

        };

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


        prim.setMaterial = ( name, colorMult = 1, ambient = [ 0.1, 0.1, 0.1 ], diffuse = [ 0, 0, 0 ], specular = [ 1, 1, 1, 1 ], shininess = 250, specularFactor = 1, transparency = 1.0, illum = 1 ) => {

            p.materials.push( {

                colorMult: colorMult, 

                ambient: ambient,  // ambient reflectivity

                diffuse: diffuse,        // diffuse reflectivity

                specular: specular,    // specular reflectivity

                shininess: shininess,              // surface shininess

                specularFactor: specularFactor,           // specular factor

                transparency: transparency,   // transparency, 0.0 - 1.0

                illum: illum,            // Illumination model 0-10, color on and Ambient on

                name: name,

                texture: null // texture specified by material, points to the .textures[] array.

            } );

        }

        // We don't have a .setMaterial - set directly in loadModel.updateMateria()

        // Update vertices (no re-compute available).

        prim.updateVertices = ( vertices ) => {

            let geo = p.geometry;

            if ( vertices && vertices.length ) {

                geo.setVertices( vertices );

            }

        }

        // update indices (no re-compute available).

        prim.updateIndices = ( indices ) => {

            let geo = p.geometry;

            if ( indices && indices.length ) {

                geo.setIndices( indices );

            }

        }

        // Update or re-compute normals.

        prim.updateNormals = ( normals ) => {

            let geo = p.geometry;

            if ( normals && normals.length ) {

                geo.setNormals( normals );

            } else {

                console.log("Prim::updateNormals():" + p.name + ' recalculating normal coordinates' );

                geo.setNormals( this.geometryPool.computeNormals( geo.vertices.data, geo.indices.data, [], p.useFaceNormals ) );

            }

        }

        // Update or re-compute texture coordinates.

        prim.updateTexCoords = ( texCoords ) => {

            let geo = p.geometry;

            if ( texCoords && texCoords.length > 0 ) {

                geo.setTexCoords( texCoords );

            } else if ( geo.numTexCoords() !== geo.numVertices() ) {

                console.log("Prim::updateTexCoords():" + p.name + ' recalculating texture coordinates' );

                geo.setTexCoords( this.geometryPool.computeTexCoords( geo.vertices.data ) );

            }

        }

        // Update or re-compute tangents.

        prim.updateTangents = ( tangents ) => {

            let geo = p.geometry;

            if ( tangents && tangents.length ) {

                geo.setTangents( tangents );

            } else {

                console.log("Prim::updateTangents():" + p.name + ' recalculating tangent coordinates' );

                geo.setTangents( this.geometryPool.computeTangents ( geo.vertices.data, geo.indices.data, geo.normals.data, geo.texCoords.data, [] ) );

            }

        }

        // Update or re-compute colors.

        prim.updateColors = ( colors ) => {

            let geo = p.geometry;

            if ( colors && colors.length ) {

                geo.setColors( colors );

            } else {

                console.log("Prim::updateColors():" + p.name + ' recalculating color coordinates' );

                geo.setColors( this.geometryPool.computeColors( geo.normals.data, [] ) );

            }

        };

        // Compute the bounding box.

        prim.computeBoundingBox = () => {

            this.geometryPool.computeBoundingBox( prim.geometry.vertices );

        };

        // Compute the bounding sphere.

        prim.computeBoundingSphere = () => {

            this.geometryPool.computeBoundingSphere( prim.geometry.vertices );

        };

        // Scale. Normally, we use matrix transforms to accomplish this.

        prim.scale = ( scale ) => { 

            this.geometryPool.scale ( scale, prim.geometry.vertices );

        };

        // Move. Normally, we use matrix transforms to accomplish this.

        prim.move = ( pos ) => { 

            this.geometryPool.computeMove( scale, prim.geometry.vertices );

        };

        // Move to a specificed coordinate.

        prim.moveTo = ( pos ) => {

            this.geometryPool.move( [ 

            this.position[ 0 ] - pos[ 0 ],

            this.position[ 1 ] - pos[ 1 ],

            this.position[ 2 ] - pos[ 2 ]

            ] );

        }

        // Give the Prim a unique Id.

        prim.id = this.util.computeId();

        // Shader object for adding/removing from display list.

        prim.shader = prim.defaultShader = shader;

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

        // The Prim orbit defines a center that the object orbits around, and orbital velocity.

        prim.orbitRadius = 0.0;

        prim.orbitAngular = 0.0;

        // Prim scale, in World coordinates.

        prim.scale = 1.0;

        // Set prim lighting (use Shader-defined lighting).

        prim.light = new Lights( this.glMatrix );

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

        prim.useTangents = true; // TODO:///////CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // Waypoints for scripted motion or timelines.

        prim.waypoints = [];

        // Material files.

        prim.materials = [];

        // Store multiple textures for one Prim.

        prim.textures = [];

        // Store multiple sounds for one Prim.

        prim.audio = [];

        // Store multiple videos for one Prim.

        prim.video = [];

        // Parent Node.

        prim.parentNode = null;

        // Child Prim array.

        prim.children = [];

        // Set default Prim material (can be altered by .mtl file).

        //prim.setMaterial( 'default' ); // TODO::::::::::::::::::::ONLY DO IF WE DON'T have a material file.

       // Execute geometry creation routine (which may be a file load).

       console.log( 'Generating Prim:' + prim.name + '(' + prim.type + ')' );

        // Geometry factory function, create empty WebGL Buffers.

        prim.geometry = new GeometryBuffer( prim.name, this.util, this.webgl );

        // Create Geometry data, or load Mesh data (may alter some of the above default properties).

        this.geometryPool.getGeometries( prim, modelFiles );

        // Get the static network textures async (use emitter to decide what to do when each texture loads).

        this.texturePool.getTextures( prim, textureImages, true, false ); // assume cacheBust === true, mimeType determined by file extension.

        // Push into our list of all Prims. Shaders keep a local list of Prims they are rendering.

            // TODO: DEBUG REMOVE
            if ( prim.name === 'capsule' ) {

                window.capsule = prim; //////////////TODO: remove
            }

            if ( prim.name === 'TORUS1' ) {

                window.torus = prim;

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