/** 
 * Create a class for manipulating 3d data, including texture 
 * coordinates and normals. We don't use glMatrix since the 
 * calculations here are faster if done locally.
 */
 class Coords {

    /**
     * @constructor
     * @param {Number} x the initializing x or 0 coordinate
     * @param {Number} y the initializing y or 1 coordinate
     * @param {Number} z the initializing z or 2 coordinate
     */
    constructor ( x = 0, y = 0, z = 0 ) {

        this.x = x;

        this.y = y;

        this.z = z;

    }

    /**
     * Check for null or undefined values.
     * @returns {Boolen} all all 3 coordinates are defined, return true, else false
     */
    isValid () {

        return ( Number.isFinite( parseFloat( this.x ) ) && 
            Number.isFinite( parseFloat( this.y ) ) && 
            Number.isFinite( parseFloat( this.z ) ) );

    }

    /** 
     * Overwrite coordinate values.
     * @param {Number} x the x or 0 coordinate
     * @param {Number} y the y or 1 coordinate
     * @param {Number} z the z or 2 coordinate
     */
    set ( x, y, z ) {

        if ( x !== undefined ) this.x = x;

        if ( y !== undefined ) this.y = y;

        if ( z !== undefined ) this.z = z;

    }

    /**
     * Return a new copy of this Coords
     * @returns {Coords} a copy of the current coordinates.
     */
    clone () {

        return new Coords( this.x, this.y, this.z );

    }

    /** 
     * Determine if two Coords are the same object (not same values)
     */
    isEqual ( other ) {

        if ( other === this ) {

            return true;
        }

        return false;
    }

    /** 
     * Add a Coordinate position to this coordinate (vector addition)
     * @param {Coord} other the coordinate position to add.
     * @returns {Coord} this Coord, added.
     */
    add ( other ) {

        this.x += other.x;

        this.y += other.y;

        this.z += other.z;

        return this;

    }

    /** 
     * Subtract a Coordinate position from this coordinate (vector addition)
     * @param {Coord} other the coordinate position to subtract.
     * @returns {Coord} this Coord, subtracted.
     */
    subtract ( other ) {

        this.x -= other.x;

        this.y -= other.y;

        this.z -= other.z;

        return this;

    }

    /** 
     * Multiply the value of this Coordinate by a number
     * @param {Number} scalar the number to multiply by.
     * @returns {Coords} this Coords, scaled.
     */
    multiplyScalar ( scalar ) {

        this.x *= scalar;

        this.y *= scalar;

        this.z *= scalar;

        return this;

    }

    /** 
     * Divice the value of this Coordinate by a number
     * @param {Number} scalar the number to divide by.
     * @returns {Coords} this Coords, scaled.
     */
    divideScalar ( scalar ) {

        this.x /= scalar;

        this.y /= scalar;

        this.z /= scalar;

        return this;

    }

    distance( other ) {

        let dx = this.x - other.x;

        let dy = this.y - other.y;

        var dz = this.z - other.z;

        return Math.sqrt( dx * dx + dy * dy + dz * dz );

    }

    /** 
     * Return the length of this Coord.
     * @returns {Number} the length of this Coord.
     */
    magnitude () {

        return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

    }

    /** 
     * Convert this Coords to its normalized form.
     * @returns {Coords} this Coords, normalized.
     */
    normalize () {

        return this.divideScalar( this.magnitude() );

    }

    /** 
     * Return a new Coords with averaged value of this and another Coords.
     * @param {Coords} other the Coords to average with.
     * @returns {Coords} a new Coords which is the average for this and the other Coords
     */
    average ( other ) {

        return this.clone().this.add( other ).this.divideScalar( 0.5 );

    }

    /** 
     * Return a new Coords which is the cross product of this and another Coords.
     * @param {Coords} other the other Coords to average with.
     * @returns {Coords} a new Coords which is the dot product for this and the other Coords.
     */
    crossProduct ( other ) {

        return new Coords (
            this.y * other.z - other.y * this.z,
            other.x * this.z - this.x * other.z,
            this.x * other.y - other.x * this.y
        );

    }

    /** 
     * Return the cross product of this Coord and another Coords.
     * @param {Coords} other the Coords to compute the dot product with.
     * @returns {Number} the dot product.
     */
    dotProduct ( other ) {

        return ( this.x * other.x + this.y * other.y + this.z * other.z );

    }

}

export default Coords;