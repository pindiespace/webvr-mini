export default class Loader {

    /** 
     * Texture and model loader.
     */

    constructor ( config ) {

        console.log( 'in WebGLLoader class' );

    }

    

    /** 
     * Create a texture from a JS Image object.
     * @link https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
     * @param {Image} image an image object.
     */
    createTexture ( img ) {

        let gl = this.gl;

        let tex = gl.createTexture();
  
        gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );

        gl.generateMipmap( gl.TEXTURE_2D);

        gl.bindTexture( gl.TEXTURE_2D, null );

        return texture;

    }

    fetchTexture ( imgURL ) {

    }

    createModel () {


    }

    loadColada () {


    }

}