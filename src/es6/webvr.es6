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

        this.webgl = webgl,

        window.displayName = 'window', // give it a display name

        this.displays = [ window ],    // display [ 0 ] is always 'window'

        this.cDisplay = this.displays[ 0 ],  // pointer to the current display

        this.frameData = null,         // VR frame data

        this.PLAYER_HEIGHT = 1.75;     // average player height.

        // Statistics object.

        this.stats = {

            vers: 1.0

        };

        // Listen for World init event.

        // Immediately initialize (for now).

        if ( init === true ) {

            this.init();

        }

    }

    /** 
     * Set the World object (which has .requestAnimationFrame)
     * @param {World} world the current world, including world.render() loop.
     */
    setWorld ( world ) {

        this.world = world;

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

        d = null;

        this.cDisplay = this.displays[ 0 ]; // zeroth position always window

         if ( navigator.getVRDisplays ) {

            navigator.getVRDisplays().then( ( displays ) => {

                console.log( 'WebVR::init(): webvr is available' );

                if ( 'VRFrameData' in window ) {

                    this.frameData = new VRFrameData(); // Contains our current pose.

                }

                // Only proceed if VRFrameData returned.

                if ( this.frameData ) {

                    console.log( 'WebVR::init(): VRFrameData is available for ' + displays.length + ' headsets' );

                    if ( displays.length > 0 )  {

                        console.log( 'WebVR::init(): ' + displays.length + ' displays are available' );

                        // Create our local wrapped display objects.

                        for ( let i = 0; i < displays.length; i++ ) {

                            d = displays[ i ];

                            if ( d.displayName === undefined ) {

                                d.displayName = 'Generic WebVR device';

                            }

                            // Add to our VRDisplay list.

                            console.log( 'WebVR::init(): pushing display (' + d.displayName + ')' );

                            this.displays.push( d );

                        }

                        // Grab the first VRDisplay.

                        d = this.cDisplay = this.displays[ 1 ];

                        // If VRDisplay is valid, set parameters.

                        if ( d ) {

                            console.log( 'WebVR::init(): valid vr display (' + d.displayName + ') present' );

                            // Check if we are somehow already presenting.

                            if( d.isPresenting ) {

                                console.warn( 'WebVR::init(): (' + d.displayName + ') was already presenting, exit first' );

                                this.exitPresent( 1 );

                            }

                            // Adjust depthNear and depthFar to device info, or provide defaults.

                            if ( d.depthNear ) {

                                this.webgl.near = d.depthNear;

                            } else {

                                d.depthNear = this.webgl.near;

                            }

                            if ( d.depthFar ) {

                                this.webgl.far = d.depthFar;

                            } else {

                                    d.depthFar = this.webgl.far;

                            }

                            // At present, the device name is the only static value in the display.

                            stats.displayName = d.displayName; // HMD name

                            // Set WebVR display stage parameters.

                            this.setStageParameters( d );

                            /** 
                             * Fire our pseudo-event VR_DISPLAY_READY for webvr capability.
                             * This is received by the UI to configure buttons, and World 
                             * to start the rendering process.
                             */

                            this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_READY, d );

                            // Listen for WebVR events.

                            window.addEventListener( 'vrdisplaypresentchange', this.presentChange.bind( this ), false );

                            window.addEventListener( 'vrdisplayconnected', this.displayConnected.bind( this ), false );

                            window.addEventListener( 'vrdisplaydisconnected', this.displayDisconnected.bind( this ), false );

                            // Not implemented in 2017.

                            window.addEventListener( 'vrdisplayactivate', this.displayActivated.bind( this ), false );

                            window.addEventListener( 'vrdisplaydeactivate', this.displayDeactivated.bind( this ), false );

                            window.addEventListener( 'vrdisplayblur', this.displayBlur.bind( this ), false );

                            window.addEventListener( 'vrdisplayfocus', this.displayFocus.bind( this ), false );

                        } // display is valid

                    } else { // WebVR is present, but displays.length == 0

                        console.warn( 'WebVR::init(): no VR displays found' );

                        this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

                    }  // no valid display

                } else { // valid VRFrameData

                    console.warn( 'WebVR::init(): invalid VRFrameData for ' + d );

                    this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

                } // end of valid VRFrameData

            }, ( reject ) => {

                console.warn( 'WebVR::init(): reject navigator.getVRDisplays, error is:' + reject + ' display is:' + d );

                this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

            } ).catch (

                ( error ) => {

                    console.warn( '&&&&&&&&&&&&&&&&&&&&&&&&&WebVR::init(): error navigator.getVRDisplays:' + error + ' display is:' + d );

                    this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

                }

            ); // getVRDisplays returned a value

        } else {

            // We check for support prior to loading this module, so we shouldn't go here if not supported.

            console.warn( 'WebVR::init(): WebVR API not present, or obsolete version' );

            this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

        }

    }

    /** 
     * Getter for frameData object.
     * @returns {VRFrameData} frame object for submission to the VR display.
     */
    getFrameData () {

        let d = this.cDisplay,

        fd = this.frameData;

        if ( d.getFrameData ) {

              let result = d.getFrameData( fd );

              if ( result ) {

                    return fd;

              }

              console.error( 'WebVR::getFrameData(): display (' + d.displayName + '), display.getFrameData returned:' + result );

              return null;

        }

        console.error( 'WebVR::getFrame(): display (' + d.displayName + ') does not have VRFrameData' );

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
    setStageParameters ( display ) {

        let d = display,

        sp = d.stageParameters;

        if ( sp ) {

            console.log( 'WebVR::setStageParameters(): vr display stageParameters present' );

            if ( sp.sizeX > 0 && sp.sizeZ > 0 ) {

                console.log( 'WebVR::setStageParameters(): device (' + d.displayName + ') stageParameters sizeX:' + sp.sizeX + ' and sizeZ:' + sp.sizeZ );

                // TODO: this.world.resize( d.stageParameters.sizeX, d.stageParameters.sizeZ );

            } else {

                console.log( 'WebVR::setStageParameters(): device (' + d.displayName + ') reported stageParameters without a size, using defaults (3000)' );

            }

        } else {

            // TODO: test early.

            console.error( 'vr device (' + d.displayName + ') did not report stage parameters' );

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

        d =  this.cDisplay;

        if ( d.stageParameters ) {

             /* 
             * After toji:
             * If the headset provides stageParameters use the
             * sittingToStandingTransform to transform the view matrix into a
             * space where the floor in the center of the users play space is the
             * origin.
             */

            // This pulls us off the floor, and rotates the view on HTC Vive 180 degres clockwise in the xz direction.

            mat4.invert( mvMatrix, d.stageParameters.sittingToStandingTransform );

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
     * VR PRESENTATION
     * ---------------------------------------
     */

     /** 
      * User requested VR mode, or display HMD was activated.
      * @param {String} displayNum the number of the display, 0 === window.
      */
    requestPresent ( displayNum ) {

        if ( this.world === null ) {

            console.error( 'WebVR::requestPresent(): world not available' );

            return false;
        }

        // Default to first VR device.

        if ( displayNum === undefined ) {

            displayNum = 1;

        }

        console.log( 'WebVR::requestPresent(): display(' + this.cDisplay.displayName + ')' );

        let world = this.world,

        d = this.displays[ displayNum ];

        if ( d && d.capabilities && d.capabilities.canPresent ) {

            d.requestPresent( [ { source: this.webgl.getCanvas() } ] )

            .then( () => { // fufilled

                // success

                // kill the old .rAF

                world.stop();

                // start the new .rAF with our new display

                this.cDisplay = d;

                world.start();

                /* 
                 * Note: the <canvas> size changes, but it is wrapped in our <div> so 
                 * doesn't change size. This makes it easier to see the whole stereo view onscreen.
                 * 
                 * Note: this triggers this.vrResize(), but NOT a window resize (handler: webgl.resize() ) event;
                 *
                 */

                console.log( 'WebVR::requestPresent(): present was successful' );

            }, ( reject ) => { // rejected

                console.error( 'WebVR::requestPresent(): reject, error:' + reject + ' for display:' + d );

            } ).catch (

                ( error ) => {

                    console.warn( '&&&&&&&&&&&&&&&&&&&&&&&&&WebVR::requestPresent(): catch, error is:' + error + ' for display:' + d );

                    /////////////this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

                }

            );

        } else {

            console.error( '&&&&&&&&&&&&&&&&WebVR::requestPresent(): vrdisplay (' + d.displayName + ') is not a valid vr display' );

        }

        return false;

     }

     /**  
      * User requested exiting VR mode, or display HMD was deactivated.
      * Return to window-based display.
      */
     exitPresent ( displayNum ) {

        console.log( 'WebVR::exitPresent(): event' );

        if ( this.world === null ) {

            console.error( 'WebVR::requestPresent(): world not available' );

            return false;
        }

        let d = this.cDisplay,

        world = this.world;

        if ( displayNum !== undefined ) {
            
            d = this.displays[ displayNum ];

        }

        // Confirm that this display has an .exitPresent method.

        if ( d.exitPresent ) {

            d.exitPresent() // NO semicolon!

            .then( () => {

                /* 
                 * Success!
                 *
                 * Note: this triggers this.vrResize().
                 */

                 world.stop();

                 this.cDisplay = this.displays[ 0 ];

                 world.start();

                console.log( 'WebVR::exitPresent(): exited display (' + d.displayName + ') presentation to (' + this.cDisplay.displayName + ')' );

            }, ( reject ) => {

                console.error( 'WebVR::exitPresent(): reject for display(' + d.displayName + '), error:' + reject );

                this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

            } ).catch (

                ( error ) => {

                    console.warn( '&&&&&&&&&&&&&&&&&&&&&&&&&WebVR::exitPresent(): error for display (' + d.displayName + '), error:' + error );

                    this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

                }

            );

        } else { 

            console.error( 'WebVR::exitPresent(): display (' + d.displayName + ') is not a vr display' );

            this.util.emitter.emit( this.util.emitter.events.VR_DISPLAY_FAIL, d );

        }

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

        let d = this.cDisplay,

        gl = this.webgl.getContext(),

        c = this.webgl.getCanvas(),

        p = c.parentNode;

        console.log( 'WebVR::vrResize(): resize for display (' + d.displayName + ')' );

        // Get the current size of the parent <div> for the <canvas>.

        this.oldWidth  = p.clientWidth  * f | 0;

        this.oldHeight = p.clientHeight * f | 0;

        const f = Math.max( window.devicePixelRatio, 1 );

        if ( d && d.isPresenting ) {

            console.log( 'WebVR::vrResize(): display (' + d.displayName + ') currently presenting' );

            let leftEye = d.getEyeParameters( 'left' );

            let rightEye = d.getEyeParameters( 'right' );

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

            console.log( 'WebVR::vrResize(): calling standard window resize' );

            /* 
             * Force a canvas resize, even if our window size did not change. 
             * Note: This changes the viewport to fill the canvas, instead of 2 stereo regions.
             */

            this.webgl.resizeCanvas( true );

         }

    }

    /** 
     * VR Presentation has changed.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/onvrdisplaypresentchange
     */
    presentChange () {

        let d = this.cDisplay;

        // Handle resizes in both directions.

        this.vrResize();

        console.log( 'WebVR::presentChange(): event for ' + d.displayName );

        if ( d.isPresenting ) {

          if ( d.capabilities && d.capabilities.hasExternalDisplay ) {

            // Any changes needed when we jump to VR presenting.

          }

        } else {

          if ( d.capabilities && d.capabilities.hasExternalDisplay ) {

            // Any changes needed when we leave VR presenting.

          }

        }

    }

    /** 
     * Display was temporarily paused.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/onvrdisplayblur
     */
    displayBlur () {

        console.warn( 'WebVR::displayBlur(): display blur event' );

    }

    /** 
     * Display was unpaused.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/onvrdisplayfocus
     */
    displayFocus () {

        console.warn( 'WebVR::displayFocus(): display focus event' );

    }

    /** 
     * A display was activated (display is able to present).
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/onvrdisplayactivate
     */
    displayActivated () {

        console.warn( 'WebVR::displayActivated(): display activation event' );

    }

    /** 
     * A displays was deactivated (e.g. standby or sleep mode).
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/onvrdisplaydeactivate
     */
    displayDeactivated () {

        console.warn( 'WebVR::displayDeactivated(): display deactivation event' );

    }

    /**
     * A display was connected.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/onvrdisplayconnected
     */
    displayConnected () {

        console.warn( 'WebVR::displayConnected(): display connected event' );

    }

    /** 
     * A display was disconnected.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/Window/onvrdisplaydisconnected
     */
    displayDisconnected () {

        console.warn( 'WebVR::displayDisconnected(): display disconnected event' );

    }

    /** 
     * Provide statistics for display as JSON data.
     */
    stats () {

        return JSON.stringify( this.stats );

    }

}

export default WebVR;