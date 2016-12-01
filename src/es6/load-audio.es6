import LoadPool from  './load-pool';

class LoadAudio extends LoadPool {

    /**
     * Base loader class.
     * @link https://www.html5rocks.com/en/tutorials/webaudio/intro/
     * @link http://mdn.github.io/fetch-examples/fetch-array-buffer/
     */

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'in LoadAudio class' );

        let MAX_CACHE_AUDIO = 3;

        super( init, util, glMatrix, webgl, MAX_CACHE_AUDIO );

        this.audioCtx = new ( window.AudioContext || window.webkitAudioContext )();

        this.sources = {};

        if ( init === true ) {


        }

    }

    uploadAudio ( loadObj, callback ) {

        let audio = loadObj.prim.audio;

        let audioObj = {
            audio: loadObj.audio,
            src: loadObj.src,
        };

        // TODO: set audio volume, etc.

        audio.push( audioObj );

        // Clear the object for re-use.

        loadObj.busy = false;

        this.update( loadObj );

    }

    createLoadObj ( waitObj ) {

        loadObj = {};

        loadObj.src = waitObj.source;

        loadObj.audio = this.audioCtx.createBufferSource();

        let req = new Request( waitObj.source );

        // TODO: SET CORS and mime type

        fetch( req ).then( function ( response ) {

            if ( ! response.ok ) {

                throw Error( response.statusText );

            }

            return response.arrayBuffer();

        } ).then ( function ( buffer ) {

            if ( ! buffer ) {

                throw Error ( 'no audio arrayBuffer' );
            }

            this.audioCtx.decodeAudioData( buffer, function ( decodedData ) {

                loadObj.audio.buffer = decodedData;

                loadObj.audio.connect( this.audioCtx.destination );

                // Attach to prim.

                this.update( loadObj );

            } );

        } ).catch ( function ( err ) {

                console.error( err );

        } );

    }

}

export default LoadAudio;