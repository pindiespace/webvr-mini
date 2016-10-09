export default class prim {

    /** 
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
     */

    constructor ( config ) {

        this.util = config.util;

        this.webgl = config.webgl;

        this.glMatrix = this.webgl.glMatrix;

        this.objs = [];

        this.type = [];

        this.type[ 'PLANE' ] = 'PLANE',

        this.type[ 'CUBE' ] = 'CUBE',

        this.type[ 'SPHERE' ] = 'SPHERE',

        this.type[ 'CONE' ] = 'CONE',

        this.type[ 'CYLINDER' ] = 'CYLINDER';

    }

    /** 
     * Unique object id
     * @link https://jsfiddle.net/briguy37/2MVFd/
     */
    setId () {

        let d = new Date().getTime();

        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {

            var r = (d + Math.random()*16)%16 | 0;

            d = Math.floor(d/16);

            return ( c=='x' ? r : ( r&0x3|0x8 ) ).toString( 16 );

        } );

        return uuid;

    }

    /** 
     * Get the big array with all vertex data
     */
    setVertexData ( vertices ) {

        vertices = [];

        let len = this.objs.length;

        for ( let i in this.objs ) {

            vertices = vertices.concat( this.objs[i].vertices );

        }

        return vertices;

    }

    /** 
     * get the big array with all index data
     */
    setIndexData ( indices ) {

        indices = [];

        let len = this.objs.length;

        for ( let i in this.objs ) {

            indices = indices.concat( this.objs[i].indices );

        }

        return indices;

    }

    /** 
     * SHADER CLASSES
     * Textured object w/o lighting
     * Texture object with lighting
     * Translucent
     * Water
     */

     /** 
      * Read shader code, and organize the variables in the shader 
      * into an object. Abstracts some of the tedious work in setting 
      * up shader variables.
      * @param {Array} sourceArr array of lines in the shader.
      * @returns {Object} an object organizing attribute, uniform, and 
      * varying variable names and datatypes.
      */
    createVarList ( source ) {

        let len = source.length;

        let sp = ' ';

        let sr = ';';

        let list = {};

        let varTypes = ['attribute', 'uniform', 'varying' ];

        if( len ) {

            for ( let i = 0; i < source.length; i++ ) {

                let s = source[ i ];

                if ( s.indexOf( 'void main' ) !== -1 ) {
 
                    break;

                } else {

                    for ( let j = 0; j < varTypes.length; j++ ) {

                        let type = varTypes[j];

                        if( ! list[ type ] ) list[ type ] = {};

                        if ( s.indexOf( type ) > -1 ) {

                            console.log("SSS1:" + s)

                            s = s.slice(0, -1); // remove trailing ';'

                            console.log("SSS:" + s)

                            s = s.split( sp );

                            console.log("FIRST: " + s)

                            let vType = s.shift();

                            console.log("SECOND AFTER SHIFT:" + vType + " remainder:" + s)

                            let nType = s.shift();

                            console.log("THIRD AFTER SHIFT:" + nType + " remainder:" + s)

                            if( ! list[ type ].vtype ) {

                                console.log("MADE EMPTY ARRAY type:" + type + " VTYPE:" + nType);
                                list[ type ][ nType ] = [];

                            }

                            list[ type ][nType] = s.shift();

                        }

                    }

                }

            } 

        }

        console.log("RETURNING LIST")

        return list;

    }

    /** 
     * a default-lighting textured object vertex shader.
     */
    objVS1 () {

        let s = [

            'attribute vec3 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',
            'varying vec2 vTextureCoord;',

            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vTextureCoord = aTextureCoord;',

            '}'

            ];

        return {

            code: s.join( '\n' ),

            varList: this.createVarList( s )

        };


    }

    /** 
     * a default-lighting textured object fragment shader.
     */
    objFS1 () {

        let s =  [

            'precision mediump float;',

            'varying vec2 vTextureCoord;',

            'uniform sampler2D uSampler;',

            'void main(void) {',

            '    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));',

            '}'

            ];


        return {
        
            code: s.join('\n'),

            varList: this.createVarList( s )

        };

    }


    /** 
     * GEOMETRIES
     */

    /** 
     * Create a cube geometry of a given size (units) centered 
     * on a point.
     */
    GeometryCube ( center, size ) {

        let  halfSize = size * 0.5;

        let r = size * 0.5;

        let x = center[0];

        let y = center[1];

        let z = center[2];

        let vertices = [];

        let indices = [];


        // Set item size and numItems.

        cubeVerts.itemSize = 3;
        cubeVerts.numItems = cubeVerts.length / 4;

        cubeIndices.itemSize = 1;
        cubeIndices.numItems = cubeIndices.length;

        return {

            size: size,

            position: center,

            vertices: cubeVerts,

            indices: cubeIndices

        }

    }

    /** 
     * create a Cube object.
     */
    createCube ( name = 'unknown', size = 1.0, position, translation, rotation ) {

        this.gl = this.webgl.getContext();

        let cube = this.GeometryCube( position, size );

        cube.id = this.setId();

        cube.name = name;

        cube.translation = translation || this.glMatrix.vec3( 0, 0, 0 );

        cube.rotation = rotation || this.glMatrix.vec3( 0, 0, 0 );

        cube.offset = 20;

        cube.type = this.type[ 'CUBE' ];

        this.texture = null;

        this.color = null;

        this.objs.push( cube );

        return cube;

    }

}