export default class Renderer {

    constructor ( init, util, glMatrix, webgl, shaderTexture, shaderColor ) {

        console.log( 'In Renderer class' );

        this.webgl = webgl;

        this.util = webgl.util;

        this.glmatrix = glMatrix;

        this.shaderTexture = shaderTexture;

        window.shaderTexture = shaderTexture;

        this.shaderColor = shaderColor;

        if( this.init ) {

        }

    }

    // Specialized render manipulations go below.


}