class Renderer {

    constructor ( init, util, glMatrix, webgl, shaderTexture, shaderColor, shaderDirlightTexture ) {

        console.log( 'In Renderer class' );

        this.webgl = webgl;

        this.util = webgl.util;

        this.glmatrix = glMatrix;

        this.shaderTexture = shaderTexture;

        this.shaderColor = shaderColor;

        this.shaderDirlightTexture = shaderDirlightTexture;

        if( this.init ) {

        }

    }

    // Specialized render manipulations go below.

    // TODO: write function for adding shaders.

}

export default Renderer;