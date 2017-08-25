'use strict'

class GamePad {

    constructor ( init, util, glMatrix, webgl  ) {

        console.log( 'in gamepad constructor' );

        this.util = util;

        // Statistics object.

        this.stats = {};

        // Immediately initialize (for now).

        if ( init === true ) {

            this.init();

        }

    }

    /** 
     * Set the World object (which has .requestAnimationFrame). used by World 
     * to apply itself to this object.
     * @param {World} world the current world, including world.render() loop.
     */
    setWorld ( world ) {

        this.world = world;

    }

    /** 
     * Initialize Gamepad object.
     */
    init () {

        this.getGamepads(); // non-Promise based

        // Listen for the connection

        window.addEventListener( 'gamepadconnected', ( evt ) => {

            // TODO: need to tedect TWO controllers here!

            this.gpad = navigator.getGamepads()[ e.gamepad.index ];

            // TODO: activate gamepad icon

            console.log( 'found gamepad: ' + this.gpad.id );

            this.getGamepads

        } );

        // Disconnected

        window.addEventListener( 'gamepaddisconnected', ( evt ) => {

            // TODO: deactivate gamepad icon

            console.log( 'gamepad disconnected' );

        } );

    }

    /**
     * Get the current gamepad by the ID of the WebVR headset. The 
     * WebVR headset and gamepads share an Id, useful for tying them together.
     * @param {Number} id the HMD id from WebVR.
     * @returns {}
     */
    getGamepadByHMDId ( id ) {

        if ( ! this.gamepads.length ) {

            this.getGamepads();

        }

        for ( let i = 0; i < this.gamepads.length; i++ ) {

            let gp = this.gamepads[ i ];

            if ( gp && gp.displayId === id ) {

                return gp;

            }

        }

    }

    /** 
     * Get gamepads, and process accordingly.
     */
    getGamepads () {

        // Save the reported array of gamepads.

        let gamepads = navigator.getGamepads();

        this.gamepads = [];

        console.log( 'GamePad::():getGamePads():' + gamepads.length + ' controllers' );

        this.stats.numGamepads = gamepads.length;

        for( let i = 0; i < gamepads.length; i++ ) {

            let gp = gamepads[ i ];

            if ( gp ) { // can be undefined or null

                this.gamepads[ i ] = gp;

            }

        }

    }

    /** 
     * Check if we have Gamepad support
     */
    hasGamepads () {

        return !! ( 'getGamepads' in navigator );

    }

    /**
     * Report a Gamepad's features to the Ui for display.
     * @param {Number|Object} either the Gamepad object from the array, 
     * or the index of the object in the Gamepad array.
     * @returns {Object|null} a list of gamepad device features, or null.
     */
    reportGamePad ( gamepad = 0 ) {

        if ( this.util.isNumber( gamePad ) ) {

            gamepad = this.gamepads[ gamepad ] || null;

        }

        // Return a key-value array for readout

        if ( gamepad ) {

            return {

                id: gp.displayIndex,

                gamepad: gp.index,

                hand: gp.hand,

                actuators: gp.hapticActuators.length,

                pose: !! ( gp.pose && gp.pose.hasPosition ),

                orientation: !! ( gp.pose && gp.pose.hasOrientation )

            };

        }

        return null;

    }

}

export default GamePad;