import Map2d from './map2d';
import Map3d from './map3d';
import Mesh from  './mesh';
import Lights from './lights';
import GeometryPool from './geometry-pool';
import TexturePool from './texture-pool';
import ModelPool from './model-pool';
import AudioPool from './audio-pool';
import ShaderObj from './shader-obj';

'use strict'

class Primv {

    /** 
     * @class
     * Create an standard 3d object.
     * @constructor
     * @param {Boolean} init initialization.
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
     * @param {Boolean} applyTexToFace if true, apply texture to each face, else apply texture to 
     * the entire object.
     * @param {String[]} modelFiles path to model and material files used to define non-geometric Prims.
     */

    constructor ( 

        init, 

        world, 

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

        modelFiles = [] // heightMap file (HEIGHTMAP) or array of coordinate and material files (MESH) ) {

    ) {

        // Store references to program-wide objects.

        this.world = world, 

        this.webgl = world.webgl, 

        this.util = webgl.util, 

        this.glMatrix = webgl.glMatrix, 

        this.geometryPool = world.geometryPool,

        this.texturePool  = world.texturePool, 

        this.modelPool    = world.modelPool;

        // Prim geometry created procedurally, or by loading a Wavefront .obj file (may alter some of the above default properties).

        if ( this.geometryPool.checkType( type ) ) {

            // Set local constants for initialization.

            const vec3 = this.glMatrix.vec3;

            const mat4 = this.glMatrix.mat4,

            const vec5 = this.geometry.vec5;

            // Name (arbitrary).

            this.name = name;

            // Type (must match type defined in GeometryPool.typeList).

            this.type = type;

            // Give the Prim a unique Id.

            this.id = this.util.computeId();

            // Default messages.

            console.log( 'Generating Prim:' + this.name + '(' + this.type + ')' + ' id:' + this.id );

            // Prim scale, in World coordinates.

            this.scale = 1.0;

            // Waypoints for scripted motion or timelines.
            // TODO: this should be a WayPoints object

            this.wayPoints = [];

            // Parent Node.

            this.parentNode = null;

            // Child Prim array.

            this.children = [];

            // Whether to use face normals for a Face of the prim.

            this.useFaceNormals = false; //////////////////CHANGE SHOULD BE SET OPTIONALLY !!!!!!!!!!!!!!!!!!!!!

            // Whether to include tangents 

            this.useTangents = true; // TODO:///////CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!

            // Store models.

            this.models = [];

            // Store multiple textures for one Prim (paths replaced with Texture objects).

            this.textures = [];

            // Store multiple sounds for one Prim.

            this.audio = [];

            // Store multiple videos for one Prim.

            this.video = [];

            // Array of model files (paths replaced with Geometry objects)

            this.models = modelFiles;

            /* 
             * Repeatedly apply the texture to each defined Face of the Prim (instead of wrapping around the Mesh).
             * If we have multiple textures, apply in succession.
             */

            this.applyTexToFace = false;

            // DEFAULTS

            // The Prim orbit defines a center that the object orbits around, and orbital velocity.

            this.orbit = {

                radius: 0.0,

                angular: 0.0

            };

        // Size in world coordinates.

        this.dimensions = dimensions;

        // Amount of division of the Prim along each axis.

        this.divisions = divisions;

        // Prim Position in World coordinates.

        this.position = position;

        // Prim acceleration in World coordinates.

        this.acceleration = acceleration;

        // Prim rotation on x, y, z axis, in World coordinates.

        this.rotation = rotation;

        // Prim angular velocity in x, y, z, in World coordinates.

        this.angular = angular;

        // Shader object for adding/removing from display list.

        this.shader = this.defaultShader = shader;

        // Set prim's internal lighting (uses custom Light object, Shader-defined lighting).

        this.lightList[ 0 ] = new Lights( this.glMatrix );

        // Create empty WebGL Buffers.
        // TODO: ShaderObj = GeoBuffer

        this.geometry = new ShaderObj( this.name, this.util, this.webgl );

        // Prim is visible from outside (counterclockwise winding) or inside (clockwise winding).

        this.visibleFrom = this.geometryPool.OUTSIDE;

        // Get our geometry.

        //TODO: change to
        //TODO: get default model if type===MESH, and modelFiles not supplied.
        //this.geometryPool.getGeometries( prim, true, false, modelFiles );

        this.geometryPool.getGeometry( type, prim, 0 ); // assume cacheBust === true, mimeType determined by file extension.

        // TODO: EACH 'POOL' should have a default value accessible by .getDefault()

        this.material = this.materialPool.getDefault();

        // Get the static network textures async (use emitter to decide what to do when each texture loads).

        //TODO: change to:
        //TODO: get default texture if textureImages not supplied.
        //this.texturePool.getTextures( prim, true, false, textureImages );

        this.texturePool.getTextures( prim, textureImages, true, false ); // assume cacheBust === true, mimeType determined by file extension.

        // Set default Prim material (can be altered by .mtl file).

        prim.setMaterial( 'default' );


        } else {

            console.error( 'Prim::createPrim(): unsupported Prim type:' + type );

        }

    } // end of constructor

    /** 
     * Set the Shader used for rendering. Only one Shader may be 
     * used at a time.
     */
    setShader ( shader ) {

         this.shader = shader;

    };


    /** 
     * Update the model-view matrix with position, translation, rotation, and orbital motion for individual Prims.
     * @param {glMatrix.mat4} mvMatrix model-view matrix.
     * @returns {glMatrix.mat4} the altered model-view matrix.
     */
     setMV ( mvMatrix ) {

        // TODO: translate everything.

        let z = -5; // TODO: default position relative to camera! !!! CHANGE?????? THIS IS WHY IT IS BEHIND US!!!!

        // Translate.

        vec3.add( this.position, this.position, this.acceleration );

        // Translate to default position.

        mat4.translate( mvMatrix, mvMatrix, [ this.position[ 0 ], this.position[ 1 ], z + this.position[ 2 ] ] );

        // Rotate (we keep incrementing the rotation here.

        // TODO: MAKE ROTATION SEPARATE.

        vec3.add( this.rotation, this.rotation, this.angular );

        mat4.rotate( mvMatrix, mvMatrix, this.rotation[ 0 ], [ 1, 0, 0 ] );

        mat4.rotate( mvMatrix, mvMatrix, this.rotation[ 1 ], [ 0, 1, 0 ] );

        mat4.rotate( mvMatrix, mvMatrix, this.rotation[ 2 ], [ 0, 0, 1 ] );

        // TODO: rotate second time for orbiting, translate->rotate.
        // TODO: rotate (internal), translate, rotate (orbit)

        return mvMatrix;

    }

    /* 
     * If the Prim has a local light (e.g. it glows) set it here.
     * @param {String} id the key for the light
     I @param {glMatrix.vec3} direction direction vector for light.
     * @param {glMatrix.vec4} color color of the light.
     */
    setLight ( key, direction, color ) {

        this.lightList[ key ].direction = direction,

        this.lightList[ key ].color = color;

    }

    /** 
     * Set the current material for the prim.
     */
    setMaterial = ( id, name, colorMult = 1, ambient = [ 0.1, 0.1, 0.1 ], diffuse = [ 0, 0, 0 ], specular = [ 1, 1, 1, 1 ], shininess = 250, specularFactor = 1, transparency = 1.0, illum = 1 ) => {

        this.materialList[ key ] = {

            colorMult: colorMult, 

            ambient: ambient,  // ambient reflectivity

            diffuse: diffuse,        // diffuse reflectivity

            specular: specular,    // specular reflectivity

            shininess: shininess,              // surface shininess

            specularFactor: specularFactor,           // specular factor

            transparency: transparency,   // transparency, 0.0 - 1.0

            illum: illum,            // Illumination model 0-10, color on and Ambient on

            name: name

        };

    }

    /** 
     * Update vertices (a set, since no re-compute available).
     * @param {glMatrix.vec3[]} vertices new vertex data.
     */
    updateVertices ( vertices ) {

        if ( vertices && vertices.length ) {

            this.geometry.setVertices( vertices );

        }

    }

    /** 
     * Update indices ( a 'set', since no re-compute available).
     * @param {Array} indices the index values for the vertex data.
     */
    updateIndices ( indices ) {

        if ( indices && indices.length ) {

            this.geometry.setIndices ( indices );

        }

    }

    /** 
     * Update or (re)compute normals.
     * @param {glMatrix.vec3[]} normals the normals data.
     */
    updateNormals ( normals ) {

        let geo = this.geometry;

        if ( normals && normals.length ) {

            geo.setNormals( normals );

        } else {

            console.log( 'Prim::updateNormals():' + this.name + ' recalculating normal coordinates' );

            geo.setNormals( this.geometryPool.computeNormals( geo.vertices.data, geo.indices.data, [], this.useFaceNormals ) );

        }

    }


    // Update or re-compute texture coordinates.

    updateTexCoords ( texCoords ) {

        let geo = this.geometry;

        if ( texCoords && texCoords.length > 0 ) {

            geo.setTexCoords( texCoords );

        } else if ( geo.numTexCoords() !== geo.numVertices() ) {

            console.log( 'Prim::updateTexCoords():' + this.name + ' recalculating texture coordinates' );

            geo.setTexCoords( this.geometryPool.computeTexCoords( geo.vertices.data ) );

        }

    }


    // Update or re-compute tangents.

    updateTangents ( tangents ) {

        let geo = this.geometry;

        if ( tangents && tangents.length ) {

            geo.setTangents( tangents );

        } else {

            console.log( 'Prim::updateTangents():' + this.name + ' recalculating tangent coordinates' );

            geo.setTangents( this.geometryPool.computeTangents ( geo.vertices.data, geo.indices.data, geo.normals.data, geo.texCoords.data, [] ) );

        }

    }

    // Update or re-compute colors.

    updateColors ( colors ) {

        let geo = this.geometry;

        if ( colors && colors.length ) {

            geo.setColors( colors );

        } else {

            console.log( 'Prim::updateColors():' + this.name + ' recalculating color coordinates' );

            geo.setColors( this.geometryPool.computeColors( geo.normals.data, [] ) );

        }

    }

    /** 
     * Initialize current Prim material.
     * TODO: updatePrimMaterial
     * TODO: Material object
     */
    initPrimMaterial ( key, material ) {

        // TODO:

        // BAD TANGENT DATA FOR TEAPOT!!!

        // Use LIGHT object to define World Light. Shaders can use World Light, or local one.

        // Add LIGHT to WORLD. FIGURE OUT STRATEGY TO BROADCAST LIGHT TO SHADERS.

        // 1. Add Light to World. 2. Have World broadcast Light via Shader.addLight

        // 3. have Shaders that use light use the added Light.

        // LOAD MATERIAL AND TEXTURE OUT OF MODEL-POOL

        // TEST ACTUAL PRIM REMOVAL WHEN IT BECOMES INVALID

        // INTERNALIZE THESE METHODS

        // KEY FOR PROCEEDURAL GRAPHICS (ADD TO Model-Pool)

        // KEY FOR MESH GRAPHICS (Add to ModelPool)

        // KEY FOR OBJ FILE MODELS (Add to ModelPool)

        // LOAD WORLD BY FILE (MAKE INTO TESTBED)

        // LOAD A-FRAME MODELS (USING EDITOR)

        // UI MODAL DIALOG ON HOVER OVER FAILED WEBVR

        // ADD SOME SETINTERVALS DURING LONG COMPUTES

    }

///////////////////////////////////////////////////////////////////////////////////

    // TODO: MOVE INSIDE OF PRIM: THIS SHOULD BE PRIMPOOL.

    initPrimGeometry ( key, geometry ) {

        /* 
         * Add buffer data, and re-bind to WebGL.
         * NOTE: Mesh callbacks don't actually add any data here 
         * (this.meshCallback() passes empty coordinate arrays)
         */

        // TODO: TIE MESH INTO THE SAME SYSTEM (including adding to asset pool).

        // Add buffer data, but don't check buffers yet.

        this.geometry.addBufferData( geometry.vertices, geometry.indices, geometry.normals, geometry.texCoords, geometry.tangents, geometry.colors, false );

        // Update vertices if they were supplied.

        this.updateVertices( geometry.vertices );

        // Compute bounding box.

        this.boundingBox = prim.computeBoundingBox( geometry.vertices );

        // Update indices if they were supplied.

        this.updateIndices ( geometry.indices );

        // If normals are used, re-compute.

        this.updateNormals( geometry.normals );

        // If texcoords are used, re-compute.

        this.updateTexCoords( geometry.texCoords );

        // Tangents aren't supplied by our loaders, so re-compute.

        this.updateTangents();

        // Colors aren't supplied by our loaders, so re-compute.

        this.updateColors();

        // Check our buffers for consistency.

        this.geometry.checkBufferData();

        //if ( prim.name === 'cubesphere' ) {
        //if ( prim.name === 'TestCapsule' ) {
        //if ( prim.name === 'colored cube' ) {
        //if ( prim.name === 'texsphere' ) {

             let mesh = new Mesh( this );

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

        console.log( 'Prim::initPrimGeometry(): checking ' + this.name + ' buffer data' );

        this.geometry.checkBufferData();

        /* 
         * The Prim is added to the Shader when it satisfies Shader requirements.
         * Each time a texture is loaded, an event is emitted which causes the 
         * Shader to run Shader.checkPrim();
         * 
         * In theory, all the update events above could trigger a re-load and GEOMETRY_READY events.
         */

    }


    /** 
     * Compute the bounding box.
     */
    computeBoundingBox () {

        this.geometryPool.computeBoundingBox( this.geometry.vertices );

    }

    /** 
     * Compute the bounding sphere.
     */
    computeBoundingSphere () {

        this.geometryPool.computeBoundingSphere( this.geometry.vertices );

    }

    // Scale. Normally, we use matrix transforms to accomplish this.

    scale ( scale ) { 

        // TODO: computeScale()

        this.geometryPool.scale ( scale, this.geometry.vertices );

    }

    // Move. Normally, we use matrix transforms to accomplish this.

    move ( pos ) { 

        this.geometryPool.computeMove( scale, this.geometry.vertices );

    }

    // Move to a specificed coordinate.

    moveTo ( pos ) {

        this.geometryPool.move( [ 

        this.position[ 0 ] - pos[ 0 ],

        this.position[ 1 ] - pos[ 1 ],

        this.position[ 2 ] - pos[ 2 ]

        ] );

    }


    /** 
     * Convert a Prim to its JSON equivalent
     */
    toJSON ( prim ) {

        return JSON.stringify( this );

    }

}