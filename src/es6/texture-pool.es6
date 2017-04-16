import GetAssets from './get-assets';

'use strict'

class TexturePool extends GetAssets {

    /** 
     * Manage texture assets, similar to GeoObj for 
     * coordinate data
     */
    constructor ( util, webgl ) {

        // Initialize superclass.

        super( util );

        this.util = util,

        this.webgl = webgl,

        this.NOT_IN_LIST = this.util.NOT_IN_LIST,

        this.textureList = [],

        this.keyList = [],

        this.greyPixel = new Uint8Array( [ 0.5, 0.5, 0.5, 1.0 ] );

    }


  /**
   * Sets a texture to a 1x1 pixel color. 
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext.
   * @param {WebGLTexture} texture the WebGLTexture to set parameters for.
   * @param {WebGLParameter} target.
   * @memberOf module: webvr-mini/LoadTexture
   */
    setDefaultTexturePixel ( texture, target ) {

        let gl = this.webgl.getContext();

        // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.

        let color = this.greyPixel;

        if ( target === gl.TEXTURE_CUBE_MAP ) {

            for ( let i = 0; i < 6; ++i ) {

                gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

            }

        } else if ( target === gl.TEXTURE_3D ) {

            gl.texImage3D( target, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

        } else {

            gl.texImage2D( target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

        }

    }

    /** 
     * Create a WebGL texture from an image, and 
     * add it to our texture list.
     */
    addTexture ( image, key, type = this.TEXTURE_2D ) {

        if ( key === undefined ) {

            console.error( 'TextureObj::addTexture(): undefined key' );

            return false;

        }

        let gl = this.webgl.getContext();

        let texture = null;

        switch( type ) {

            case gl.TEXTURE_2D:

                texture = this.create2dTexture( image, key );

            case gl.TEXTURE_3D:

                texture = this.create3dTexture( image, key );

            case gl.TEXTURE_CUBE_MAP:

            case gl.TEXTURE_CUBE_MAP_POSITIVE_X:

                break;

            default:

                break;

        }

        if ( texture ) {

            let obj = {};

            // we save references to the object in both numeric and associative arrays.

            obj.texture = texture,

            obj.key = key;

            if( ! this.util.isNumeric( key ) ) {

                this.keyList[ key ] = obj;

            } 

            this.textureList.push( obj );

            obj.pos = this.textureList.length - 1;

            return true;

        }

        return false;

    }

    /** 
     * Find a texture by its key (numeric or string)
     */
    textureInList( key ) {

        if ( ! key ) {

            console.error( 'TextureObj::textureInlist(): undefined key' );

            return false;

        }

        if ( this.util.isNumeric( key ) ) {

            return this.textureList[ key ];

        } else if ( this.keyList[ key ] ) {

            return this.keyList[ key ];

        }

        return this.NOT_IN_LIST;

    }


    /** 
     * Remove a texture from both numeric and associative arrays.
     * @param {String|Number} key
     * @returns {Boolean} if found and deleted, return true, else false.
     */
    removeTexture( key ) {

        let obj = null;

        if ( this.util.isNumeric( key ) ) {

            obj = this.textureList.splice( key, 1 );

            if ( obj.length !== 0 ) {

                delete this.keyList[ obj.key ];

            }

        } else if ( this.keyList[ key ] ) {

            obj = this.keyList[ key ];

            if ( obj ) {

                this.textureList.splice( obj.pos, 1 );

                delete this.keyList[ key ];

            }

        } else {

            console.warn( 'TextureObj::removeTexture(): key not found in textureList' );

        }

    }

    /** 
     * Create a new WebGL texture object.
     */
    create2dTexture ( image ) {

        let gl = this.webgl.getContext();

        src = image.src,

        texture = gl.createTexture();

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        // Bind the texture data to the videocard, receive a WebGL texture in our textureObject.

        gl.bindTexture( gl.TEXTURE_2D, texture );

        // Use image, or default to single-color texture if image is not present.

        if ( image ) {

            //////////console.log( 'binding image:' + image.src );

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );

            // TODO: WHEN TO USE gl.renderBufferStorage()???

        } else {

            console.warn( 'TextureObj::create2DTexture(): no image (' + image.src + '), using default pixel texture' );

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.greyPixel );

        }

        // Generate mipmaps if we are a power of 2 texture.

        if ( this.util.isPowerOfTwo( image.width ) && this.util.isPowerOfTwo( image.height ) ) {

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );

            gl.generateMipmap( gl.TEXTURE_2D );

        } else {

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );

        }

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );

        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

        gl.bindTexture( gl.TEXTURE_2D, null );

        return texture;

    }

    /** 
     * Upload a 3d texture.
     * @memberOf module: webvr-mini/LoadTexture
     */
    create3dTexture () {

        return null;

    }

    /** 
     * Upload a cubemap texture.
     * @memberOf module: webvr-mini/LoadTexture
     */
    createCubeMapTexture () {

        return null;

    }

    // To add textures, use super.addRequests() or super.doRequest()

}

export default TexturePool;