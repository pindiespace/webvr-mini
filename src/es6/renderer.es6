class Renderer {

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'In Renderer class' );
 
        this.webgl = webgl;

        this.util = webgl.util;

        this.glmatrix = glMatrix;

        this.shaderList = [];

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
    addShader( shader ) {

        if ( this.shaderList.indexOf( shader.name ) === -1 ) {

            console.log( 'adding Shader ' + shader.name + ' to rendering list' );

            this.shaderList[ shader.name ] = shader;

            return true;

        } else {

            console.error( 'Renderer::addShader(): already added shader:' + shader.name + ' to Renderer' );

        }

        return false;

    }

    /** 
     * Initialize shaders AFTER webgl context is defined.
     */
    initShaders () {

        for ( let i = 0; i < this.shaderList.length; i++ ) {

            this.shaderList[ i ].init();

        }

    }

    /** 
     * Render everything.
     */
    render () {

        for ( let i = 0; i < this.shaderList.length; i++ ) {

            console.log('SHADERLIST I:' + this.shaderList[i])

            this.shaderList[ i ].program.render();

        }

    }

}

export default Renderer;