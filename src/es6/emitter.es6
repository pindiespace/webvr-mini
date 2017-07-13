'use strict'

class Emitter {

    /** 
     * Callback organizer. Used to update Ui for webvr, webgl, and other events 
     * taking some time, avoiding the CustomEvent interface. The main advantage is that 
     * an object (like Ui) can use it to bind one of its callbacks to an 'emit' in another 
     * object that doesn't have a reference to it. Creates a de facto extension of processed 
     * events for the app.
     * Usage similar to webvr-boilerplate:
     * @link https://github.com/borismus/webvr-boilerplate/blob/master/build/webvr-manager.js
     */
    constructor () {

        this.callbacks = {};

        // Define supported emitter events.

        this.events = {

            WORLD_DEFINITION_READY: 'wrddefrdy',        // World definition file is ready

            PROCEDURAL_GEOMETRY_READY: 'plgrdy',           // Procedural geometry is ready

            OBJ_GEOMETRY_READY: 'ogrdy',                   // Use for .OBJ and .MTL file formats

            MATERIAL_READY: 'mrdy',                       // sends Prim reference. Not used for procedural geometry

            TEXTURE_2D_READY: 'trdy',                     // sends Prim reference, key in Prim texture Array

            TEXTURE_3D_READY: 't3drdy',                   // 3d texture is ready

            TEXTURE_CUBEMAP_MEMBER_READY: 'trcmpmbrdy',   // one file in a cubemap is ready

            TEXTURE_CUBEMAP_READY: 'tcmprdy',             // all files for cubemap loaded

            PRIM_ADDED_TO_SHADER: 'prash',                 // Prim added to Shader

            PRIM_REMOVED_FROM_SHADER: 'prmsh',             // a Prim was removed by a Shader

            PRIM_FAIL: 'prmfl',                           // a Prim couldn't load its assets

            VR_DISPLAY_READY: 'vrdispready',              // the VR device is ready (either a VRDevice or a window object)

            VR_DISPLAY_CHANGE: 'virdispchange',           // the display we're using was changed

            VR_DISPLAY_FAIL: 'vrdispfail'                 // WebVR is present, but blew up

        };

    }

    emit ( eventName ) {

        let callbacks = this.callbacks[ eventName ];

        if ( ! callbacks ) {

            return;
 
        }

        // Convert arguments to a useful Array.

        var args = [].slice.call( arguments );

        // Eliminate the first param in the argument list (eventName).

        args.shift();

        for ( let i = 0; i < callbacks.length; i++ ) {

            callbacks[ i ].apply( this, args );

        }

    }

    /** 
     * Bind a callback to an event (without using CustomEvents)
     * @param {String} eventName an event name.
     * @param {Function} callback function to execute when we 'emit'.
     */
    on ( eventName, callback ) {

        if ( eventName in this.callbacks ) {

            this.callbacks[ eventName ].push( callback );

        } else {

            this.callbacks[ eventName ] = [ callback ];

        }

    }

}

export default Emitter;