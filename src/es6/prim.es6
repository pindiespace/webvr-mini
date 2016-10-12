export default class prim {

    /** 
     * Create object primitives, and return vertex and index data 
     * suitable for creating a VBO and IBO.
     */

    constructor ( init, util, glMatrix, webgl, loadModel, loadTexture, loadAudio, loadVideo) {

        console.log( 'in Prim class' );

        this.util = util;

        this.webgl = webgl;

        this.glMatrix = glMatrix;

        this.loadModel = loadModel;

        this.loadTexture = loadTexture;

        this.loadAudio = loadAudio;

        this.loadVideo = loadVideo;

        this.objs = [];

        this.type = {

            POINT: 'POINT',

            LINE: 'LINE',

            PLANE: 'PLANE',

            CUBE: 'CUBE',

            SPHERE: 'SPHERE',

            DOME: 'DOME',

            CONE: 'CONE',

            CYLINDER: 'CYLINDER',

            POLY: 'POLY'

        };

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

                            //s = s.slice(0, -1); // remove trailing ';'
                            s = s.replace(/;\s*$/, "");

                            console.log("SSS:" + s)

                            s = s.split( sp );

                            console.log("FIRST: " + s)

                            let vType = s.shift(); // attribute, uniform, or varying

                            if ( ! list[ vType ] ) {

                                list[ vType ] = {};

                            }

                            console.log("SECOND AFTER SHIFT:" + vType + " remainder:" + s)

                            let nType = s.shift(); // variable type

                            if ( ! list[ vType ][ nType ] ) {

                                list[ vType ][ nType ] = {};
                            }

                            let nName = s.shift(); // variable name

                            if ( ! list[ vType ][ nType ][ nName ] ) {

                                list[ vType ][ nType ][ nName ] = 'empty';
                            }

                            console.log("THIRD AFTER SHIFT:" + nType + " remainder:" + s)

                        }

                    }

                }

            } 

        }

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

            varList: this.createVarList( s ),

            render: function () {}

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

            varList: this.createVarList( s ),

            render: function () {}

        };

    }


    /** 
     * GEOMETRIES
     */

    geometryPoint () {

    }

    geometryLine () {

    }

    geometryPlane () {

    }

    /** 
     * Create a cube geometry of a given size (units) centered 
     * on a point.
     * @param {GLMatrix.Vec3} center a 3d vector defining the center.
     * @param {Number} scale relative to unit size (1, 1, 1).
     */
    geometryCube ( center, size ) {

        let  halfSize = size * 0.5;

        let r = size * 0.5;

        let x = center[0];

        let y = center[1];

        let z = center[2];

        let vertices = [];

        let indices = [];

        // Create cube geometry.


        // Return standard geo object.

        return {

            vertices: {

                data: vertices,

                itemSize: 3,

                numItems: vertices.length / 4
            },

            indices: {

                data: indices,

                itemSize: 1,

                numItems: indices.length

            }

        }

    }

    geometrySphere () {

    }

    geometryDome () {

    }

    geometryCone () {

    }

    geometryCylinder () {

    }

    geometryPoly () {

    }

    /** 
     * Create an standard 3d object.
     * @param {String} name assigned name of object (not necessarily unique).
     * @param {Number} scale size relative to unit vector (1,1,1).
     * @param {GLMatrix.vec3} position location of center of object.
     * @param {GLMatrix.vec3} translation movement vector (acceleration) of object.
     * @param {GLMatrix.vec3} rotation rotation vector (spin) around center of object.
     * @param {String} textureImage the path to an image used to create a texture.
     * @param {GLMatrix.vec4} color the default color of the object.
     */
    createPrim ( name = 'unknown', scale = 1.0, position, translation, rotation, textureImage, color ) {

        let gl = this.webgl.getContext();

        let prim = {};

        prim.id = this.setId();

        prim.name = name;

        prim.position = position || this.glMatrix.vec3.create( 0, 0, 0 );

        prim.translation = translation || this.glMatrix.vec3.create( 0, 0, 0 );

        prim.rotation = rotation || this.glMatrix.vec3.create( 0, 0, 0 );

        prim.texture = null;

        prim.color = null;

        return prim;

    }

    /** 
     * create a Cube object.
     * @param {String} name of object
     * @param {Number} scale
     */
    createCube ( name, scale, position, translation, rotation, textureImage, color ) {

        let cube = this.createPrim( name, scale, position, translation, rotation, textureImage, color );

        cube.geometry = this.geometryCube( cube );

        cube.type = this.type.CUBE;

        this.objs.push( cube );

        return cube;

    }

}