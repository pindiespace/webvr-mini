'use strict'

class WebVR {

    /** 
     * @class
     * render scenes to webvr devices
     * following toji's room-scale example:
     * @link https://github.com/toji/webvr.info/blob/master/samples/05-room-scale.html
     * Note: significant webvr code in Shader parent object (sets left and right eye matrix).
     * @constructor
     */
    constructor ( init, util, glMatrix, webgl  ) {

        console.log( 'in webVR class' );

        this.util = util,

        this.glMatrix = glMatrix,

        this.webgl = webgl;

        this.vrVers = 1.0,          // TODO: is there any way to get this?

        window.displayName = 'window', // give it a display name

        this.displays = [ window ], // display [ 0 ] is always 'window'

        this.cDisplay = this.displays[ 0 ],  // pointer to the current display

        this.frameData = null,      // VR frame data

        this.PLAYER_HEIGHT = 1.75;  // average player height.

        // Statistics object.

        this.stats = {};

        console.log("DISPLAY STARTS AS:" + this.cDisplay)

        // Listen for World init event.

        // Immediately initialize (for now).

        if ( init === true ) {

            this.init();

        }

    }

    /** 
     * Switch displays.
     */
    switchDisplay ( displayNum ) {

        if ( this.displays[ displayNum ] !== undefined ) {

            let od = this.cDisplay;

            let nd = this.displays[ displayNum ];

            if ( ( 'requestAnimationFrame' in nd ) === true ) {

                this.cDisplay = this.displays[ displayNum ];

                this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_CHANGED, oldDisplay, this.cDisplay );

            } else {

                console.error( 'WebVR::switchDisplays(): display:' + display.displayName + ' at position:' + displayNum + ' does not have .requestAnimationFrame' );

            }

        } else {

            console.error( 'WebVR::switchDisplays(): display:' + displayNum + ' is not defined' );
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
     * Note: in Mar 2017, FF only supported Oculus, 
     * needed Chromium WebVR build to support Vive.
     */
    init () {

        // Collect stats no matter what...

        let stats = this.stats,

        disp = null;

        this.cDisplay = this.displays[ 0 ]; // zeroth position always window

         if ( navigator.getVRDisplays ) {

            navigator.getVRDisplays().then( ( displays ) => {

                console.log( '=================WebVR::init(): webvr is available' );

                if ( 'VRFrameData' in window ) {

                    this.frameData = new VRFrameData(); // Contains our current pose.

                }

                if ( this.frameData ) {

                    console.log( 'WebVR::init(): vr VRFrameData is available for ' + displays.length + ' headsets' );

                    if ( displays.length > 0 )  {

                        console.log( 'WebVR::init(): ' + displays.length + ' displays are available' );

                        // Create our local wrapped display objects.

                        for ( let i = 0; i < displays.length; i++ ) {

                            disp = displays[ i ];

                            if ( disp.displayName === undefined ) {

                                disp.displayName = 'Generic WebVR device';

                                console.log('*********************PUSHING DISPLAY' + display.displayName)

                            }

                            this.displays.push( disp );

                        }

                        disp = this.displays[ 1 ]; // first VR device

                        if ( disp ) {

                            console.log( 'WebVR::init(): valid vr display (' + disp.displayName + ') present' );

                            // Check if we are somehow already presenting.

                            if( disp.isPresenting ) {

                                console.warn( 'WebVR::init(): ' + disp.displayName + ' was already presenting, exit first' );

                                this.exitPresent( disp );

                            }

                            // Adjust depthNear and depthFar to device info, or provide defaults.

                            if ( disp.depthNear ) {

                                this.webgl.near = disp.depthNear;

                            } else {

                                disp.depthNear = this.webgl.near;

                            }

                            if ( disp.depthFar ) {

                                this.webgl.far = disp.depthFar;

                            } else {

                                    disp.depthFar = this.webgl.far;

                            }

                            // At present, the device name is the only static value in the display.

                            stats.displayName = disp.displayName; // HMD name

                            // Set WebVR display stage parameters.

                            this.setStageParameters( disp );

                            /** 
                             * Fire our pseudo-event VR_DISPLAY_READY for webvr capability.
                             * This is received by the UI to configure buttons, and World 
                             * to start the rendering process.
                             */

                            this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_READY, disp.displayName );

                            // Listen for WebVR events.

                            window.addEventListener( 'vrdisplaypresentchange', this.presentChange.bind( this ), false );

                            window.addEventListener( 'vrdisplayactivate', this.requestPresent.bind( this ), false );

                            window.addEventListener( 'vrdisplaydeactivate', this.exitPresent.bind( this ), false );

                        } // display is valid

                    } else { // WebVR is present, but displays.length == 0

                        console.warn( 'WebVR::init(): no VR displays found' );

                        this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, 'none' );

                    }  // no valid display

                } else { // valid VRFrameData

                    console.warn( 'WebVR::init(): invalid VRFrameData' );

                    this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, 'none' );

                } // end of valid VRFrameData

            }, ( error ) => {

                console.warn( 'WebVR::init(): failed to access navigator.getVRDisplays, error is:' + error + ' display is:' + disp );

                this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, 'none' );

            } ).catch (

                ( error ) => {

                    console.warn( '&&&&&&&&&&&&&&&&&&&&&&&&&WebVR::init(): navigator.getVRDisplays access error, error is:' + error + ' display is:' + disp );

                    this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, 'none' );

                }

            ); // getVRDisplays returned a value

        } else {

            // We check for support prior to loading this module, so we shouldn't go here if not supported.

            console.warn( 'WebVR::init(): WebVR API not present, or obsolete version' );

            this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, 'none' );

        }

    }

    /** 
     * Getter for frameData object.
     * @returns {VRFrameData} frame object for submission to the VR display.
     */
    getFrameData () {

        if ( this.cDisplay.getFrameData ) {

              let result = this.cDisplay.getFrameData( this.frameData );

              if ( result ) {

                    return this.frameData;

              }

              console.error( 'WebVR::getFrameData(): for display ' + this.cDisplay.displayName + ', display.getFrameData returned:' + result );

              return null;

        }

        console.error( 'WebVR::getFrame(): display ' + this.cDisplay.displayName + ' does not have VRFrameData' );

        return null;

    }

    /** 
     * Check if we have WebVR
     */
    hasWebVR () {

        return !! ( 'VRFrameData' in window && 'getVRDisplays' in navigator );

    }

    /** 
     * Check if we have access to a WebVR display
     */
    hasWebVRDisplay () {

        return !! ( this.hasWebVR() && this.cDisplay && this.cDisplay.getFrameData );

    }

    /** 
     * Getter for the display.
     * @returns {VRDisplay} the found vr display.
     */
    getDisplay () {

        return this.cDisplay;

    }

    /** 
     * Set the stage parameters.
     * The check for size > 0 is necessary because some devices, like the
     * Oculus Rift, can give you a standing space coordinate but don't
     * have a configured play area. These devices will return a stage
     * size of 0.
     * @param {VRDisplay} the current VRDisplay object.
     */
    setStageParameters ( disp ) {

        let sp = disp.stageParameters;

        if ( sp ) {

            console.log( 'WebVR::setStageParameters(): vr display stageParameters present' );

            if ( sp.sizeX > 0 && sp.sizeZ > 0 ) {

                console.log( 'WebVR::setStageParameters(): vr device ' + disp.displayName + ' stageParameters sizeX:' + sp.sizeX + ' and sizeZ:' + sp.sizeZ );
                // TODO: trigger this in world.init();
                // this.world.resize( disp.stageParameters.sizeX, disp.stageParameters.sizeZ );

            } else {

                console.log( 'WebVR::setStageParameters(): vr device reported stateParameters without a size, using defaults (3000)' );

            }

        } else {

            // TODO: test early.

            console.error( 'vr device did not report stage parameters' );

        }

    }

    /** 
     * Pose matrix for standing roomscale view (move point of view up). Also multiply our 
     * current model-view matrix by the left and right eye view matrix. After Toji.
     *
     * @param {glMatrix.vec4} mvMatrix the current model-view matrix.
     * @param {glmatrix.vec4} eyeView the frameData.leftViewMatrix or frameData.rightViewMatrix.
     * @param {glMatrix.vec4} pose matrix describing user pose.
     */
    getStandingViewMatrix ( mvMatrix, eyeView, pose ) {

        let mat4 = this.glMatrix.mat4,

        disp =  this.cDisplay;

        if ( disp.stageParameters ) {

             /* 
             * After toji:
             * If the headset provides stageParameters use the
             * sittingToStandingTransform to transform the view matrix into a
             * space where the floor in the center of the users play space is the
             * origin.
             */

            // This pulls us off the floor, and rotates the view on HTC Vive 180 degres clockwise in the xz direction.

            mat4.invert( mvMatrix, disp.stageParameters.sittingToStandingTransform );

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

            mat4.translate( mvMatrix, mvMatrix, [ 0, this.PLAYER_HEIGHT, 0 ] );

            mat4.invert( mvMatrix, mvMatrix );

            mat4.multiply( mvMatrix, eyeView, mvMatrix );

        }

        return mvMatrix;

    }

    /* 
     * ---------------------------------------
     * VR EVENTS
     * ---------------------------------------
     */

     /** 
      * resize event when in VR mode. Changes canvas 
      * to hold stereo view. Since it mixes in WebVR display 
      * objects, we put it here, instead of in Ui.
      */
    vrResize () {

        console.log( 'WebVR::vrResize(): in vr resize' );

        let disp = this.cDisplay,

        gl = this.webgl.getContext(),

        c = this.webgl.getCanvas(),

        p = c.parentNode;

        // Get the current size of the parent <div> for the <canvas>.

        this.oldWidth  = p.clientWidth  * f | 0;

        this.oldHeight = p.clientHeight * f | 0;

        const f = Math.max( window.devicePixelRatio, 1 );

        if ( disp && disp.isPresenting ) {

            console.log( 'WebVR::vrResize(): display ' + disp.displayName + ' presenting' );

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

            /* 
             * Force a canvas resize, even if our window size did not change. 
             * Note: This changes the viewport to fill the canvas, instead of 2 stereo regions.
             */

            this.webgl.resizeCanvas( true );

         }

    }


     /** 
      * User requested VR mode, or display HMD was activated.
      * @param {String} displayNum the number of the display, 0 === window.
      */
    requestPresent ( displayNum ) {

        console.log( 'WebVR::requestPresent(): display is a:' + this.cDisplay );

        // Default to first VR device.

        if ( displayNum === undefined ) displayNum = 1;

        let disp = this.displays[ displayNum ];

        if ( disp && disp.capabilities && disp.capabilities.canPresent ) {

            disp.requestPresent( [ { source: this.webgl.getCanvas() } ] )

            .then( () => { // fufilled

                // success

                // kill the old .rAF

                world.stop();

                // start the new .rAF

                this.cDisplay = disp;

                world.start();

                /* 
                 * Note: the <canvas> size changes, but it is wrapped in our <div> so 
                 * doesn't change size. This makes it easier to see the whole stereo view onscreen.
                 * 
                 * Note: this triggers this.vrResize(), but NOT a window resize (handler: webgl.resize() ) event;
                 *
                 */

                console.log( 'WebVR::requestPresent(): present was successful' );

            }, () => { // rejected

                console.error( 'WebVR::requestPresent(): present failed' );

            } ).catch (

                ( error ) => {

                    console.warn( '&&&&&&&&&&&&&&&&&&&&&&&&&WebVR::requestPresent(): error, error is:' + error + ' display is:' + this.cDisplay );

                    /////////////this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, 'none' );

                }

            );

        } else {

            console.error( 'WebVR::requestPresent(): vrdisplay ' + disp.displayName + ' not a valid vr display' );

        }

     }

     /**  
      * User requested exiting VR mode, or display HMD was deactivated.
      * Return to window-based display.
      */
     exitPresent ( displayNum ) {

        console.log( 'WebVR::exitPresent(): event' );

        let disp = this.cDisplay;

        if ( disp.exitPresent ) {

            disp.exitPresent() // NO semicolon!

            .then( () => {

                /* 
                 * Success!
                 *
                 * Note: this triggers this.vrResize().
                 */

                 world.stop();

                 this.cDisplay = this.displays[ 0 ];

                 world.start();

                console.log( 'WebVR::exitPresent(): exited display ' + disp.displayName + ' presentation' );

            }, () => {

                console.error( 'WebVR::exitPresent(): failed to exit display ' + disp.displayName + ' presentation' );

            } ).catch (

                ( error ) => {

                    console.warn( '&&&&&&&&&&&&&&&&&&&&&&&&&WebVR::exitPresent(): error, error is:' + error + ' display is:' + this.cDisplay );

                    /////////////this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, 'none' );

                }

            );

        } else { 

            console.error( 'WebVR::exitPresent(): display ' + display.displayName + ' not a vr display' );

        }

     }

    /** 
     * VR Presentation has changed.
     */
    presentChange () {

        let disp = this.cDisplay;

        // Handle resizes in both directions.

        this.vrResize();

        console.log( 'WebVR::presentChange(): event for ' + disp.displayName );

        if ( disp.isPresenting ) {

          if ( disp.capabilities && disp.capabilities.hasExternalDisplay ) {

            // Any changes needed when we jump to VR presenting.

          }

        } else {

          if ( disp.capabilities && disp.capabilities.hasExternalDisplay ) {

            // Any changes needed when we leave VR presenting.

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