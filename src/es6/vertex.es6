/** 
 * Create a Vertex class suitable for complex manipulatio of mesh objects, 
 * e.g. subdivision or morphing
 */
import Util   from './util';
import Coords from './coords';

class Vertex {

	constructor( x = 0, y = 0, z = 0, u = 0, v = 0, idx = '', vertexArr = [] ) {

		this.coords = new Coords( x, y, z );

        this.texCoords = { u: u, v: v };

        this.idx = idx;

        this.vertexArr = vertexArr;

	}

	isValid () {

		if ( this.coords.isValid() && 
			Number.isFinite( parseFloat( this.u ) ) && this.u >= 0 && 
			Number.isFinite( parseFloat( this.v ) ) && this.v >= 0 ) {

			return true;

		}

		return false;

	}

	clone () {

		return new Vertex( this.coords.x, this.coords.y, this.coords.z, 
			this.texCoords.u, this.texCoords.v, 
			this.idx, this.vertexArr );

	}


	flatten () {

	}

}

export default Vertex;