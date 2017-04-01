class WebVR {

    /** 
     * render scenes to webvr devices
     * following toji's room-scale example:
     * @link https://github.com/toji/webvr.info/blob/master/samples/05-room-scale.html
     */
    constructor ( init, util, glMatrix, webgl  ) {

        console.log( 'in webVR class' );

        this.util = util,

        this.glMatrix = glMatrix,

        this.webgl = webgl;

        this.vrVers = 1.0,         // TODO: is there any way to get this?

        this.display = null,       // VR display (device or default for mobiles)

        this.frameData = null,     // VR frame data

        this.PLAYER_HEIGHT = 1.75; // average player height.

        // Statistics object.

        this.stats = {};

        if ( init === true ) {

            this.init();

        }

    }

    /** 
     * Compatibility Mar 2017
     * Adapted from toji's room-scale example.
     * 
     * ENABLING
     *
     * Firefox: turn on in http://about:config
     * Vive also needs a .dll
     * https://webvr.rocks/firefox#download
     *
     * Chrome: turn on in chrome://flags/
     * NOTE: in Mar 2017, FF only supported Oculus, 
     * needed Chromium WebVR build to support Vive.
     */
    init () {

        // Collect stats no matter what...

        let stats = this.stats;

         if ( navigator.getVRDisplays ) {

            navigator.getVRDisplays().then ( ( displays ) => {

                console.log( 'WebVR::init(): webvr is available' );

                this.frameData = new VRFrameData(); // Contains our current pose.

                if ( this.frameData ) {

                    console.log( 'WebVR::init(): vr frame data is available' );

                    if ( displays.length > 0 )  {

                        let display = displays[ 0 ];

                        this.display = display;

                        if ( display ) {

                            console.log( 'WebVR::init(): valid vr display present' );

                            // Check if somehow already presenting.

                            if( display.isPresenting ) {

                                // reload?

                                console.warn( 'WebVR::init(): display was already presenting, exit first' );

                                this.exitPresent();

                            }

                            // Adjust depthNear and depthFar to device info, or provide defaults.

                            if ( ! display.depthNear ) {

                                display.depthNear = this.webgl.near;

                            } else {

                                this.webgl.near = display.depthNear;

                            }

                            if ( ! display.depthFar ) {

                                display.depthFar = this.webgl.far;

                            } else {

                                this.webgl.far = display.depthFar;

                            }

                            stats.displayName = display.displayName; // HMD name

                            // Set WebVR display stage parameters.

                            this.setStageParameters( display );

                            // Listen for WebVR events.

                            window.addEventListener( 'vrdisplaypresentchange', this.presentChange.bind( this ), false );

                            window.addEventListener( 'vrdisplayactivate', this.requestPresent.bind( this ), false );

                            window.addEventListener( 'vrdisplaydeactivate', this.exitPresent.bind( this ), false );

                        } // display is valid

                    } // displays.length > 0

                } // valid VRFrameData

            } ); // getVRDisplays returned a value

        } else {

            // We check for support prior to loading this module, so we shouldn't go here if not supported.

            console.error( 'WebVR::init(): webgl not present, or obsolete version' );

        }

    }

    /** 
     * Getter for frameData object.
     * @returns {VRFrameData} frame object for submission to the VR display.
     */
    getFrameData () {

        if ( this.display ) {

              let result = this.display.getFrameData( this.frameData );

              if ( result ) {

                    return this.frameData;

              }

              console.error( 'WebVR::getFrame(): display.getFrameData returned false' );

        }

        console.error( 'WebVR::getFrame(): display not available to get frameData' );

        return null;

    }

    /** 
     * Getter for the display.
     * @returns {VRDisplay} the found vr display.
     */
    getDisplay () {

        return this.display;

    }

    /** 
     * Set the stage parameters.
     * The check for size > 0 is necessary because some devices, like the
     * Oculus Rift, can give you a standing space coordinate but don't
     * have a configured play area. These devices will return a stage
     * size of 0.
     * @param {VRDisplay} the current vr display.
     */
    setStageParameters ( display ) {

        let sp = display.stageParameters;

        if ( sp ) {

            console.log( 'WebVR::setStageParameters(): vr display stageParameters present' );

            if ( sp.sizeX > 0 && sp.sizeZ > 0 ) {

                console.log( 'WebVR::setStageParameters(): vr device stageParameters sizeX:' + sp.sizeX + ' and sizeZ:' + sp.sizeZ );
                // TODO: trigger this in world.init();
                // this.world.resize( vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ );

            } else {

                console.log( 'WebVR::setStageParameters(): vr device reported stateParameters without a size, using defaults (3000' );

            }

        } else {

            // TODO: test early.

            console.error( 'vr deviced did not report stage parameters' );

        }

    }

    /** 
     * Pose matrix for standing roomscale view (move point of view up). Also multiply our 
     * current model-view matrix by the left and right eye view matrix.
     *
     * @param {glMatrix.vec4} mvMatrix the current model-view matrix.
     * @param {glmatrix.vec4} eyeView the frameData.leftViewMatrix or frameData.rightViewMatrix.
     * @param {glMatrix.vec4} pose matrix describing user pose.
     */
    getStandingViewMatrix ( mvMatrix, eyeView, pose ) {

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

            // This pulls us off the floor, and rotates the view on HTC Vive 90 degres clockwise in the xz direction.

            mat4.invert( mvMatrix, display.stageParameters.sittingToStandingTransform );

            mat4.multiply( mvMatrix, eyeView, mvMatrix );

        } else {

            /* 
             * After toji:
             * You'll want to translate the view to compensate for the
             * scene floor being at Y=0. Ideally this should match the user's
             * height (you may want to make it configurable). For this demo we'll
             * just assume all human beings are 1.65 meters (~5.4ft) tall.
             */

            mat4.identity( mvMatrix );

            mat4.translate( mvMatrix, mvMatrix, [ 0, PLAYER_HEIGHT, 0 ] );

            mat4.invert( mvMatrix, mvMatrix );

            mat4.multiply( mvMatrix, eyeView, mvMatrix );

        }

        return mvMatrix;

    }

    /* 
     * =============== VR EVENTS ====================
     */

     /** 
      * resize event when in VR mode. Changes canvas 
      * to hold stereo view.
      */
    vrResize () {

        console.log( 'WebVR::vrResize(): in vr resize' );

        let display = this.display,

        gl = this.webgl.getContext(),

        c = this.webgl.getCanvas(),

        p = c.parentNode;

        // Get the current size of the parent <div> for the <canvas>.

        this.oldWidth  = p.clientWidth  * f | 0;

        this.oldHeight = p.clientHeight * f | 0;

        const f = Math.max( window.devicePixelRatio, 1 );

        if ( display && display.isPresenting ) {

            console.log( 'WebVR::vrResize(): display presenting' );

            let leftEye = display.getEyeParameters( 'left' );

            let rightEye = display.getEyeParameters( 'right' );

            // Resize to twice the width of the mono display.

            let width = Math.max( leftEye.renderWidth, rightEye.renderWidth ) * 2;

            let height =  Math.max( leftEye.renderHeight, rightEye.renderHeight );

            c.width = width;

            c.height = height;

           // p.style.width = c.width + 'px'; // let it get full sized

           // p.style.height = c.height + 'px'; // let it get full-sized

            gl.viewportWidth = width;

            gl.viewportHeight = height;

            gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

            // Force parent to the same size

            console.log( 'WebVR::vrResize(): new width:' + c.width + ' height:' + c.height );

         } else {

            // Call the standard webgl object resize event.

            p.style.width = '';

            p.style.height = '';

            // Force a canvas resize, even if our window size did not change.

            this.webgl.resizeCanvas( true );

         }

    }

     /** 
      * User requested VR mode, or display HMD was activated.
      */
    requestPresent () {

        console.log( 'WebVR::requestPresent(): ' );

        let display = this.display;

        if ( display && display.capabilities.canPresent ) {

            display.requestPresent( [ { source: this.webgl.getCanvas() } ] )

            .then( () => {

                // success

                /* 
                 * Note: the <canvas> size changes, but it is wrapped in our <div> so 
                 * doesn't change size. This makes it easier to see the whole stereo view onscreen.
                 * 
                 * TODO: expand to window width???????
                 */

                console.log( 'WebVR::requestPresent(): present was successful' );

            }, () => {

                // ERROR
                // VRSamplesUtil.addError("requestPresent failed.", 2000);

                console.error( 'WebVR::requestPresent(): present failed' );

        } );

        } else {

            console.error( 'WebVR::requestPresent(): vrdisplay unable to present' );

        }

     }

     /**  
      * User requested exiting VR mode, or display HMD was deactivated.
      */
     exitPresent () {

        console.log( 'WebVR::exitPresent():' );

        let display = this.display;

        if ( display ) {

            if ( ! display.isPresenting ) {

            return;

            }

            display.exitPresent()

            .then( () => {

                // success

                // reset the canvas to full-screen.

                //this.vrResize();

                console.log( 'WebVR::exitPresent(): exited vrDisplay presentation' );

            }, () => {

                // ERROR

                //VRSamplesUtil.addError("exitPresent failed.", 2000);

                console.error( 'WebVR::exitPresent(): failed to exit vrDisplay presentation' );

            } );

        } else { 

            console.error( 'WebVR::exitPresent(): no valid vr display found' );

        }

     }

    /** 
     * VR Presentation has changed.
     */
    presentChange () {

        let display = this.display;

        // Handle resizes in both directions.

        this.vrResize();

        console.log( 'WebVR::presentChange():' );

        if ( display.isPresenting ) {

          if ( display.capabilities.hasExternalDisplay ) {

            // trigger exit vr in ui object

          }

        } else {

          if ( display.capabilities.hasExternalDisplay ) {

            // trigger enter vr in ui object

          }

        }

    }

    /** 
     * Provide statistics for display as JSON data.
     */
    stats () {

        return JSON.stringify( this.stats );

    }

}

export default WebVR;