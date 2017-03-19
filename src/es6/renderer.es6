class Renderer {

    constructor ( init, util, glMatrix, webgl, shaderTexture, shaderColor, shaderDirlightTexture ) {

        console.log( 'In Renderer class' );
 
        this.webgl = webgl;

        this.util = webgl.util;

        this.glmatrix = glMatrix;

        this.shaderTexture = shaderTexture;

        this.shaderColor = shaderColor;

        this.shaderDirlightTexture = shaderDirlightTexture;

        this.shaderList = [];

        this.renderList = [];

        if( this.init ) {

        }

    }

    /** 
     * Get a shader, error, if it isn't present.
     * @param {String} shaderName the assigned name of the Shader.
     */
    getShader( shaderName ) {

        if ( this.shaderList[ shaderName ] ) {

            return this.shaderList[ shaderName ];

        } else {

            console.error( 'Renderer::getShader(): shader ' + shaderName + ' not found' );

        }

        return false;

    }

    /**
     * Setter for adding shaders, possibly BEFORE webgl context is defined.
     * NOTE: TYPICALLY INVOKED IN 'app.es6'.
     * @param {String} shaderName the assigned name of the Shader.
     * @param {Shader} shader the shader object.
     */
    addShader( shader, objList ) {

        if ( this.shaderList.indexOf( shader.name ) === -1 ) {

            this.shaderList[ shader.name ] = shader;

            shader.addObjList( objList );

            // TODO: have to initialize the shader earlier.

            // this.renderList.push( shader.program );

            return true;

        } else {

            console.error( 'Renderer::addShader(): already added shader:' + shader.name + ' to Renderer' );

        }

        return false;

    }


    /** 
     * Render everything.
     */
    render () {

        for ( let i = 0; i < this.renderList.length; i++ ) {

            console.log('RENDERLIST I:' + this.renderList[i])

            this.renderList[ i ].render();

        }

    }

}

export default Renderer;