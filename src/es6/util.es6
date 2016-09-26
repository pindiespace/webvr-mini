export default class Util {

    constructor () {

        console.log( 'in Util' );

    }

    // See if we're running in an iframe.
    isIFrame () {

        try {

            return window.self !== window.top;

        } catch (e) {

            return true;

        }

        return false;

    }

}