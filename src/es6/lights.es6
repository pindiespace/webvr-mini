
'use strict'

class Lights {
    
    constructor ( glMatrix, ambient = [ 0.3, 0.3, 0.3 ], lightingDirection = [ -1000.0, 0.0, 1000.1 ], 

        directionalColor = [ 1, 1, 1 ] ) {

        this.glMatrix = glMatrix;

        this.lightTypes = {

            LIGHT_0: 'light0',  // World Directional (default)

            LIGHT_1: 'light1',

            LIGHT_2: 'light2',

            LIGHT_3: 'light3'

        };

        this.lightList = [];

        this.lightList[ this.lightTypes.LIGHT_0 ] = {

            ambient: ambient,

            lightingDirection: [ lightingDirection[ 0 ], lightingDirection[ 1 ], lightingDirection[ 2 ] ],

            directionalColor: directionalColor,

            attenuation: 0.0,

            radius: 1.0

        };

    }

    getLight( id ) {

        if ( ! id ) {

            id = this.lightTypes.LIGHT_0;

        }

        return this.lightList[ id ];

    }

    getPos ( id ) {

        if ( ! id ) {

            id = this.lightTypes.LIGHT_0;

        }

        return this.lightList[ id ].lightingDirection;

    }

    /** 
     * Set Light to an XYZ coordinate.
     */
    setPos ( id, x, y, z ) {

        if ( ! id ) {

            id = this.lightTypes.LIGHT_0;

        }        

        this.lightList[ id ].lightingDirection = [ -x, -y, z ];

    }

    /**
     * Set Light by Polar coordinates.
     */
    setPolar ( id, u, v ) {

        if ( ! id ) {

            id = this.lightTypes.LIGHT_0;

        }

        // TODO:

    }

}

export default Lights;