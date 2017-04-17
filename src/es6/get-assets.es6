
'use strict'

class GetAssets {

    /** 
     * Load a set of URLs to grab, and run parallel, queued requests until 
     * complete or timed out. Also provide a callback so the requesting object 
     * can check if their load is complete.
     * Inspired by:
     * @link https://blog.hospodarets.com/fetch_in_action
     */
    constructor ( util ) {

        this.util = util,

        this.emitter = util.emitter,

        this.MIN_WAIT_TIME = 100,

        this.MAX_TRIES = 6;

    }

    /** 
     * Wrap a Promise in an object.
     */
    getWrappedPromise () {

        let wrappedPromise = {},

        promise = new Promise( ( resolve, reject ) => {

            wrappedPromise.resolve = resolve,

            wrappedPromise.reject = reject; 

        } );

        wrappedPromise.then = promise.then.bind( promise );

        wrappedPromise.catch = promise.catch.bind( promise );

        wrappedPromise.promise = promise;

        return wrappedPromise;

    }

    /** 
     * get fetch wrapped into a wrapped Promise.
     * @link http://stackoverflow.com/questions/35520790/error-handling-for-fetch-in-aurelia
     */
    getWrappedFetch ( url, params, tries, key ) {

        let wrappedPromise = this.getWrappedPromise();

        let req = new Request( url, params );

        wrappedPromise.url = url;

        wrappedPromise.params = params;

        wrappedPromise.tries = tries;

        wrappedPromise.key = key;

        // Start the timeout, which lengthens with each attempt.

        wrappedPromise.timeoutId = setTimeout( () => {

            console.warn( 'GetAssets::getWrappedFetch(): TIMEOUT ' + wrappedPromise.url );

            wrappedPromise.catch( 0 );

        }, this.MIN_WAIT_TIME * wrappedPromise.tries );


        // Apply arguments to fetch.

        fetch( req )

        .then (

            ( response ) => { 

                if ( ! response.ok ) { // catch 404 errors

                    throw new Error('Network response was not ok for ' + wrappedPromise.url );

                } else {

                    return response; // send to the next '.then'

                }

            }

        )

        .then ( 

            ( response ) => {

                console.warn( 'GetAssets::getWrappedFetch(): OK, RESOLVE ' + wrappedPromise.url );

                clearTimeout( wrappedPromise.timeoutId );

                return wrappedPromise.resolve( response );

            },

            ( error ) => {

                console.warn( 'GetAssets::getWrappedFetch(): NOT OK, REJECT ' + wrappedPromise.url );

                clearTimeout( wrappedPromise.timeoutId );

                window.res = error;

                return wrappedPromise.reject( error ); // fixes it!!!!!!!!!!!!!!! USING Error causes a strange fail!!!!

            }

        )

        .catch (

            ( error ) => {

                console.warn( 'GetAssets::getWrappedFetch(): NOT OK, CATCH ' + wrappedPromise.url );

                clearTimeout( wrappedPromise.timeoutId );

                return wrappedPromise.catch( error );

            }

        );

        return wrappedPromise;

    }


    /** 
     * Get an individual file.
     * @param {String} requestURL the file path for our asset.
     * @param {String} key identifier key for the asset, so the requesting object can put it in the right place.
     * @param {Function} updateFn callback function when an asset loads or fails
     * @param {Boolean} cacheBust if true, add a random query string to avoid caching
     * @param {String} mimeType the MIME type of the expected data
     * @param {Number} tries. If load fails, try to load again with a longer timeout. Load until 
     *        number of 'tries' = this.MAX_TRIES. Lengthen the timeout with each try.
     */
    doRequest( requestURL, key, updateFn, cacheBust = true, mimeType = 'text/plain', tries = 0 ) {

        console.log(">>>>MIMETYPE:" + mimeType )

        let headers = new Headers( {

            'Content-Type': mimeType

        } ); 

        let ft = this.getWrappedFetch( 

            cacheBust ? requestURL + '?' + new Date().getTime() : requestURL,

            {

                method: 'get',// optional, "GET" is default value

                mode: 'cors',

                redirect: 'follow',

                headers: headers,

                //headers: {

                //    'Accept': mimeType

                //}

            },

            tries, // attach some additional variables to this fetch

            key // key identifier for object requested, from the calling requestor object.

        );


        // Return the Promise.

        return ft.promise

        .then ( 

            ( response ) => {

                console.warn( '1. GetAssets::doRequest(): ft.promise FIRST .then OK, response.status:' + response.status + ' for ' + ft.url );

                console.warn( '1. GetAssets::doRequest(): ft.promise FIRST .then OK, response:' + response + ' for ' + ft.url );

                console.warn( '1. GetAssets::doRequest(): ft.promise FIRST .then OK, tries:' + ft.tries + ' for ' + ft.url );

                console.warn( '1. GetAssets::doRequest(): ft.promise FIRST .then OK, mimeType:' + mimeType + ' for ' + ft.url );

                let data = null;

                // Check response.status ('0' is ok if we are serving from desktop os).

                if ( response.status === 200 || response.status === 0 ) {

                    if ( mimeType === 'application/json' ) {

                        data = response.json();

                    } else if ( mimeType.indexOf( 'text' ) !== this.util.NOT_IN_LIST ) {

                        data = response.text();

                    } else if ( mimeType === 'application/xml' ) {

                        data = response.formData();

                    } else if ( mimeType.indexOf( 'image') !== this.util.NOT_IN_LIST ) {

                        data = response.blob();

                        // TODO: data = arraybufferview type
                        ///TODO: data = response.arrayBuffer(); // NEED ARRAYBUFFERVIEW

                    } else { // all other mime types (e.g. audio, video)

                        data = response.blob();

                    }

                    // Return a resolved Promise to the next '.then'.

                    return Promise.resolve( data );

                } else {

                    return Promise.reject( response );

                }

            },

            ( error ) => { // Triggered by setTimeout(). Try up to this.MAX_TRIES before giving up.

                console.warn( '2. GetAssets::doRequest(): ft.promise FIRST .then error, error:' + error + ' for ' + ft.url );

                console.warn( '2. GetAssets::doRequest(): ft.promise FIRST .then error, tries:' + ft.tries + ' for ' + ft.url );

                ft.tries++;

                if ( ft.tries < this.MAX_TRIES ) {

                    console.warn( 'GetAssets::doRequest(): ft.promise FIRST .then error, TRYING AGAIN:' + error + ' for ' + ft.url );

                    this.doRequest( requestURL, key, updateFn, cacheBust = true, mimeType, ft.tries );

                }

                return Promise.resolve( error );

            } 

        )

        .then (

            ( response ) => {

                if ( response instanceof Error ) {

                    // Run the callback with error values.

                    updateFn( { key: key, path: requestURL, data: null, error: response } ); // Send a wrapped error object

                } else {

                    // Run the callback we got in the original request, return received file in data.

                    console.log('>>>>>>>>>>>>>>about to call update function!!!!!!')

                    updateFn( { key: key, path: requestURL, data: response, error: false } ); // Send the data to the caller.

                }

            },

            ( error ) => {

                // Unknown error?

                return Promise.reject( 0 );

            }

        );

    }

    /** 
     * Add fetch() url requests for resolve, with a timeout for fails. 
     * when individual fetch()es are complete, run a callback.
     * when all fetch()es are complete, run a final callback
     * usage: addRequests( requestor, '/first.jpg', 'second.jpg',...);
     * @param {Object} requestor the name of the requestor.
     *         - requestor.name = the name of the requestor
     *         - requestor.updateFn = the function receiving data from the fetch() call
     *         - requestor.cacheBust = if true, randomize URL query string to prevent caching
     *         - requestor.mimeType = if present, set to a specific MIME type. Default = text/text
     * @param {Function} updateFn the function to call after each fetch completes. The 
     * calling program is responsible for handing determining if it has enough fetch() 
     * operations to complete. 
     */
    addRequests ( requestor ) {

        let paths = requestor.files;

        // TODO: THIS CAN BE A KEY. ONE CAN CHECK THE POOL (maintained here???) for a key, which doesn't have to be Array position
        // TODO: use an associative key!!!!!!!!!

        for ( let i = 0; i < paths.length; i++ ) {

            let path = paths[ i ];

            console.log("GetAssets::addRequests(): " +  path, ", " + typeof requestor.updateFn + ", " + requestor.cacheBust + ", " + requestor.mimeType )

            this.doRequest( path, i, requestor.updateFn, requestor.cacheBust, requestor.mimeType, 0 ); // initial request at 0 tries

        } // end of request loop

    } // end of addRequests()

}

export default GetAssets;