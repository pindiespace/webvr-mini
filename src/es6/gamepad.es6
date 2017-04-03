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

    init () {

        // Listen for the connection

        window.addEventListener( 'gamepadconnected', ( evt ) => {

            // TODO: need to tedect TWO controllers here!

            this.gpad = navigator.getGamepads()[ e.gamepad.index ];

            // TODO: activate gamepad icon

            console.log( 'found gamepad: ' + this.gpad.id );

        } );

        // Disconnected

        window.addEventListener( 'gamepaddisconnected', ( evt ) => {

            // TODO: deactivate gamepad icon

            console.log( 'gamepad disconnected' );

        } );

    }

}