
'use strict'

class Lights {
    
    constructor ( glMatrix, ambient = [ 0.1, 0.1, 0.1 ], lightingDirection = [ -0.25, -0.5, -0.1 ], 

        directionalColor = [ 0.7, 0.7, 0.7 ] ) {

        this.glMatrix = glMatrix;

        this.lightTypes = {

            LIGHT_0: 'light0',

            LIGHT_1: 'light1',

            LIGHT_2: 'light2',

            LIGHT_3: 'light3'

        };

        this.lightList = [];

        this.lightList[ this.lightTypes.LIGHT_0 ] = {

            ambient: ambient,          

            lightingDirection: lightingDirection,

            directionalColor: directionalColor
                    
        };

    }

    getLight( id ) {

        window.lightList = this.lightList;

        return this.lightList[ id ];

    }

    /** 
     * Set Light to an XYZ coordinate.
     */
    setPos ( id, x, y, z ) {

        // TODO:

    }

    /**
     * Set Light by Polar coordinates.
     */
    setPolar ( id, u, v ) {

        // TODO:

    }

}

export default Lights;