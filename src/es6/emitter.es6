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

    }

    emit ( eventName ) {

        let callbacks = this.callbacks[ eventName ];

        if ( ! callbacks ) {

            return;

        }

        // Convert arguments to useful Array.

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