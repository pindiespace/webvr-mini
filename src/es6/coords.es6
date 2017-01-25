/** 
 * Create a class for manipulating 3d data, including texture 
 * coordinates and normals. We don't use glMatrix since the 
 * calculations here are faster if done locally.
 */
 class Coords {

    constructor ( x = 0, y = 0, z = 0 ) {

        this.x = x;

        this.y = y;

        this.z = z;

    }

    /** 
     * Overwrite coordinate values
     */
    set ( x, y, z ) {

        if ( x !== undefined ) this.x = x;

        if ( y !== undefined ) this.y = y;

        if ( z !== undefined ) this.z = z;

    }

    clone () {

        return new Coords( this.x, this.y, this.z );

    }

    add ( other ) {

        this.x += other.x;

        this.y += other.y;

        this.z += other.z;

        return this;

    }

    subtract ( other ) {

        this.x -= other.x;

        this.y -= other.y;

        this.z -= other.z;

        return this;

    }

    multiplyScalar ( scalar ) {

        this.x *= scalar;

        this.y *= scalar;

        this.z *= scalar;

        return this;

    }

    divideScalar ( scalar ) {

        this.x /= scalar;

        this.y /= scalar;

        this.z /= scalar;

        return this;

    }

    crossProduct ( other ) {

        return new Coords (
            this.y * other.z - other.y * this.z,
            other.x * this.z - this.x * other.z,
            this.x * other.y - other.x * this.y
        );

    }

    dotProduct ( other ) {

        return ( this.x * other.x + this.y * other.y + this.z * other.z );

    }

    magnitude () {

        return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

    }

    normalize () {

        return this.divideScalar( this.magnitude() );

    }


}

export default Coords;