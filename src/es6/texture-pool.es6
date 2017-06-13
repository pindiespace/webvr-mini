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

        this.greyPixel = new Uint8Array( [ 128, 128, 128, 255 ] );

        this.transparentPixel = new Uint8Array( [ 0, 0, 0, 0 ] );

        if ( init ) {

            // Create and store a default texture (one greyPixel, one transparent pixel).

            let gl = webgl.getContext();

            this.defaultKey = this.addAsset( this.default( null, null, gl.TEXTURE_2D, null, this.create2dTexture(), null ) ).key;

            this.transparentKey = this.addAsset( this.default( null, null, gl.TEXTURE_2D, null, this.create2dTexture(), null ) ).key;

        }

    }

    /** 
     * Create the default TexturePool object.
     * @param {Image} image the image providing texture data (if present).
     * @param {MimeType} the MIME type of the Image.
     * @param {GLTextureType} gl.TEXTURE_2D, gl.TEXTURE_3D...
     * @param {String} path the path to the Image file, if present.
     * @param {WebGLTexture} the WebGL texture buffer.
     * @param {Emitter.events} the Emitter event for this texture.
     * @returns {Object} the Texture object for our TexturePool.
     */
    default ( image = null, mimeType = null, type = null, path = null, texture = null, emitEvent = null ) {

        return {

            image: image,       // JavaScript Image object.

            mimeType: mimeType, // image/png, image/jpg...

            type: type,         // gl.TEXTURE_2D, gl.TEXTURE_3D...

            path: path,         // URL of object, should uniquely identify the texture.

            texture: texture,   // WebGLTexture

            emits: emitEvent    // emitted event

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
    create2dTexture ( image, compressed ) {

        let gl = this.webgl.getContext(),

        texture = gl.createTexture();

        // Flip the image's Y axis to match the WebGL texture coordinate space.

        // TODO: FF says this is deprecated! This flips our texture

        // TODO: change our texture coords calculations!

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        // gl.pixelStorei( gl.UNPACK_ALIGNMENT, true );

        // Bind the texture data to the videocard, receive a WebGL texture in our textureObject.

        gl.bindTexture( gl.TEXTURE_2D, texture );

        if ( image instanceof HTMLImageElement ) { // Standard image

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image ); // HASN'T LOADED YET

        } else if ( image instanceof Uint8Array && image.length ) { 

           let sz = Math.sqrt( image.length / 4 );

           if ( sz % 1 === 0 ) { // texture defined by an array, 1x1, 2x2, etc.

                gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, sz, sz, 0, gl.RGBA, gl.UNSIGNED_BYTE, image );

           }

        } else { // Default to single-pixel texture

            console.warn( 'TexturePool::create2DTexture(): no image (' + image + '), using default pixel texture' );

            image = { width: 1, height: 1 }; // kludge image structure for isPowerOfTwo test below

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.greyPixel );

        }

        // Generate mipmaps if we are a power of 2 texture.

        if ( this.util.isPowerOfTwo( image.width ) && this.util.isPowerOfTwo( image.height ) ) {

            //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );

            gl.generateMipmap( gl.TEXTURE_2D );

        } else {

            gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

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
    create3dTexture ( data, compressed, size ) {

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
    createCubeMapTexture ( images, compressed ) {

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
     * @param {String} mimeType the MIME type of the image
     * @param {Number} glTextureType the WebGL texture type (e.g. TEXTURE_2D, TEXTURE_CUBE_MAP).
     * @param {Object} any additional params.
     */
    addTexture ( prim, image, path, mimeType, glTextureType ) {

        let gl = this.webgl.getContext();

        if ( ! glTextureType ) {

            glTextureType = gl.TEXTURE_2D;

        }

        let texture = null, 

        emitEvent = '';

        switch( glTextureType ) {

            case gl.TEXTURE_2D:

                texture = this.create2dTexture( image );

                emitEvent = this.util.emitter.events.TEXTURE_2D_READY;

                break;

            case gl.TEXTURE_3D:

                texture = this.create3dTexture( image );

                emitEvent = this.util.emitter.events.TEXTURE_3D_READY;

                break;

            case gl.TEXTURE_CUBE_MAP:

                texture = this.createCubeMapTexture( image ); // NOTE: image is actually an array here

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
             * NOTE: .addAsset() also puts the assigned key by TexturePool into our object.
             */

            return this.addAsset( 

                this.default( image, mimeType, glTextureType, path, texture, emitEvent )

            );

        } else {

            console.warn( 'TexturePool::addTexture(): no texture returned by createXXTexture() function' );

        }

        return null;

    }

    /** 
     * Load textures, using a list of paths.
     * NOTE: textures in a single pathList will be loaded in parallel, so redundant textures 
     * are not checked for.
     * @param {Array[String]} pathList a list of URL paths to load, or keys referencing our pool.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     * @param {Boolean} keepDOMImage if true, keep the Image object we created the texture from (internal Blob).
     * @param {WebGL.TEXTURE} textureType a WebGL-enumerated texture type (TEXTURE_2D, TEXTURE_3D...), default TEXTURE_2D.
     * @param {Object} options if present, additional options loading or rendering the texture.
     */
    getTexture ( prim, path, cacheBust = true, keepDOMImage = false, glTextureType, options = { pos: 0 } ) {

        // Wrap single strings in an Array.

        // If no textureType defined, default to 2D texture.

        if ( ! glTextureType ) {

            glTextureType = this.webgl.gl.TEXTURE_2D;

        }

        // Check if texture is already in asset pool, use it if it is. Define by PATH.

        let textureObj = this.pathInList( path );

        if ( textureObj !== null ) {

            // Use a pool texture if available. Generally won't be ready within a Prim, but useful for Prims sharing textures.

            console.log( 'TexturePool::getTexture(): found texture ' + path + ' in pool, using it...' );

            this.util.emitter.emit( this.util.emitter.events.TEXTURE_2D_READY, prim, this.defaultKey, options );  

            return;

        }

        ////////if ( options.fromObj ) console.warn( 'TexturePool::getTexture(): getting texture from OBJ file ' + path + ' for:' + prim.name)

        // Get texture from .OBJ file (could have an empty path).

        if ( ! this.util.isWhitespace( path ) ) {

                // Get the image mimeType.

                let mimeType = this.textureMimeTypes[ this.util.getFileExtension( path ) ];

                // check if mimeType is OK.

                if( mimeType ) {

                    /* 
                     * Use Fetch API to load the image, wrapped in a Promise timeout with 
                     * multiple retries possible (in parent class GetAssets). Return a 
                     * response.blob() for images, and add to DOM or WebGL texture here. 
                     * We apply the Blob data to a JS image to decode. Since this may not 
                     * be instant, we catch the .onload event to actually send the WebGL texture.
                     */

                    this.doRequest( path, options.pos, 

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

                                // Add the texture.

                                //console.log('-----------adding texture ' + path + ' to ' + prim.name)

                                if (options.fromObj ) console.warn( 'TexturePool::getTexture(): adding OBJ texture:' + path + ' to ' + prim.name );

                                let textureObj = this.addTexture( prim, image, updateObj.path, mimeType, glTextureType );

                                if ( textureObj ) {

                                    if( ! keepDOMImage ) {

                                        //document.body.appendChild( image );

                                        // Remove the Blob URL

                                        window.URL.revokeObjectURL( image.src );

                                        // Kill the reference to our local Image and its (Blob) data.

                                        textureObj.image = null;

                                        // If you want to add to DOM, do so here.

                                    }

                                    /*
                                     * Emit a 'texture ready event' with the key in the pool and path (intercepted by PrimFactory).
                                     * NOTE: options for each texture's rendering are attached to textureObj.
                                     * NOTE: in PrimFactory, we recover textureObj by its key in TexturePool.
                                     */

                                    this.util.emitter.emit( textureObj.emits, prim, textureObj.key, options );

                                } else {

                                    console.error( 'TexturePool::getTexture(): file:' + path + ' could not be parsed' );

                                    this.util.emitter.emit( this.util.emitter.events.TEXTURE_2D_READY, prim, this.defaultKey, options );  

                                }

                            } // end of image.onload callback

                            // Create a URL to the Blob, and fire the onload event (internal browser URL instead of network).

                            if ( updateObj.data ) {

                                image.src = window.URL.createObjectURL( updateObj.data );

                            } else {

                                // Put a single-pixel texture in its place.

                                this.util.emitter.emit( this.util.emitter.events.TEXTURE_2D_READY, prim, this.defaultKey, options );

                                console.error( 'TexturePool::getTexture(): invalid image data for prim:' + prim.name + 'path:' + updateObj.path + ' data:' + updateObj.data );

                            }

                        }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

                } else {

                    console.error( 'TexturePool::getTexture(): file type "' + this.util.getFileExtension( path ) + '" in:' + path + ' not supported, not loading' );

                    // Put a single-pixel texture in its place.

                    this.util.emitter.emit( this.util.emitter.events.TEXTURE_2D_READY, prim, this.defaultKey, options );

                }

            } else {

                console.warn( 'TexturePool::getTexture(): empty path supplied for prim ' + prim.name );

            } // end of valid path

        //} // end of for loop for texture paths

    }

}

export default TexturePool;