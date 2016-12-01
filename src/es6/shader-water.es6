import Shader from './shader'

class ShaderWater extends Shader {

    constructor ( init, util, glMatrix, webgl, prim ) {

        super( init, util, glMatrix, webgl, prim );

        console.log( 'In ShaderWater class' );

    }

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 3
     * a directionally-lit textured object vertex shader.
     * @link http://learningwebgl.com/blog/?p=684
     * - vertex position
     * - texture coordinate
     * - model-view matrix
     * - projection matrix
     * Water example
     * @link http://madebyevan.com/webgl-water/
     * --------------------------------------------------------------------
     */


}

export default ShaderWater;