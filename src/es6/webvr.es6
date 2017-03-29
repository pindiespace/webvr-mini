class WebVR {

    constructor ( init, util, glMatrix, webgl  ) {

        console.log( 'in webVR class' );

        this.util = util,

        this.glMatrix = glMatrix,

        this.gl = webgl;

        this.vrVers = 1.0,      // TODO: is there any way to get this?

        this.display = null,  // VR display (device or default for mobiles)

        this.frameData = null;  // VR frame data

        // Statistics object.

        this.stats = {};

        if ( init === true ) {

            this.init();

        }

    }

    /** 
     * Adapted from toji's room-scale example.
     * Firefox: turn on in http://about:config
     * Chrome: turn on in chrome://flags/
     * NOTE: in Mar 2017, FF only supported Oculus, 
     * needed Chromium WebVR build to support Vive.
     */
    init () {

        // Collect stats no matter what...

        let stats = this.stats;

         if ( navigator.getVRDisplays ) {

            navigator.getVRDisplays().then ( ( displays ) => {

                let display = displays[ 0 ];

                console.log( 'webvr is available' );

                stats.displayName = display.displayName; // HMD name

                this.frameData = new VRFrameData(); // Contains our current pose.

                if ( this.frameData ) {

                    if ( displays.length > 0 )  {

                        let vrDisplay = displays[ 0 ];

                        this.display = display;

                        display.depthNear = this.gl.near; // 0.1

                        display.depthFar = this.gl.far; // 100, was 1024.0;

                        // Set WebVR display stage parameters.

                        this.setStageParameters();

                        // Listen for WebVR events.

                        window.addEventListener( 'vrdisplaypresentchange', this.presentChange.bind( this ), false );

                        window.addEventListener( 'vrdisplayactivate', this.requestPresent.bind( this ), false );

                        window.addEventListener( 'vrdisplaydeactivate', this.exitPresent.bind( this ), false );

                    } // displays.length > 0

                } // valid VRFrameData

            } ); // getVRDisplays returned a value

        } else {

            // We check for support prior to loading this module, so we shouldn't go here if not supported.

            console.error( 'webgl not present, or obsolete version' );

        }

    }

    /** 
     * Set the stage parameters.
     * The check for size > 0 is necessary because some devices, like the
     * Oculus Rift, can give you a standing space coordinate but don't
     * have a configured play area. These devices will return a stage
     * size of 0.
     */
    setStageParameters () {

        let display = this.display;

        if ( display.stageParameters ) {

            let sp = display.stageParameters;

            if ( sp.sizeX > 0 && sp.sizeY > 0 ) {

                // TODO: trigger this in world.init();
                // this.world.resize( vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ );

            } else {

                // TODO: test early.
                // VRSamplesUtil.addInfo("VRDisplay reported stageParameters, but stage size was 0. Using default size.", 3000);

            }

        } else {

            // TODO: test early.
            // VRSamplesUtil.addInfo("VRDisplay did not report stageParameters", 3000 );

        }

    }

    /** 
     * Pose matrix for standing roomscale view (move point of view up)
     * In our version, this needs to be called by shader.
     */
    standingPoseMatrix () {

        let mat4 = this.glMatrix.mat4,

        display =  this.display;

        if ( display.stageParameters ) {

          /* 
           * After toji:
           * If the headset provides stageParameters use the
           * sittingToStandingTransform to transform the view matrix into a
           * space where the floor in the center of the users play space is the
           * origin.
           */

          mat4.invert( out, display.stageParameters.sittingToStandingTransform );

          mat4.multiply( out, view, out );

        } else {

          /* 
           * After toji:
           * Otherwise you'll want to translate the view to compensate for the
           * scene floor being at Y=0. Ideally this should match the user's
           * height (you may want to make it configurable). For this demo we'll
           * just assume all human beings are 1.65 meters (~5.4ft) tall.
           */

          mat4.identity( out );

          mat4.translate( out, out, [ 0, PLAYER_HEIGHT, 0 ] );

          mat4.invert( out, out );

          mat4.multiply( out, view, out );

        }

        return out; // TODO: ?????????????????

    }

    /** 
     * Reset user pose in the simulation.
     */
    resetPose () {

        this.display.resetPose();

    }

    /* 
     * =============== VR EVENTS ====================
     */

     /** 
      * User requested VR mode, or display HMD was activated.
      */
    requestPresent () {

        console.log( 'in requestPresent' );

        let display = this.display;

        if ( display && display.capabilities.canPresent ) {

            display.requestPresent( [ { source: this.gl.getCanvas() } ] )

            .then( () => {

            // success

                console.log( 'requestPresent was successful' );

            },  () => {

                // ERROR
                // VRSamplesUtil.addError("requestPresent failed.", 2000);

                console.error( 'requestPresent failed' );

        } );

        } else {

            console.error( 'vrdisplay unable to present' );

        }

     }

     /** 
      * User requested exiting VR mode, or display HMD was deactivated.
      */
     exitPresent () {

        console.log( 'in exitPresent' );

        let display = this.display;

        if ( display && ! display.isPresenting ) {

          return;

        }

        vrDisplay.exitPresent()

        .then( () => {

            // success

            console.log( 'exited vrDisplay presentation' );

        }, () => {

            // ERROR

            //VRSamplesUtil.addError("exitPresent failed.", 2000);

            console.error( 'failed to exit vrDisplay presentation' );

        } );

     }

    /** 
     * VR Presentation has changed.
     */
    presentChange () {

        // this.gl.resize();

        console.log( 'in presentChange' );

    }

    /** 
     * Provide statistics for display as JSON data.
     */
    stats () {

        return JSON.stringify( this.stats );

    }

}

export default WebVR;