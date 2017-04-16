'use strict' 

class Renderer {

    constructor ( init, util, glMatrix, webgl ) {

        console.log( 'In Renderer class' );
 
        this.webgl = webgl;

        this.util = webgl.util;

        this.glmatrix = glMatrix;

        this.shaderList = [];

        this.NOT_IN_LIST = util.NOT_IN_LIST; // .indexOf comparisons

        if( this.init ) {

        }

    }

    /** 
     * Check if a Shader is initialized within our Shader list.
     * @param {String} key the shader key === shader.name
     * @returns {Shader|false} if found, return the shader, else return false.
     */
    shaderInList ( key ) {

        if( this.shaderList[ key ] ) {

            return this.shaderList[ key ];

        }

        console.warn( 'Renderer::shaderInList(): shader ' + key + ' not found in list' );

        return false;

    }

    /** 
     * Get a Shader.
     * NOTE: Shaders are stored in an associative array only.
     * @param {String} key the key in the shaderList === the assigned name of the Shader.
     */
    getShader( key ) {

        if ( this.shaderList[ key ] ) {

            return this.shaderList[ key ];

        } else {

            console.error( 'Renderer::getShader(): shader ' + key + ' not found' );

        }

        return false;

    }

    /**
     * Setter for adding Shaders, possibly BEFORE webgl context is defined.
     * NOTE: Shaders are stored in a numeric array only.
     * @param {Shader} the new Shader.
     * @returns {Boolean} if added, return true, else false.
     */
    addShader( shader ) {

        if ( ! this.shaderList[ shader.name ] ) {

            console.log( 'Renderer::addShader(): adding ' + shader.name + ' to rendering list' );

            this.shaderList[ shader.name ] = shader;

            return true;

        } else {

            console.error( 'Renderer::addShader(): already added shader:' + shader.name + ' to Renderer' );

        }

        return false;

    }

    /** 
     * Remove a Shader.
     * NOTE: Shaders are sored in a numerica array only.
     * @param {String} key the shader's key in the list
     * @returns {Boolean} if removed, return true, else false.
     */
    removeShader ( key ) {

        // TODO: remove shader (also remove Prims using said shader to not try to draw).

        if ( this.shaderList[ key ] ) {

            delete this.shaderList[ key ];

        }

        console.warn( 'Renderer::removeShader(): shader ' + key + ' not in list' );

        return false;

    }

    /** 
     * Initialize shaders AFTER webgl context is defined.
     * Note: we only define an associatve array for shaders.
     */
    initShaders () {

        for ( let i in this.shaderList ) {

            this.shaderList[ i ].init();

        }

    }

    /** 
     * Render everything in mono 3d, for non-VR use case.
     * NOTE: you may want to call shaders individually in World.render()
     */
    renderMono () {

        for ( let i in this.shaderList ) {

            this.shaderList[ i ].program.render();

        }

    }

    /** 
     * Render everything in VR, for displays or polyfills.
     * NOTE: you may want to call shaders individually in World.render()
     */
    renderVR ( vr, display, frameData ) {

        for ( let i in this.shaderList ) {

            this.shaderList[ i ].renderVR( vr, display, frameData );

        }

    }

}

export default Renderer;