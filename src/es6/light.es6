
'use strict'

class Light {
	
	constructor ( ambient = [ 0.1, 0.1, 0.1 ], lightingDirection = [ -0.25, -0.5, -0.1 ], 

		adjustedLD = [ 0, 0, 0 ], directionalColor = [ 0.7, 0.7, 0.7 ] ) {

		this.ambient = ambient,          

        this.lightingDirection = lightingDirection,

        this.adjustedLD = adjustedLD,

        this.directionalColor = directionalColor

	}

}

export default Light;