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

        this.MAX_WAIT_TIME = 50,

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
     */
    getWrappedFetch ( url, params ) {

        let wrappedPromise = this.getWrappedPromise();

        let req = new Request( url, params );

        // Apply arguments to fetch

        fetch( req )

        .then ( 

            ( response ) => {

                wrappedPromise.resolve( response );

            },

            ( error ) => {

                wrappedPromise.reject( response );

            }

        )

        .catch (

            ( error ) => {

                wrappedPromise.catch( error );

            }

        );

        return wrappedPromise;

    }

    doRequest( requestURL, pos, updateFn, cacheBust = true, mimeType = 'text/plain', numTries = 0 ) {

        // Create our wrapped (with timeout) fetch request (url, params)

        let ft = this.getWrappedFetch( 

            cacheBust ? requestURL + '?' + new Date().getTime() : requestURL,

            {

                method: 'get',// optional, "GET" is default value

                mode: 'cors',

                redirect: 'follow',

                headers: {

                    'Accept': mimeType

                }

            }

        );

        // Create a custom results object.

        let result = {

            path: requestURL,

            pos: pos,

            data: null,

            numTries: numTries,

            message: 'ok'

        };

        // Add a timeout rejection.

        let delay = this.MAX_WAIT_TIME * ( 1 + numTries );

        let timeoutId = setTimeout( () => {

                // otherwise, reject the request

                result.message = new Error( 'GetAssets::doRequest() in TIMEOUT: Load timeout (' + delay + 'ms) for resource: ' + requestURL );

                console.error( 'GetAssets::doRequest() in TIMEOUT: result.data is:' + result.data );

                clearTimeout( timeoutId ); // must clear for re-try!!

               ft.reject( result ); // reject on timeout

            }, 

            delay // TODO: DOUBLE THIS UNTIL MAX_TRIES

        );

        return ft.promise

        .then ( ( response ) => {

            clearTimeout( timeoutId );

            if ( response.status === 200 || response.status === 0 ) {

                // we got something back

                console.error( 'GetAssets::doRequest() in THEN: response is:' + typeof response );


                if ( mimeType === 'application/json' ) {

                    result.data = response.json();

                    return Promise.resolve( result.data );

                } else if ( mimeType.indexOf( 'text' ) !== this.util.NOT_IN_LIST ) {

                    result.data = response.text();

                    return Promise.resolve( result.data );

                } else if ( mimeType === 'application/xml' ) {

                    result.data = response.formData();

                    return Promise.resolve( result.data );

                } else { // all other mime types (e.g. images, audio, video)

                    result.data = response.blob();

                    return Promise.resolve( result.data );

                }

            } else {

                result.message = new Error( 'GetAssets::doRequest(): Status error(' + response.statusText +  'for resource' + requestURL )

                return Promise.reject( result );

            }

        } )

        // TODO: add 'then' here to pass result, rather than result-data

        ///.then ( ( data ) => {

        // result.data = data;

        ///    updateFn( result );

        ///    } ); // provided by caller, tests if it is complete/ready

    }


    /** 
     * Trigger an individual request.
     */
    addRequest ( paths, updateFn, cacheBust, mimeType, numTries ) {

        this.doRequest( paths, updateFn, cacheBust, mimeType, numTries )  // initial request at 0 tries

        .then( 

            ( response ) => {

                console.error( 'GetAssets::addRequest(): doRequest complete, rrresponse is a:' + response );

                updateFn( response ); // function determines whether the requestor has everything it needs

            },

            ( error ) => {

                console.error( 'GetAssets::addRequests(): An error occured!' );

                console.error( error.message ? error.message : error );

                 updateFn( error );

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

        for ( let i = 0; i < paths.length; i++ ) {

            let path = paths[ i ];

            console.log("GetAssets::addRequests(): " +  path, ", " + typeof requestor.updateFn + ", " + requestor.cacheBust + ", " + requestor.mimeType )

            this.doRequest( path, i, requestor.updateFn, requestor.cacheBust, requestor.mimeType, 0 ) // initial request at 0 tries

            .then( 

                ( response ) => {

                    requestor.updateFn( response ); // function determines whether the requestor has everything it needs

                },

                ( error ) => {

                    console.error( 'GetAssets::addRequests(): An error occured!' );

                    console.error( error.message ? error.message : error );

                     requestor.updateFn( error );

                }

            );

        } // end of request loop

    } // end of addRequests()

}

export default GetAssets;