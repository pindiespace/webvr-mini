import Shader from './shader'

class ShaderTerrain extends Shader {

    constructor ( init, util, glMatrix, webgl, prim ) {

        super( init, util, glMatrix, webgl, prim );

        console.log( 'In ShaderTerrain class' );

    }

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 3
     * a directionally-lit textured object vertex shader, which uses 
     * heightmap textures on the videocard to generat terrain. Also 
     * uses multiple textures to create close-range detail, and 
     * shader fog.
     * @link http://learningwebgl.com/blog/?p=684
     * - vertex position
     * - texture coordinate
     * - model-view matrix
     * - projection matrix
     * --------------------------------------------------------------------
     */


}

export default ShaderTerrain;