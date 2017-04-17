import Map2d from './map2d';
import Map3d from './map3d';
import Mesh from  './mesh';
import LoadGeometry from './load-geometry';
import TexturePool from './texture-pool';
import LoadModel from './load-model';
import ShaderObj from './shader-obj';

'use strict'

class Prim {

    /** 
     * @class
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
     * 
     * TODO: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     * 1. regularize prim creation
     * - local vertex, index, etc
     * - vertices used in-place, instead of returned
     * - arrays created first in prim creation, then routine, then WebGL buffers added
     * 2. Texture indexing
     * - create startpoints in indices for swapping textures for complex objects
     * 3. Update routines
     * - update when Prim modified (re-compute normals, tangents, smooth, optimize)
     * 
     * NOTE: if you need more complex shapes, use a mesh file, or 
     * a library like http://evanw.github.io/csg.js/ to implement 
     * mesh operations.
     * 
     * Implicit objects (values are units, with 1.0 being normalized size).
     * 
     * prim.position      = (vec5) [ x, y, z, rounding, | startSlice, endSlice,  ]
     * prim.dimensions    = (vec4) [ x, y, z ]
     * prim.divisions     = (vec3) [ x, y, z ]
     * prim.acceleration  = (vec3) [ x, y, z ]
     * prim.rotation      = (vec3) [ x, y, z ]
     * prim.angular       = (vec3) [ x, y, z ]
     * prim.colors        = (vec4) [ red, green, blue, alpha... ]
     * prim.texure1Arr    = (vec2) [ u, v, t... ]
     * 
     * ---------------------------------------------------------------
     * Code Rules
     * 1. vertices = flattened array, final vertex data for computation or rendering
     * 2. vtx = any initialization Vertex object (e.g. for complex polyhedra)
     * 3. v, vv = local vertex or vertex array.
     * 4. when using glMatrix functions, do 'in place' conversion first. 
     *    If not practical, return the result. If not practical, use an 
     *    object literal:
     *    - vec3.sub( resultPt, a, b );
     *    - resultPt = vec3.sub( resultPt, a, b );
     *    - resultPt = vec3.sub( [ 0, 0, 0 ], a, b );
     * ---------------------------------------------------------------
     * Geometry - flattened arrays with the following datatypes
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
     * ---------------------------------------------------------------
     * WebGL Buffer == ShaderObj, duplicates Geometry, but with geometry data copied to sub-object
     * ---------------------------------------------------------------
     * Array optimization
     * https://gamealchemist.wordpress.com/2013/05/01/lets-get-those-javascript-arrays-to-work-fast/
     * 
     * geo primitives
     * USE THIS!!!! https://github.com/nickdesaulniers/prims
     * https://github.com/mhintz/platonic/tree/master/src
     * https://github.com/azmobi2/html5-webgl-geometry-shapes/blob/master/webgl_geometry_shapes.html
     * 
     * convert fonts to texture
     * https://github.com/framelab/fontmatic
     * 
     * More prims
     * Ogre 3d procedural
     * https://bitbucket.org/transporter/ogre-procedural/src/ca6eb3363a53c2b53c055db5ce68c1d35daab0d5/library/include/?at=default
     * https://bitbucket.org/transporter/ogre-procedural/wiki/Home
     *
     * https://github.com/jagenjo/litegl.js/tree/master/src
     *
     * http://wiki.unity3d.com/index.php/ProceduralPrimitives
     * 
     * advanced toolset
     * https://www.geometrictools.com/Samples/Geometrics.html
     * Geometry prebuilt
     * http://paulbourke.net/geometry/roundcube/
     * Lots of Webgl tricks!
     * https://acko.net
     * http://acko.net/blog/on-webgl/
     * 
     * https://gamedevdaily.io/four-ways-to-create-a-mesh-for-a-sphere-d7956b825db4#.lkbq2omq5
     *
     * @constructor
     * @param {Boolean} init if true, initialize immediately.
     * @param {Util} util shared utility methods, patches, polyfills.
     * @param {glMatrix} glMatrix fast array manipulation object.
     * @param {WebGL} webgl object holding the WebGLRenderingContext.
     * @param {LoadModel} model loading class
     * @param {LoadTexture} texture loading class
     * @param {LoadAudio} audio loading class
     * @param {LoadVideo} video loading class
     */
    constructor ( init, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo ) {

        console.log( 'in Prim class' );

        this.util = util;

        this.webgl = webgl;

        this.glMatrix = glMatrix;

        this.loadModel = loadModel;

        this.loadTexture = loadTexture;

        this.loadAudio = loadAudio;

        this.loadVideo = loadVideo;

        this.objs = []; // Keep a reference to all created Prims here.

        this.geometry = new LoadGeometry( init, util, glMatrix, webgl );

        this.texturePool = new TexturePool( init, util, webgl ); ///////////////////////////////////

        /* 
         * Bind the Prim callback for geometry creation.
         */

        this.util.emitter.on( 'geometryready', 

            ( prim ) => {

                this.initPrim( prim, prim.vertices, prim.indices, prim.normals, prim.texCoords, prim.tangents );

        } );

    }


    /** 
     * Get the big array with all vertex data. Every time a 
     * Prim is made, we store a reference in the this.objs[] 
     * array. So, to make one, we just concatenate the 
     * vertices. Use to send multiple prims sharing the same Shader.
     * @param {glMatrix.vec3[]} vertices
     * @returns {glMatrix.vec3[]} vertices
     */
    setVertexData ( vertices ) {

        vertices = [];

        for ( let i in this.objs ) {

            vertices = vertices.concat( this.objs[ i ].vertices );

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

        for ( let i in this.objs ) {

            indices = indices.concat( this.objs[ i ].indices );

        }

        return indices;

    }

    /* 
     * ---------------------------------------
     * LOADERS
     * ---------------------------------------
     */



    /*
     * ---------------------------------------
     * PRIM FACTORY
     * ---------------------------------------
     */

    initPrim ( prim, vertices, indices, normals = [], texCoords = [], tangents = [], colors = [] ) {

        let geo = prim.geometry;

        console.log( prim.name + ' generation complete,(re)calculating normals and tangents' );

        if ( prim.name === 'capsule') {

            console.log("Prim::initPrim():cHECKING FOR SHADER FOR PRIM:" + prim.name + " SHADEr: " + prim.shader.name);

        }

        // TODO: TEAPOT GOES HERE BUT CAPSULE DOES NOT

       if ( prim.name === 'teapot') {

            console.log("Prim::initPrim: cHECKING FOR SHADER FOR PRIM:" + prim.name + " SHADEr: " + prim.shader.name)

        }

        /* 
         * Add buffer data, and re-bind to WebGL.
         * NOTE: Mesh callbacks don't actually add any data here 
         * (this.meshCallback() passes empty coordinate arrays)
         */

        // Update vertices if they were supplied.

        prim.updateVertices( vertices );

        // Compute bounding box.

        prim.boundingBox = prim.computeBoundingBox( prim.geometry.vertices.data );

        // Update indices if they were supplied.

        prim.updateIndices ( indices );

        // If normals are used, re-compute.

        prim.updateNormals( normals );

        // If texcoords are used, re-compute.

        prim.updateTexCoords( texCoords );

        // Tangents aren't supplied by OBJ format, so re-compute.

        prim.updateTangents();

        // Colors aren't supplied by OBJ format, so re-compute.

        prim.updateColors();

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

        prim.geometry.checkBufferData();

        /* 
         * If we were supplied a Shader, add it to the display list. 
         * A reference to individual Prims is kept independently in the Prim object if 
         * the Shader is not present.
         */

        if ( prim.shader ) {

            console.log("ADDING PRIM:" + prim.name + " TO:" + prim.shader.name )

            prim.shader.addPrim( prim );

        }

        prim.ready = true;

    }

    /** 
     * Convert a Prim to its JSON equivalent
     */
    toJSON ( prim ) {

        return JSON.stringify( prim );

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
     * @param {Boolean} applyTexToFace if true, apply texture to each face, else apply texture to 
     * the entire object.
     * @param {String[]} modelFiles path to model and material files used to define non-geometric Prims.
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

        modelFiles = [], // heightMap file (HEIGHTMAP) or array of coordinate and material files (MESH)

        ) { // function to execute when prim is done (e.g. attach to drawing list shader).

        const vec3 = this.glMatrix.vec3;

        const mat4 = this.glMatrix.mat4;

        if ( ! this.geometry.checkType( type ) ) {

            console.error( 'Prim::createPrim(): unsupported Prim type:' + type );

            return null;
        }

        let prim = {};

        // Define internal methods for the Prim.

        /** 
         * Set the Shader used for rendering. Only one Shader may be 
         * used at a time.
         */
        prim.setShader  = ( shader ) => {

            prim.shader = shader;

        };

        /** 
         * Update the model-view matrix with position, translation, rotation, and orbital motion for individual Prims.
         * @param {glMatrix.mat4} mvMatrix model-view matrix.
         * @returns {glMatrix.mat4} the altered model-view matrix.
         */
        prim.setMV = ( mvMatrix ) => {

            let p = prim;

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

        /* 
         * Activate a texture by placing it first in position in the Prim texture array (with is what is used by shader first).
         * Complex textures have the order of binding set by their respective Shader. ShaderTexture and ShaderDirLightTexture 
         * just use the first array element. ShaderTerrain uses several elements (e.g. tiling textures, bumpmaps) defined in the 
         * ShaderTerrain texture object.
         */
        prim.activeTexture = ( num ) => {

            if ( prim.textures[ num ] ) {

                this.util.swap( 0, num );

            }

            console.log( 'in PRIM::::::activeTexture, setting active texture' );

        }

        /* 
         * Set the Prim as a glowing object. Global lights 
         * are handled by the World.
         */
        prim.setLight = ( direction = [ 1, 1, 1 ], color = [ 255, 255, 255 ], prim = this ) => {

            let p = prim;

            p.light.direction = direction,

            p.light.color = color;

        };

        prim.setMaterial = ( name, colorMult = 1, ambient = [ 0.1, 0.1, 0.1 ], diffuse = [ 0, 0, 0 ], specular = [ 1, 1, 1, 1 ], shininess = 250, specularFactor = 1, transparency = 1.0, illum = 1 ) => {

            let p = prim;

            p.material.push( {

                colorMult: colorMult, 

                ambient: ambient,  // ambient reflectivity

                diffuse: diffuse,        // diffuse reflectivity

                specular: specular,    // specular reflectivity

                shininess: shininess,              // surface shininess

                specularFactor: specularFactor,           // specular factor

                transparency: transparency,   // transparency, 0.0 - 1.0

                illum: illum,            // Illumination model 0-10, color on and Ambient on

                name: name

            } );

        }

        // We don't have a .setMaterial - set directly in loadModel.updateMateria()

        // Update vertices (no re-compute available).

        prim.updateVertices = ( vertices ) => {

            let geo = prim.geometry;

            if ( vertices && vertices.length ) {

                geo.setVertices( vertices );

            }

        }

        // update indices (no re-compute available).

        prim.updateIndices = ( indices ) => {

            let geo = prim.geometry;

            if ( indices && indices.length ) {

                geo.setIndices ( indices );

            }

        }

        // Update or re-compute normals.

        prim.updateNormals = ( normals ) => {

            let geo = prim.geometry;

            if ( normals && normals.length ) {

                geo.setNormals( normals );

            } else {

                geo.setNormals( this.geometry.computeNormals( geo.vertices.data, geo.indices.data, [], prim.useFaceNormals ) );

            }

        }

        // Update or re-compute texture coordinates.

        prim.updateTexCoords = ( texCoords ) => {

            let geo = prim.geometry;

            if ( texCoords && texCoords.length > 0 ) {

                geo.setTexCoords( texCoords );

            } else if ( geo.numTexCoords() !== geo.numVertices() ) {

                console.log("Prim:" + prim.name + ' recalculating texture coordinates' );

                geo.setTexCoords( this.geometry.computeTexCoords( geo.vertices.data ) );

            }

        }

        // Update or re-compute tangents.

        prim.updateTangents = ( tangents ) => {

            let geo = prim.geometry;

            if ( tangents && tangents.length ) {

                geo.setTangents( tangents );

            } else {

                geo.setTangents( this.geometry.computeTangents ( geo.vertices.data, geo.indices.data, geo.normals.data, geo.texCoords.data, [] ) );

            }

        }

        // Update or re-compute colors.

        prim.updateColors = ( colors ) => {

            let geo = prim.geometry;

            if ( colors && colors.length ) {

                geo.setColors( colors );

            } else {

                geo.setColors( this.geometry.computeColors( geo.normals.data, [] ) );

            }

        }

        // Compute the bounding box.

        prim.computeBoundingBox = () => {

            this.geometry.computeBoundingBox( prim.geometry.vertices );

        };

        // Compute the bounding sphere.

        prim.computeBoundingSphere = () => {

            this.geometry.computeBoundingSphere( prim.geometry.vertices );

        };

        // Scale. Normally, we use matrix transforms to accomplish this.

        prim.scale = ( scale ) => { 

            this.geometry.scale ( scale, prim.geometry.vertices );

        };

        // Move. Normally, we use matrix transforms to accomplish this.

        prim.move = ( pos ) => { 

            this.geometry.computeMove( scale, prim.geometry.vertices );

        };

        // Move to a specificed coordinate.

        prim.moveTo = ( pos ) => {

            this.geometry.move( [ 

            this.position[ 0 ] - pos[ 0 ],

            this.position[ 1 ] - pos[ 1 ],

            this.position[ 2 ] - pos[ 2 ]

            ] );

        }

        // Convert a Prim to its JSON equivalent

        prim.toJSON = () => {

            this.toJSON( prim );

        }

        // Reference the init method inside the prim.

        prim.initPrim = this.initPrim;

        // Give the Prim a unique Id.

        prim.id = this.util.computeId();

        // Shader object for adding/removing from display list.

        prim.shader = shader;

        // Name (arbitrary).

        prim.name = name;

        // Type (must match type defined in Prim.typeList).

        prim.type = type;

        // If we're a mesh, we need modelFiles.

        if ( prim.type === this.geometry.typeList.MESH && modelFiles.length < 1 ) {

            console.error( 'invalid Mesh Prim - needs model files' );

            return null;

        }

        // Size in world coordinates.

        prim.dimensions = dimensions || this.vec5( 1, 1, 1, 0, 0, 0, 0 );

        // Amount of division of the Prim along each axis.

        prim.divisions = divisions || this.vec5( 1, 1, 1, 0, 0, 0 );

        // Prim Position in world coordinates.

        prim.position = position || vec3.create();

        prim.acceleration = acceleration || vec3.create();

        // Prim rotation on x, y, z axis.

        prim.rotation = rotation || vec3.create();

        // Prim acceleration object indicates velocity on angular motion in x, y, z

        prim.angular = angular || vec3.create();

        // The Prim orbit defines a center that the object orbits around, and orbital velocity.

        prim.orbitRadius = 0.0;

        prim.orbitAngular = 0.0;

        // Prim scale, in World coordinates.

        prim.scale = 1.0;

        // Set prim lighting.
        // TODO:::::::::::::::::::::::::::::::::::::::

        prim.light = {};

        // TODO:::::::::::::::::::::::::::::::::::::::

        // Visible from outside (counterclockwise winding) or inside (clockwise winding).

        // Invisible if this.INVISIBLE

        prim.visibleFrom = this.geometry.OUTSIDE;

        // Repeatedly apply the texture to each Face of the Prim (instead of wrapping around the Mesh).
        // If we have multiple textures, apply in succession.

        prim.applyTexToFace = applyTexToFace;

        // Whether to use face normals for a Face of the prim.

        prim.useFaceNormals = false; //////////////////CHANGE SHOULD BE SET OPTIONALLY !!!!!!!!!!!!!!!!!!!!!

        // Whether to include tangents 

        prim.useTangents = true; // TODO:///////CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!!!

        // Store model files for one Prim.

        prim.models = modelFiles;

        // Set ready flag for slow loads.

        prim.ready = false;

        // Waypoints for scripted motion or timelines.

        prim.waypoints = [];

        // Material files.

        prim.material = [];

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

        prim.setMaterial( 'default' );

       // Execute geometry creation routine (which may be a file load).

       console.log("Generating Prim:" + prim.name + '(' + prim.type + ')' );

        // Geometry factory function, create empty WebGL Buffers.

        prim.geometry = new ShaderObj( prim.name, this.util, this.webgl );

        // Create or load Geometry data (may alter some of the above default properties).

        this.geometry[ type ]( prim );

        // Create default WebGL buffers to bind our Prim coordinate data to.

        // TODO: HAVE THIS HAPPEN WHEN WE ADD BUFFER DATA

        ///////////prim.geometry = prim.geometry.createGLBuffers(); // ???????????????WHY CAN'T WE MOVE THIS EARLIER????????????????????????????

        // Multiple textures per Prim. Rendering defines how textures for each Prim type are used.

        //for ( let i = 0; i < textureImages.length; i++ ) {

        //    this.loadTexture.load( textureImages[ i ], prim );

        //}


        this.texturePool.getTextures( textureImages, prim.textures ); // assume cacheBust === true, mimeType determined by file extension.


        // TODO: use this!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        //prim.setLight();

        // Push into our list of all Prims. Shaders keep a local list of Prims they are rendering.

        this.objs.push( prim );

        window.prim = prim;

        return prim;

    }

    /*
     * ---------------------------------------
     * PRIM LIST OPERATIONS
     * ---------------------------------------
     */

    addPrim ( prim ) {

        // TODO: also need to add/remove in Shader

    }

    removePrim () {

        // TODO: also need to add/remove in Shader

    }

    primInList () {

        // TODO: also need to add/remove in Shader

    }

} // End of class.

// We put this here because of JSDoc(!).

export default Prim;