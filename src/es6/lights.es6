
'use strict'

class Lights {
    
    constructor ( glMatrix ) {

        this.glMatrix = glMatrix;

        this.lightTypes = {

            LIGHT_0: 'light0',  // World Directional (default)

            LIGHT_1: 'light1',

            LIGHT_2: 'light2',

            LIGHT_3: 'light3'

        };

        this.lightList = [];

        // Set a default Light.

        this.setLight( this.lightTypes.LIGHT_0 );

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
     * Set a Light.
     * @param {String} lightType the type of light to use (pre-defined in constructor).
     * @param {glMatrix.vec3} ambient the ambient (nondirectional) lighting from the light. 
     * usually zero if this isn't a World light.
     * @param {GlMatrix.vec3} lightingDireciton the direction of the light, also its apparent position.
     * @param {GlMatrix.vec3} directionalColor the color of the light.
     * @param {Boolean} active if true, the light is on, else false.
     */
    setLight ( lightType, ambient = [ 0.3, 0.3, 0.3 ], lightingDirection = [ -1000.0, 0.0, 1000.1 ], 

        directionalColor = [ 1, 1, 1 ], active = false ) {

        this.lightList[ lightType ] = {

            ambient: ambient,

            lightingDirection: lightingDirection,

            directionalColor: directionalColor,

            attenuation: 0.0,

            radius: 1.0

        };

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