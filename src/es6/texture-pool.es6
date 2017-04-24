import AssetPool from './asset-pool';

'use strict'

class TexturePool extends AssetPool {

    /** 
     * @class
     * Manage texture assets, similar to ModelPool
     * @constructor
     * @param {Boolean} init if true, initialize immediately.
     * @param {Util} util utility methods.
     * @param {WebGL} webgl the WebGL object.
     */
    constructor ( init, util, webgl ) {

        console.log( 'in TexturePool' );

        // Initialize superclass.

        super( util );

        this.util = util,

        this.webgl = webgl,

        this.textureMimeTypes = {

            'png': 'image/png',

            'jpg': 'image/jpeg',

            'jpeg': 'image/jpeg',

            'gif': 'image/gif'

        },

        /* 
         * TODO: COMPRESSED TEXTURES
         * DXT: supported by all desktop devices and some Android devices
         * PVR: supported by all iOS devices and some Android devices
         * ETC1: supported by most Android devices
         * @link https://github.com/toji/texture-tester/blob/master/js/webgl-texture-util.js
         * @link https://github.com/toji/webgl-texture-utils
         */

        // Default texture pixel.

        this.greyPixel = new Uint8Array( [ 0.5, 0.5, 0.5, 1.0 ] );

        if ( init ) {

            // do something

        }

    }

  /**
   * Sets a texture to a 1x1 pixel color. 
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext.
   * @param {WebGLTexture} texture the WebGLTexture to set parameters for.
   * @param {WebGLParameter} type the WebGL texture type/target.
   */
    setDefaultTexturePixel ( texture, type ) {

        let gl = this.webgl.getContext();

        // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.

        let color = this.greyPixel;

        // Handle all local textures.

        if ( type === gl.GL_TEXTURE_CUBE_MAP ) {

            for ( let i = 0; i < 6; ++i ) {

                gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

            }

        } else if ( type === gl.TEXTURE_3D ) {

            gl.texImage3D( type, 0, gl.RGBA, 1, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

        } else {

            // gl.TEXTURE_2D.

            gl.texImage2D( type, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color );

        }

    }

    /* 
     * ---------------------------------------
     * TEXTURE CREATION BY TYPE
     * ---------------------------------------
     */

    /** 
     * Create a new WebGL texture object.
     * @param {Image} image a JS Image object.
     * @param {String} key a numeric or text key referencing this texture in the load pool.
     * @param {Number} compressed the parameter identifying a compressed texture, e.g. gl.COMPRESSED_RGBA8_ETC2_EAC.
     */
    create2dTexture ( image, key, compressed ) {

        let gl = this.webgl.getContext(),

        texture = gl.createTexture();

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        // Bind the texture data to the videocard, receive a WebGL texture in our textureObject.

        gl.bindTexture( gl.TEXTURE_2D, texture );

        // Use JS Image object, or default to single-color texture if image is not present.

        if ( image ) {

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image ); // HASN'T LOADED YET

            // TODO: pass ArrayBufferView for Image and this would work?
            // TODO: gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 100, 100, 0, gl.RGBA, gl.UNSIGNED_BYTE, image, 0 );

            // TODO: WHEN TO USE gl.renderBufferStorage()???

        } else {

            console.warn( 'TexturePool::create2DTexture(): no image (' + image.src + '), using default pixel texture' );

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
     * @param {Blob} data image data in Blob format.
     * @param {String} key the associative key for this texture in the pool.
     * @param {Number} compressed the parameter identifying a compressed texture, e.g. gl.COMPRESSED_RGBA8_ETC2_EAC.
     * @param {Number} size the size of the image, in bytes.
     */
    create3dTexture ( data, key, compressed, size ) {

        console.log( 'creating 3D texture' );

        let gl = this.webgl.getContext(),

        texture = gl.createTexture();

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        // Bind the texture data to the videocard, receive a WebGL texture in our textureObject.

        gl.bindTexture( gl.TEXTURE_3D, texture );

        // Use JS Image object, or default to single-color texture if image is not present.

        if ( image ) {

            gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);

            gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, Math.log2( size ) );

            gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );

            gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            gl.texImage3D( 

                gl.TEXTURE_3D,    // target

                0,                // level

                gl.R8,            // internalformat

                data.width,       // width

                data.height,      // height

                data.depth,       // depth

                0,                // border

                gl.RED,           // format

                gl.UNSIGNED_BYTE, // data type

                data              // data pixels

            );


        } else {

            console.error( 'TexturePool::create2DTexture(): no data (' + data + '), for 3d, giving up' );

        }

        // Generate mipmaps.

        gl.generateMipmap( gl.TEXTURE_3D );

        gl.bindTexture( gl.TEXTURE_3D, null );

        return texture;

    }

    /** 
     * Upload a cubemap texture. Note that this can't be called unless a cubemap set 
     * is available. Typically called by a Prim using a cubemap after all the cubemap textures 
     * have been loaded.
     * @param {Blob} data image data in Blob format.
     * @param {Number} size the size of the image, in bytes.
     * @param {String} key the associative key for this texture in the pool.
     * @param {Number} compressed the parameter identifying a compressed texture, e.g. gl.COMPRESSED_RGBA8_ETC2_EAC.
     */
    createCubeMapTexture ( images, key, compressed ) {

        console.log( 'creating cubemap texture' );

        let gl = this.webgl.getContext(),

        texture = gl.createTexture();

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        // Bind the texture data to the videocard, receive a WebGL texture in our textureObject.

        gl.bindTexture( gl.TEXTURE_CUBE_MAP, texture );

        // Use JS Image object, or default to single-color texture if image is not present.

        if ( images ) {

            gl.bindTexture( gl.TEXTURE_CUBE_MAP, texture);

            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE ),

            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ),

            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST ),

            gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST ),

            gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, format, type, images.pos.x ),

            gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, format, type, images.pos.y ),

            gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, format, type, images.pos.z ),

            gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, format, type, images.neg.x ),

            gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, format, type, images.neg.y ),

            gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, format, type, images.neg.z );


        } else {

            console.error( 'TextureObj::create2DTexture(): no data (' + images + '), for cubemap, giving up' );

        }

        gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );

        return texture;

    }

    // To add textures, use super.addRequests() or super.doRequest()

    /** 
     * Create a WebGL texture from a JavaScript Image object, and add it to our texture list.
     * @param {Image} image a JS Image object with defined .src
     * @param {String} path the file URL for the texture.
     * @param {String|Number} pos the pos (index) for assigning the texture in the calling Prim .textures array
     * @param {String} mimeType the MIME type of the image
     * @param {Number} type the WebGL texture type (e.g. TEXTURE_2D, TEXTURE_CUBE_MAP).
     */
    addTexture ( prim, image, path, pos, mimeType, type ) {

        if ( pos === undefined ) {

            console.error( 'TextureObj::addTexture(): undefined pos' );

            return null;

        }

        let gl = this.webgl.getContext();

        if ( ! type ) {

            type = gl.TEXTURE_2D;

        }

        let texture = null, 

        emitEvent = '';

        switch( type ) {

            case gl.TEXTURE_2D:

                texture = this.create2dTexture( image, pos );

                emitEvent = this.util.emitter.events.TEXTURE_2D_READY;

                break;

            case gl.TEXTURE_2D_ARRAY:

                texture = this.create2DArrayTexture( image, pos ); // NOTE: image is actually an array here

                emitEvent = this.util.emitter.events.TEXTURE_2D_ARRAY_MEMBER_READY;

                break;

            case gl.TEXTURE_3D:

                texture = this.create3dTexture( image, pos );

                emitEvent = this.util.emitter.events.TEXTURE_3D_READY;

                break;

            case gl.TEXTURE_CUBE_MAP:

                texture = this.createCubeMapTexture( image, pos ); // NOTE: image is actually an array here

                emitEvent = this.util.emitter.events.TEXTURE_CUBE_MAP_MEMBER_READY;

                break;

            default:

                console.warn( 'TexturePool::addTexture() for prim:' + prim.name + ' unsupported texture requested' );

                break;

        }

        // If we got a texture, construct the output object for JS.

        if ( texture ) {

            /* 
             * We save references to the texture object in TexturePool.
             * NOTE: .addAsset() puts the assigned key by TexturePool into our object.
             */

            return this.addAsset( {

                image: image,       // JavaScript Image object.

                mimeType: mimeType, // image/png, image/jpg...

                type: type,         // gl.TEXTURE_2D, gl.TEXTURE_3D...

                path: path,         // URL of object

                texture: texture,   // WebGLTexture

                emits: emitEvent    // emitted event

            } );

        } else {

            console.warn( 'TexturePool::addTexture(): no texture returned by createXXTexture() function' );

        }

        return null;

    }

    /** 
     * Load textures, using a list of paths.
     * NOTE: textures in a single pathList will be loaded in parallel, so redundant textures 
     * are not checked for.
     * @param {Array[String]} pathList a list of URL paths to load.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     * @param {Boolean} keepDOMImage if true, keep the Image object we created the texture from (internal Blob). 
     */
    getTextures ( prim, pathList, cacheBust = true, keepDOMImage = false, use = this.util.DEFAULT_KEY ) {

        // TODO: check texture list. If paths are already there, just use the path
        // TODO: and return the webgl texture buffer object.

        for ( let i = 0; i < pathList.length; i++ ) {

            let path = pathList[ i ];

            if ( path === null ) console.log( 'NULL AT: ' + i)

            // Could have an empty path.

            if ( path ) {

                let poolTexture = this.pathInList( path );

                // If it's already in TexturePool, just use.

                if ( poolTexture ) {

                    console.log( ')))))))))))))) found pre-existing texture ' + poolTexture.id + ' at path:' + path );

                    prim.textures.push( poolTexture ); // just reference an existing texture in this pool.

                } else {

                    // Get the image mimeType.

                    let mimeType = this.textureMimeTypes[ this.util.getFileExtension( path ) ];

                    // check if mimeType is OK.

                    if( mimeType ) {

                        /* 
                         * Use Fetch API to load the image, wrapped in a Promise timeout with 
                         * multiple retries possible (in parent class GetAssets). Return a 
                         * response.blob() for images, and add to DOM or WebGL texture here. 
                         * We apply the Blob data to a JS image to decode. Since this may not 
                         * be insteant, we catch the .onload event to actually send the WebGL texture.
                         */

                        this.doRequest( path, i, 

                            ( updateObj ) => {

                                /* 
                                 * updateObj returned from GetAssets has the following structure:
                                 * { 
                                 *   pos: pos, 
                                 *   path: requestURL, 
                                 *   data: null|response, (Blob, Text, JSON, FormData, ArrayBuffer)
                                 *   error: false|response 
                                 * } 
                                 */

                                let image = new Image();

                                // Blob data type requires Image .onload for processing.

                                image.onload = () => {

                                    // Create a WebGLTexture from the Image (left off 'type' for gl.TEXTURE type).

                                    let textureObj = this.addTexture( prim, image, updateObj.path, updateObj.pos, mimeType );

                                    if ( textureObj ) {

                                        if( ! keepDOMImage ) {

                                            //document.body.appendChild( image );

                                            // Remove the Blob URL

                                            window.URL.revokeObjectURL( image.src );

                                            // Kill the reference to our local Image and its (Blob) data.

                                            textureObj.image = null;

                                        // If you want to add to DOM, do so here.

                                        }

                                        // Save the usage, either 'default' or a key from an OBJ wavefront file (map_Kd, map_Ks...).

                                        textureObj.use = use;

                                        // Emit a 'texture ready event' with the key in the pool and path (intercepted by Prim).

                                        this.util.emitter.emit( textureObj.emits, prim, textureObj.key, updateObj.pos );

                                    } else {

                                        console.error( 'TexturePool::getTextures(): file:' + path + ' could not be parsed' );

                                    }

                                } // end of image.onload

                                // Create a URL to the Blob, and fire the onload event (internal browser URL instead of network).

                                image.src = window.URL.createObjectURL( updateObj.data );


                        }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

                    } else {

                        console.error( 'TexturePool::getTextures(): file type "' + this.util.getFileExtension( path ) + '" not supported, not loading' );

                    }

                }

            } else {

                console.warn( 'TexturePool::getTextures(): no path supplied for position ' + i );

            } // end of valid path

        } // end of for loop for texture paths

    }

}

export default TexturePool;