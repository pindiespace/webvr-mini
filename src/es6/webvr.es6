class WebVR {

    constructor ( init, util, glMatrix, webgl  ) {

        console.log( 'in webVR class' );

        this.util = util;

        this.glMatrix = glMatrix;

        this.gl = webgl;

        if ( init === true ) {

            this.init();

        }

    }

    /** 
     * Adapted from toji's room-scale example.
     */
    init () {

         if ( navigator.getVRDisplays ) {

            navigator.getVRDisplays().then ( ( displays ) => {

                console.log( 'webvr is available' );

                if ( displays.length > 0 )  {

                    //initWebGL(true);

                }

            } );


        } else {

            // We check for support prior to loading this module, so we shouldn't go here if not supported.

            console.error( 'webgl not present' );

        }

    }

}

export default WebVR;