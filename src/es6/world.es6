import AssetPool from './asset-pool';
import GeometryPool from './geometry-pool';
import TexturePool from './texture-pool';
import MaterialPool from './material-pool';
import ModelPool from './model-pool';
import AudioPool from './audio-pool';
import Lights from './lights';
import PrimFactory from './prim-factory';

'use strict'

class World extends AssetPool {

    /** 
     * The World class creates the scene, and should be uniquely 
     * written for each instance using the WebVR-Mini library.
     * Required functions:
     * getVS() - the vertex shader.
     * getFS() - get the fragment shader.
     * render() - rendering loop.
     * init() - create the world for this first time.
     * constructor() - initialize, passing in WebVR-Mini object.
     * 
     * TODO: add some standard world objects (e.g. 360 video player by default)
     * @link https://github.com/flimshaw/Valiant360/blob/master/src/valiant.jquery.js
     */

    /** 
     * constructor for World.
     * @param {WebGL} gl the webgl module.
     * @param {WebVR} webvr the webvr module.
     * @param {Prim} prim the object/mesh primitives module.
     * @param {ShaderPool} shaderPool the GLSL rendering module.
     * @param {Lights} lights object for World light.
     * @param {Ui} ui the 2d web Ui interface.
     */
    constructor ( init, glMatrix, webgl, webvr, gamepad, shaderPool, lights, ui ) {

        // Initialize AssetLoader superclass.

        super( webgl.util );

        console.log( 'in World class' );

        this.glMatrix = glMatrix,

        this.webgl = webgl,

        this.util = webgl.util,

        this.vr = webvr,

        this.gamepad = gamepad,

        this.shaderPool = shaderPool,

        // Attach 1 copy of Texture loader.

        this.texturePool = new TexturePool( init, this.util, webgl );

        // Materials file can find a material, or a texture used as material.

        this.materialPool = new MaterialPool( init, this.util, webgl, this.texturePool );

        // Attach 1 copy of the Model loader. Note: passing in TexturePool and MaterialPool.

        this.modelPool = new ModelPool( init, this.util, webgl, this.texturePool, this.materialPool );

        // Attach 1 copy of geometry loader, with ModelPool (which contains TexturePool and MaterialPool).

        this.geometryPool = new GeometryPool( init, this.util, glMatrix, webgl, this.modelPool );

        // Create the Prim factory (no Prim class).

        this.primFactory = new PrimFactory ( true, this );

        //this.dimensions = [ 100, 100, 100 ];

        // Set the defaults for World position and Camera POV, in case we don't have a JSON file.

        this.default();

        // Add World Lights (Prims may have their own).

        this.lights = lights,

        // Connect to our user interface.

        this.ui = ui;

        // File types in which a World may be described.

        this.worldMimeTypes = {

            'json': 'text/plain',      // our proprietary JSON format

            'gltf': 'text/tgltf',      // TODO: GLTF text

            'gltfBinary': 'bin/gltf'   // TODO: GLTF binary

        };

        ////////////////////////////////////////////////////////////////////////////////////////
        /* 
         * TODO: THE SERVERS SHOULD SET THESE. USE AJAX OR EMBED PRIOR TO DOWNLOAD.
         */

        this.worldPaths = [

            'world/default-world.json', 

            'world/gltf-world.json', 

            'world/obj-world.json', 

            'world/tangled-world.json', 

            'world/celestial-world.json'

        ];

        /////////////////////////////////////////////////////////////////////////////////////////


        // Stats on World operation.

        this.stats = { fps: 0 };

        // Matrix operations.

        this.canvas = webgl.getCanvas();
 
        this.glMatrix = webgl.glMatrix;

        this.wvMatrix = glMatrix.mat4.create();

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.last = performance.now(); // initialize the counter

        this.rafId = null;

        this.counters = {

            fps: 0,  // visible FPS

            fps_max: 300, // for every 5 seconds

            geolocate: 0,  // positions of sun, moon, stars

            geolocate_max: 18000, // for 0.02 rotational speed of skydome, 36000 for 0.1

            housekeep: 0 // check for damaged Prims, etc

        };

        // The World controls day, night, weather.

        // TODO : add weather info here.

        // Bind the render loop (best current method)

        this.render = this.render.bind( this );

        // Create a default, empty World.

        this.defaultKey = this.addAsset( this.default(), '' ).key;

        // Listen for the VR display being ready (initially bind to 'window').

        this.util.emitter.on( this.util.emitter.events.VR_DISPLAY_READY, 

            ( device ) => {

                if ( this.rafId !== null ) {

                    console.log( 'VR_DISPLAY_READY, display typeof:' + this.vr.getDisplay() );

                    this.stop();

                    this.start();

                }

            } );

        /* 
         * Rotate Prims which depend on our current (real-world) latitude and longitude.
         * Fires 1 times per minute in world.update()
         */

        this.util.emitter.on( this.util.emitter.events.WORLD_GEOLOCATION_READY,

            ( geoData ) => {

                // Confirm back we got meaningful data.

                console.log( 'World::WORLD_GEOLOCATION_READY event' );

                if ( this.util.isNumber( geoData.latitude ) && this.util.isNumber( geoData.longitude ) ) {

                    this.geoData = geoData;

                    // Individual Prims which need to update check this value.

                    for ( let i = 0; i < this.primFactory.prims.length; i++ ) {

                        let prim = this.primFactory.prims[ i ];

                        if ( prim.geolocate === true ) {

                            // default position x = 0, spin around zeinth

                            // default position x = -59, like 30 degrees north (los angeles)

                            // default position x = -90, equator spin straight ahead (north)

                            // set default for z, adjust x, spin on y

                            console.log( 'World::WORLD_GEOLOCATION_READY event, setting geoData lat:' + geoData.latitude + ' long:' + geoData.longitude );

                            this.computeSkyRotation( prim, geoData );

                        }

                    }

                }

        } );

    }

    /**
     * Create a default World. Units are OpenGL/WebGL units. Replaced by 
     * Scene data in the JSON world files when loaded.
     */
    default ( position = [ 0, 0, -5 ], rotation = [ 0, 0, 0 ], dimensions = [ 100, 100, 100 ], name = 'no name', 

        description = 'none', geolocate = false, lights = null, connections = {} ) {

        let d = {

            scene: {

                active: false, 

                path: '',

                name : name,

                description : description,

                dimensions : dimensions[ 0 ],

                position : position[ 0 ],

                rotation : rotation[ 0 ],

                light: lights,

                connections: connections

            }

        };

        // Add a simple point of view (POV), by moving the World instead of camera.

        let scene = d.scene;

        this.position = scene.position,

        this.rotation = scene.rotation,

        // Additional World (scene) features.

        this.dimensions = scene.dimensions,

        this.name = scene.name,

        this.description = scene.description,

        this.geolocate = scene.geolocate,

        this.connections = scene.connections; // teleports

        // the global Lights object is in app.js. We only add individual Lights.

        if ( lights ) this.setLights ( scene.lights );

        /*
         * Because the World object = the current World, and we may need to purge
         * the Prims from a world, we only store the path and JSON data for a world, rather 
         * than the World object itself (of which there is only one).
         */

        return d; // end of returned JSON object

    }


    /** 
     * Create the world. Load Shader objects, and 
     * create objects to render in the world.
     */
    init () {

        const vec3 = this.glMatrix.vec3;

        const vec4 = this.glMatrix.vec4;

        const vec5 = this.primFactory.geometryPool.vec5;

        const typeList = this.primFactory.geometryPool.typeList;

        const directions = this.primFactory.geometryPool.directions;

        const util = this.util;

        // Put some media into our asset pools.

        // Get the shaders (not initialized with update() and render() yet!).
        // Note: pass 'world' in so we can get the World POV.

        this.s0 = this.shaderPool.getAssetByName( 'shaderFader' );

        this.s1 = this.shaderPool.getAssetByName( 'shaderTexture' );

        this.s2 = this.shaderPool.getAssetByName( 'shaderColor' );

        /* 
         * Get the World file, overwriting defaults as necessary. The 
         * active World JSON file data is used to call PrimFactory to 
         * create the Prims for the active scene.
         */

        for ( let i = 0; i < this.worldPaths.length; i++ ) {

            this.getWorld( this.worldPaths[ i ] );

        }

        /* 
         * Initialize the Shaders we will use.
         * Note: the init() method sets up the update() and render() methods for the Shader.
         */

        this.r0 = this.s0.init();

        this.r1 = this.s1.init();

        this.r2 = this.s2.init();

        /* 
         * Fire world update (either window or WebVR display). Since we 
         * do this directly, in most cases this will be the 'window' object. If the 
         * VRDisplay becomes available, it emits an VR_DISPLAY_READY event, and we 
         * dynamically switch to VRDisplay (see constructor emitter handler).
         */

        this.start();

    }

    /** 
     * Get all worlds by their name. 
     * Used by the Ui class.
     * @return {Object} a World Scene object.
     */
    getWorldScenes () {

        let w = {},

        dName = 'unnamed world ',

        ct = 0;

        let worlds = this.getAllAssets();

        for ( let i in worlds ) { // i is the key in AssetPool

            let wd = worlds[ i ];

            w[ i ] = wd.scene;

        }

        return w;

    }

    /** 
     * Get the currently active World.
     * Used by PrimFactory to reset the active Prims to render.
     */
    getActiveWorld () {

        for ( let i in this.keyList ) {

            let w = this.keyList[ i ];

            if ( w.scene.active ) {

                return w;

            }

        }

        return null;

    }

    /** 
     * Read the JSON for an individual Prim, and execute Prim creation.
     */
    computePrim ( pData, i ) {

        const vec3 = this.glMatrix.vec3;

        const vec4 = this.glMatrix.vec4;

        const vec5 = this.primFactory.geometryPool.vec5; // special vector

        const typeList = this.primFactory.geometryPool.typeList; // types of geometry

        const directions = this.primFactory.geometryPool.directions; // cardinal positions

        const util = this.util;

        let shader = this.shaderPool.getAssetByName( pData.shader );

        console.log("..........ComputePrim: i:" + i + " SHADER:" + shader)

        if ( shader ) {


            if ( shader.name )  console.log("...........GETTING SHADER:" + shader.name ); ///////////////////////////////////////


            // Handle cases for dimensions and divisions params are numbers (they may also be strings).

            if ( util.isNumber( pData.dimensions[ 3 ] ) ) {

                pData.dimensions[ 3 ] = parseFloat( pData.dimensions[ 3 ] );

            }

            if ( util.isNumber( pData.dimensions[ 4 ] ) ) {

                pData.dimensions[ 4 ] = parseFloat( pData.dimensions[ 4 ] );

            }

            if ( util.isNumber( pData.divisions[ 3 ] ) ) {

                pData.divisions[ 3 ] = parseFloat( pData.divisions[ 3 ] );

            }

            if ( util.isNumber( pData.divisions[ 4 ] ) ) {

                pData.divisions[ 4 ] = parseFloat( pData.divisions[ 4 ] );

            }

            if ( pData.useColorArray ) pData.useColorArray = JSON.parse( pData.useColorArray );      // if true, use color array instead of texture array

            if ( pData.useFaceTextures) pData.useFaceTextures = JSON.parse( pData.useFaceTextures ); // if true, apply textures to each face, not whole Prim.

            if ( pData.useLighting ) pData.useLighting = JSON.parse( pData.useLighting );            // if true, use lighting (default)

            if ( pData.useMetaData ) pData.useMetaData = JSON.parse( pData.useMetaData );            // if true, keep data associated with regions of prim.

            // Create the Prim.

            return this.primFactory.createPrim(

                this.shaderPool.getAssetByName( pData.shader ), // Shader used

                typeList[ pData.type ],                         // Prim type

                i,                                          // name

                vec5( 
                    parseFloat( pData.dimensions[ 0 ] ), 
                    parseFloat( pData.dimensions[ 1 ] ), 
                    parseFloat( pData.dimensions[ 2 ] ), 
                    pData.dimensions[ 3 ],  // these may be non-numeric
                    pData.dimensions[ 4 ]

                ),      // dimensions, WebGL units

                vec5( 
                    parseFloat( pData.divisions[ 0 ] ), 
                    parseFloat( pData.divisions[ 1 ] ), 
                    parseFloat( pData.divisions[ 2 ] ), 
                    pData.divisions[ 3 ],  //these may be non-numeric
                    pData.divisions[ 4 ]

                ),        // divisions, pass curving of edges as 4th parameter

                vec3.fromValues( 
                    parseFloat( pData.position[ 0 ] ), 
                    parseFloat( pData.position[ 1 ] ), 
                    parseFloat( pData.position[ 2 ] )

                ),        // acceleration in x, y, z

                vec3.fromValues( 
                    parseFloat( pData.acceleration[ 0 ] ), 
                    parseFloat( pData.acceleration[ 1 ] ), 
                    parseFloat( pData.acceleration[ 2 ] )

                ),    // position (absolute), relative to camera not World space

                vec3.fromValues(
                    util.degToRad( pData.rotation[ 0 ] ), 
                    util.degToRad( pData.rotation[ 1 ] ), 
                    util.degToRad( pData.rotation[ 2 ] )

                ),    // rotation (absolute)

                vec3.fromValues(
                    util.degToRad( pData.angular[ 0 ] ), 
                    util.degToRad( pData.angular[ 1 ] ), 
                    util.degToRad( pData.angular[ 2 ] )

                ),    // angular (orbital) velocity

                pData.textures,                   // texture images (if not in model)

                pData.models,                     // model (.OBJ, .GlTF)

                pData.useColorArray,              // if true, use color array instead of texture array

                pData.useFaceTextures,            // if true, apply textures to each face, not whole Prim.

                pData.useLighting,                // if true, use lighting (default)

                pData.useMetaData,                // if true, store meta-data in prim.materials[].objects array

                pData.pSystem,                    // if this Prim should be duplicated into a particle system, data is here

                pData.animSystem                  // if this Prim has animation waypoints, data is here

            ); // end createPrim

        } else { // no Shader

            console.error( 'World::computePrim(): no shader for:' + pData.name );

        }

    }

    /** 
     * Given a World JSON file data set already in World AssetPool, compute the World.
     * @param {String} key the key to access the individual World.
     * @param {String} path the server path to the JSON file with the scene and its Prims.
     * @return {Array[Prim]| Null} if we load a World (either for the first time, or from the 
     * PrimFactory AssetPool) return a list of rendered Prims, else return NULL if the world 
     * is invalid or inactive.
     */
    computeWorld ( world ) {

        const util = this.util;
            
        // Return a list of valid Prim objects to assign to this World later.

        let validPrims = [];

        console.log(".....in computeWorld, world is:" + world )

        // Parse the active world scene

        if ( world && world.scene ) {

            world.scene.active = JSON.parse( world.scene.active );

            if ( world.scene.active === true ) {

                // Loop thrugh Scene objects.

                for ( var i in world ) {

                    let s = world[ i ];

                    // 'scene' = parameters used to configure the World for its Prims.

                    console.log(".......WORLD[ i ] " + world.scene.name + " is:" + s)

                    if ( i === 'scene' ) { 

                        this.position = s.position; // World position

                        this.rotation = s.rotation; // World rotation

                        // Set lights, if present.

                        this.setLights( s.lights );

                        // If our scene is located in the real world, geolocate.

                        if ( s.geolocate ) {

                            util.getGeolocation();

                        }

                    } else if ( i === 'key' ) {

                        // do nothing

                    } else if ( i === 'path' ) {

                        // do nothing

                    } else { // its an individual Prim

                        // check for a Prim worldKey

                        if ( ! s.worldKey ) {

                            console.log( 'World::computeWorld(): prim ' + s.name + ' not loaded, loading...');

                            let p = this.computePrim ( s, i );

                            if ( p ) {

                                p.worldKey = world.key;

                                validPrims.push( p );

                            }

                        } else {

                            // recover the Prim from the PrimFactory AssetPool.

                            console.log( 'World::computeWorld(): prim ' + s.name + ' being recovered from PrimFactory...' );

                            p = this.primFactory.keyList[ s.key ];

                            console.log("VALID PRIM:" + p.name );

                            validPrims.push( p );

                        }

                    } // scene vs. prim conditional

                } // end of loop through World

            } // world.scene.active

            /* 
             * WORLD_DEFINITION_READY event, indicating all descriptions of World loaded. Individual media 
             * and model files may still need to be loaded.
             */

            this.util.emitter.emit( this.emitter.events.WORLD_DEFINITION_READY );

            console.log("WORLD EMITTING:" + world.scene.name)

        } else {

            // World with missing scene.

            console.warn( 'World::getWorld(): Invalid World ' + world + ' with no scene:' );

            return null;

        }

        return validPrims;

    }

    /** 
     * load a World from a JSON file description, compute Prims, and load them into 
     * PrimFactory if the World is the active one.
     */
    getWorld ( path ) {

        const util = this.util;

        let validPrims = [], world, worldKey;

        // We've never loaded this world's JSON file (just received via network request).

        console.log(".......LOADING NEW WORLD AT PATH:.........." + path )

        let mimeType = this.worldMimeTypes[ util.getFileExtension( path ) ] || this.worldMimeTypes.json;

        // check if mimeType is OK.

        if ( mimeType ) {

            this.doRequest( path, 0, 

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

                    // load a Model file.

                    if ( updateObj.data ) {

                        world = util.parseJSON( updateObj.data );

                        if ( world ) {

                            world.path = path;

                            worldKey = util.computeId();

                            // Store in AssetPool (superclass) using a key, with path in world.scene.path

                            this.addAsset( world, worldKey );

                            validPrims = this.computeWorld( world );

                            // If there were valid Prims in the list, retroactively add the world key to them.

                            if ( validPrims.length > 0 ) {

                                 // Force PrimFactory to reset its list of current prims to the current active Worlds.

                                this.primFactory.setActivePrims( worldKey );

                            }

                        } else {

                            console.error( 'World::getWorld():World file:' + path + ' could not be parsed' );

                        }

                    } else {

                        console.error( 'World::getWorld(): World file, no data found for:' + updateObj.path );

                    }

                }, true, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

        } else {

                // Invalid MIMEtype.

                console.error( 'World::getWorld(): file type "' + util.getFileExtension( path ) + '" in:' + path + ' not supported, not loading' );

        }


    }

    /** 
     * Switch the World we are displaying, (re) loading Prims as necessary.
     * @param {String} worldKey the key for retrieving the World in our AssetPool.
     */
    switchWorld ( worldKey ) {

        let world = this.getAssetByKey( worldKey );

        if ( world ) {

            // Deactivate all other worlds.

            for ( let i in this.keyList ) {

                this.keyList[ i ].scene.active = false;

            }

            // Activate this World.

            world.scene.active = true;

            // Switch it.

            this.computeWorld( world );

        } else {

            console.error( 'World::switchWorld(): invalid worldKey:' + worldKey );
        }

    }

    /** 
     * Add a Prim's description to the World, by serializing.
     * @param {Prim} the new Prim to add.
     */
    addPrimToWorld ( worldKey, prim ) {

        //TODO: INCOMPLETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        let s = JSON.stringify( prim );

        let w = this.getAsset( worldKey );

        return w + JSON.parse( s );

    }

    /** 
     * Remove a Prim from the World description.
     * @param {Prim} prim the Prim object to remove.
     * @return {Prim|Null} the Prim removed, or a null.
     */
    removePrimFromWorld ( worldKey, primKey ) {

        let p = this.primFactory.getAsset( primKey );

        if ( p ) {

            let w = this.getAsset( prim.worldKey );

            if ( w ) {

                for ( let i in w ) {

                    let o = w[ i  ];

                    if ( o.key === prim.worldKey ) { // remove reference in World list.

                        delete w[ i ]; // can't delete the local variable o in strict mode!

                        p = this.primFactory.deletePrim( prim );

                    }

                }

            }

        }

        return p;

    }

    /**
     * Move a Prim between worlds.
     */
    teleportPrim ( world1Key, world2Key, primKey ) {

        let p = this.removePrimFromWorld( world1Key, primKey );

        this.addPrimToWorld( worldKey, primKey );

    }


    /** 
     * Add Lights to global (app.js) Light object.
     */
    setLights ( lights ) {

        for ( var j in lights ) {

            let l = lights[ j ];

            this.lights.setLight( this.lights.lightTypes[ j ],  j.ambient, j.lightingDirection , j.directionalColor, j.active );

        }

    }

    /** 
     * Get the POV (simple camera).
     * @returns {Object} an object containing vec3 position and rotation arrays.
     */
    getPOV () {

        return { 

            position: this.position, 

            rotation: this.rotation 

        };

    } 

    /**
     * Handle resize event for the World dimensions.
     * @param {Number} width world width (x-axis) in units.
     * @param {Number} height world height (y-axis) in units.
     * @param {Number} depth world depth (z-axis) in units.
     */
    resize ( width, height, depth ) {

        console.error( 'world::resize(): not implemented yet!' );

    }

    /** 
     * save a World to a JSON file description.
     */
    saveWorld ( path ) {

        // TODO: output in editor interface.

        console.error( 'World::saveWorld(): not implemented yet!' );

    }


    /** 
     * Compute the rotations needed for a StarDome to be positioned from 
     * the point of view of an observer on Earth,  given the user's latitude, 
     * longitude, and the time of day. 
     * Assumes a StarDome Prim, set to rotation 0, 0, 0. and util.geoLocate() was fired:
     *
     * - world.getWorld()
     * - with a 1 minute timer in world.update()
     * Note: greenwich, england - 51.4826° N, 0.0077° W
     * Note: los Angeles - 34.0522° N, 118.2437° W
     *
     * @param {Prim} prim the prim to rotate
     */
    computeSkyRotation ( prim, geoData ) {

        if ( ! prim.geolocate ) { 

            console.error( 'World::computeSkyRotation(): prim ' + prim.name + ' does not geolocate' );

            return;
        }

        if ( this.util.isNumber( geoData.latitude ) && this.util.isNumber( geoData.longitude ) ) {

            prim.rotation[ 0 ] = this.util.degToRad( -90 + geoData.latitude );

            let d = new Date();

            let hrDegs = this.util.hoursToDeg( d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds() );

            prim.rotation[ 1 ] = -this.util.degToRad( geoData.longitude - hrDegs );

            prim.rotation[ 2 ] = this.util.degToRad( 90 );

        } else {

            console.warn( 'World::computeSkyRotation(): invalid geoData' );

        }

    }

    /** 
     * Compute position of the Sun from a position on Earth, given the user's 
     * latitude, longitude, and time of day on a normalized sphere.
     */
    computeSunPosition ( prim ) {


    }

    /**
     * Compute position of the planets from a position on Earth, given the user's
     * latitude, longitude, and time of day on a nomalized sphere.
     */
    computePlanetPositions ( prim ) {


    }

    /** 
     * Start World animation and updating.
     */
    start () {

        console.log( 'World::start(): starting animation' );

        // Attach reporters from WebVR and GamePad API only if we can render.

        this.vr.setWorld( this );

        this.gamepad.setWorld( this );

        this.ui.setWorld( this );

        // Fire the WebVR .requestAnimationFrame (rather than window.requestAnimationFrame).

        return ( this.rafId = this.vr.getDisplay().requestAnimationFrame( this.render ) );

    }

    /** 
     * Stop World animation and updating.
     */
    stop () {

        console.log( 'World::stop(): stopping animation' );

        // Use the WebVR .requestAnimationFrame (rather than window.requestAnimationFrame).

        this.vr.getDisplay().cancelAnimationFrame( this.rafId );

        return ( this.rafId = null );

    }

    /** 
     * Update the World. Called occasionally to look for broken Prims, malfunctioning APIs, ect..
     */
    housekeep () {

// TODO: Safari hack to and from fullscreen - if (self.isIOS) { utils.forceCanvasResizeSafariMobile(this.canvas);
/*

module.exports = function forceCanvasResizeSafariMobile (canvasEl) {
  var width = canvasEl.style.width;
  var height = canvasEl.style.height;
  // Taken from webvr-polyfill (https://github.com/borismus/webvr-polyfill/blob/85f657cd502ec9417bf26b87c3cb2afa6a70e079/src/util.js#L200)
  // iOS only workaround for https://bugs.webkit.org/show_bug.cgi?id=152556
  // By changing the size 1 pixel and restoring the previous value
  // we trigger a size recalculation cycle.
  canvasEl.style.width = (parseInt(width, 10) + 1) + 'px';
  canvasEl.style.height = (parseInt(height, 10) + 1) + 'px';
  setTimeout(function () {
    canvasEl.style.width = width;
    canvasEl.style.height = height;
  }, 200);
};

*/

// TODO: TEST WITHOUT A DOM (document.body)

// TODO: world menu

// TODO: scene teleports (see celestial.json file)

// TODO: add texture option for stardome

// TODO: iOS pseudo fullscreen

// TODO: constellation data co-loaded.

// TODO: particle system

// TODO: toggle worlds in Ui

// TODO: terrain multitexture

// TODO: terrain for texture (bumpy)

// =========================

// TODO: audit in https://www.npmjs.com/package/lighthouse

// TODO: fog in Shader

// TODO: study debug system in a-frame

// TODO: Webworker for file loads.
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

// TODO: daydream controls
// https://github.com/aframevr/aframe/blob/master/src/components/daydream-controls.js

// TODO: check event being fired on tap in ios, google pixel. Make sure that tooltip is removed.

// TODO: sum for lighting requires a nonzero specular to draw into the shadow!!!!

// TODO: escape key needs to run correct resize image in fullscreen! (vr button returns correctly)

// TODO: JIT - https://www.html5rocks.com/en/tutorials/speed/v8/
// TODO: JIT - https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/JIT_Optimization_Strategies
// TODO: JIT - https://developers.google.com/web/fundamentals/performance/rendering/optimize-javascript-execution
// TODO: JIT - http://mrale.ph/irhydra/2/#
// TODO: JIT - https://www.shivering-isles.com/javascript-performance-optimization/
// TODO: JIT - https://news.ycombinator.com/item?id=7943303
// TODO: JIT - http://webassembly.org/docs/web/

// TODO: geometryPool::computeTexCoords2

// TODO: fullscreen doesn't work if we use VRDisplay.exitFullScreen() in Firefox (CANVAS NOT RESIZED)

// TODO: Spinner in Ui

// TODO: https://codepen.io/ionic/pen/GgwVON

// TODO: Modal DOM dialog for ui.es6

// TODO: Just make the ShaderTexture use light. Remove ShaderDirLightTexture.

// TODO: IF A MATERIAL HAS A COLOR, OVERRIDE THE DEFAULT COLOR ARRAY (by re-writing it in that color).
// TODO: use the texture pixel in prim.defaultMaterial - set it to the value of the diffuse color.
// TODO: or, study if textures actually list color independently from ambient color.
// TODO: set ambient, and diffuse color to the same color, and assign to the texture array.
// TODO: or, ignore color array? WHAT WOULD THAT LOOK LIKE?????????
// TODO: some wavefront files have x, y, z, r, g, b for 'v' - PROCESS

// TODO: I noticed that FF now puts out "Error: WebGL warning: texImage2D: Alpha-premult 
//and y-flip are deprecated for non-DOM-Element uploads." for something like  
//gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true ); What IS the best practice here?

// TODO: TGA Loader?

// TODO: RANDOMIZE when Prims leave ShaderFader, so they don't all leave at once...

// PrimFactory needs to do the sorting of Prims.

// TODO: Push and Pop mvMatrix (in Shader) to better organize sequence (research if we can get a speedup)

// Jank optimization - http://jankfree.org/

// Cross-platform - http://codeflow.org/entries/2013/feb/22/how-to-write-portable-webgl/

// TODO: splitBuffers() in geometry-buffer.es6 for old distributions using gl.UNSIGNED_SHORT

// TODO: change webvr sitting to standing matrix so we reduce matrix multiplys.

// TODO: check if webvr.presenting when first rebooting. If so, toggle Ui to that mode.

// TODO: initPrimMaterial is just picking the first material as default. Find the material with the lowest start.

// TODO: sort materials by starting position using object.keys function

// TODO: detect if a texture is too big, and try to load a smaller one!

// Error: WebGL: texImage2D: Requested size at this level is unsupported.

// TODO: PULSE routine for multiple properties

// TODO: smoothing groups

// TODO: make camera work in mouselook only.

// TODO: SUPPORT FOR SMOOTHING GROUPS. STARTED IN MODELPOOL DIRECTORY.

// TODO: make shader-texture and shader-color handle basic materials. But use shader-dirlight-texture 

// TODO: be choosen if there are multiple materials in the file.

// TODO: ANIMATION CLASS FOR PRIM IN UPDATEMV ROUTINE.

// TODO: PRIM CONCATENATE SEVERAL PRIMS TOGETHER INTO ONE ARRAY??? CHECK HOW TO DO

// TODO: SPLIT PRIMS IF SEVERAL MATERIALS ARE INVOLVED?

// TODO: SPLIT PRIMS IF < 64k support?

// Note: WebWorker for OBJ file parsing

// TODO: JSON FILE FOR PRIMS (loadable) use this.load(), this.save()

// TODO: DEFAULT MINI WORLD IF NO JSON FILE (just a skybox and ground grid)

// TODO: PRIM ORBIT FUNCTION

    }

    /** 
     * Update the World, called with each animation frame.
     */
    update () {

        let counters = this.counters;

        // Check for VR mode.

        // fps calculation.

        counters.fps++;

        let now = performance.now();

        let delta = now - this.last;

        if ( counters.fps > counters.fps_max ) {

            //console.log('delta:' + delta)

            this.stats.fps = parseInt( 1000 / ( delta / this.counters.fps ) ) + ' fps';

            this.last = now;

            counters.fps = 0;

        }

        // Update stars, if present

        counters.geolocate++;

        if ( counters.geolocate > counters.geolocate_max ) {

            counters.geolocate = 0;

            this.util.getGeolocation(); // fires event back to world.computeSkyRotation();

        }

        // Update Sun, if present

        // Update Moon, if present

        // Update Lights

        let lightPos = this.lights.getPos();

        //this.glMatrix.vec3.rotateX( lightPos, lightPos, [ 0, 0, 0 ], 0.01 );

        //this.glMatrix.vec3.rotateY( lightPos, lightPos, [ 0, 0, 0 ], 0.01 );

        // Update atmosphere

        // Update Skydome/Stardome

    }

    /** 
     * Get the World view matrix.
     */
    getWorldViewMatrix ( wvMatrix ) {

        let mat4 = this.glMatrix.mat4,

        pov = this.getPOV();

        mat4.rotate( wvMatrix, wvMatrix, pov.rotation[ 1 ], [ 0, 1, 0 ] ); // rotate on Y axis only (for mouselook).

        mat4.rotate( wvMatrix, wvMatrix, pov.rotation[ 0 ], [ 1, 0 , 0 ] ); // rotate on X axis only (for mouselook).

        mat4.translate( wvMatrix, wvMatrix, pov.position ); // putting this first rotates around world center!

    }

    /** 
     * Render the World for a mono or a VR display.
     * Update Prims locally, then call Shader. objects to do rendering. Individual renderers 
     * (this.r#) were bound (ES5 method) in the constructor. 
     * Note: Our scene graph is just the rendering order shown here.
     * Note: we can call Shaders indivdually, or use the global 
     * this.shaderPool.renderVR() or this.shaderPool.renderMono() will will render everything.
     */
    render () {

        let mat4 = this.glMatrix.mat4,

        wvMatrix = this.wvMatrix,

        vr = this.vr, // wrapped WebVR object

        pov = this.getPOV();

        this.update();

        this.webgl.clear();

        // Render for mono or WebVR stereo.

        /*
          Sean McBeth says....

            Basically, I have a startup process:
            currentDisplay = window
            callbackID = currentDisplay.requestAnimationFrame(animationCallback)
            Then animationCallback has to make sure to always do `callbackID = currentDisplay.requestAnimationFrame(animationCallback)` to update the callbackID every frame.

            And then my "change display" process is:
            currentDisplay.cancelAnimationFrame(callbackID)
            if(userHasSelectedVRDisplay) 
            currentDisplay = userSelectedVRDisplay
            else currentDisplay = window
            callbackID = currentDisplay.requestAnimationFrame(animationCallback)

            You have to make sure you call cancelAnimationFrame from the same object from which requestAnimationFrame was called to create the callbackID, or else the cancel will not happen correctly.

            TODO: DEBUG TEMPORARY.
            pov.rotation[ 0 ] += 0.003;
            pov.rotation[ 1 ] += 0.003;

        */

        let d = vr.getDisplay();

        // Clear the View matrix for the World.

        mat4.identity( wvMatrix );

        /* 
         * Toggle between VR and mono view modes.
         * If we found a VRDisplay, we use VRDisplay.requestAnimationFrame for both mono and stereo.
         * If there is noVRDisplay, we use window.requestAnimationFrame
         */

        if ( d ) {

            if ( d.isPresenting ) {

                // We can only go here if VRDisplay exists.

                this.rafId = d.requestAnimationFrame( this.render );

                // Get FrameData (with matrices for left and right eye) Can be NULL the first time.

                let fd = vr.getFrameData();

                if ( fd !== null ) {

                    // Get any World transforms (translation, rotation).

                    this.getWorldViewMatrix( wvMatrix );

                    /* 
                     * These routines set the canvas viewport to left and right stereo, and 
                     * draw left or right view using the frameDat left and right view matrix.
                     */

                    this.r1.renderVR( vr, fd, wvMatrix, pov );  // textured, no lighting

                    this.r2.renderVR( vr, fd, wvMatrix, pov );  // color

                    this.r0.renderVR( vr, fd, wvMatrix, pov );  // REQUIRED alpha (Prim appearing or disappearing), drawn in front

                    d.submitFrame();

                } else {

                    console.error( 'World::render(): invalid VRFrameData' );

                }


            } else {

                /* 
                 * Render mono view, using either disp === VRDisplay, or disp === window.
                 * webvr.vrResize() calls webgl.resize(), which converts the canvas viewport back to 
                 * mono view if we are using VRDisplay. 
                 *
                 * If we are using disp === window then the viewport always fills the canvas.
                 */

                this.rafId = d.requestAnimationFrame( this.render );

                // Get any World transforms (translation, rotation).

                this.getWorldViewMatrix( wvMatrix );

                //////////////this.r3.renderMono( wvMatrix, pov );

                this.r1.renderMono( wvMatrix, pov ); // textured, no lighting

                this.r2.renderMono( wvMatrix, pov ); // color

                this.r0.renderMono( wvMatrix, pov ); // REQUIRED alpha (Prim appearing or disappearing), drawn in front

            }

        } else {

            console.error( 'World::render(): no display' );

        }

        ////////////////////////////console.log( this.webgl.getError() );

    }

}

export default World;