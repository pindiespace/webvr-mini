import GetAssets from './get-assets';

'use strict'

class TexturePool extends GetAssets {

    /** 
     * Manage texture assets, similar to GeoObj for 
     * coordinate data
     */
    constructor ( init, util, webgl ) {

        console.log( 'in TexturePool' );

        // Initialize superclass.

        super( util );

        this.util = util,

        this.webgl = webgl,

        this.NOT_IN_LIST = this.util.NOT_IN_LIST,

        this.textureMimeTypes = {

            'png': 'image/png',

            'jpg': 'image/jpeg',

            'jpeg': 'image/jpeg',

            'gif': 'image/gif'

        },

        /* 
         * TODO: 
         * DXT: supported by all desktop devices and some Android devices
         * PVR: supported by all iOS devices and some Android devices
         * ETC1: supported by most Android devices
         * @link https://github.com/toji/texture-tester/blob/master/js/webgl-texture-util.js
         * @link https://github.com/toji/webgl-texture-utils
         */

        this.textureList = [],

        this.keyList = [],

        this.greyPixel = new Uint8Array( [ 0.5, 0.5, 0.5, 1.0 ] );

        // Define emitter events

        /* 
         * Bind the Prim callback for geometry creation.
         */

        this.util.emitter.on( this.util.emitter.events.TEXTURE_READY, 

            ( prim ) => {

                // TODO: call update function

        } );


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

    /** 
     * Create a WebGL texture from a JavaScript Image object, and add it to our texture list.
     */
    addTexture ( image, path, key, mimeType, type ) {

        if ( key === undefined ) {

            console.error( 'TextureObj::addTexture(): undefined key' );

            return null;

        }

        let gl = this.webgl.getContext();

        if ( ! type ) {

            type = gl.TEXTURE_2D;

        }

        let texture = null;

        switch( type ) {

            case gl.TEXTURE_2D:

                texture = this.create2dTexture( image, key );

                break;

            case gl.TEXTURE_2D_ARRAY:

                // TODO: make this.

                break;

            case gl.TEXTURE_3D:

                texture = this.create3dTexture( image, key );

                break;

            case gl.TEXTURE_CUBE_MAP:

                texture = this.createCubeMapTexture( image, key );

                break;

            default:

                console.warn( 'TexturePool::addTexture(): unsupported texture requested' );

                break;

        }

        // If we got a texture, construct the output object for JS.

        if ( texture ) {

            let obj = {};

            /* 
             * We save references to the object in both numeric and associative arrays.
             * Format: { texture: WebGLTexture, key: associative key, pos: position in numeric array }
             */

            obj.image = image,      // JavaScript Image object.

            obj.mimeType = mimeType, // image/png, image/jpg...

            obj.type = type, // gl.TEXTURE_2D, gl.TEXTURE_3D...

            obj.path = path,        // URL of object

            obj.texture = texture,  // WebGLTexture

            obj.key = key;          // Associative key for this object

            // If our key is non-numeric, push it into our keyList indexing the global texture pool.

            if( ! this.util.isNumber( key ) ) {

                this.keyList[ key ] = obj;

            } 

            this.textureList.push( obj );

            // Object also saves its position index in the global texture pool.

            obj.pos = this.textureList.length - 1;

            return obj;

        } else {

            console.warn( 'TexturePool::addTexture(): no texture returned by createXXTexture() function' );

        }

        return null;

    }

    /** 
     * Find a texture by its key (numeric or string)
     */
    textureInList( key ) {

        if ( ! key ) {

            console.error( 'TextureObj::textureInlist(): undefined key' );

            return false;

        }

        if ( this.util.isNumber( key ) ) {

            return this.textureList[ key ];

        } else if ( this.keyList[ key ] ) {

            return this.keyList[ key ];

        }

        return null;

    }

    /** 
     * Find a texture by its path, if the path was not used as the key.
     * @param {String} path the URL of the texture file.
     * @returns {Boolean} if found in current textureList, return true, else false.
     */
    pathInList ( path ) {

        for ( let i = 0; i < this.textureList[ i ]; i++ ) {

            if( this.textureList[ i ].path === path ) {

                return this.textureList[ i ];

            }

        }

        return null;

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
     * Load textures, using a list of paths. If a Texture already exists, 
     * just return it. Otherwise, do the load.
     * @param {Array[String]} pathList a list of URL paths to load.
     * @param {Array[Object]} primTextureList the Prim textureList array for texture objects.
     * @param {Boolean} cacheBust if true, add a http://url?random query string to request.
     * @param {Boolean} keepDOMImage if true, keep the Image object we created the texture from (internal Blob). 
     */
    getTextures ( prim, pathList, cacheBust = true, keepDOMImage = false ) {

        // TODO: check texture list. If paths are already there, just use the path
        // TODO: and return the webgl texture buffer object.

        for ( let i = 0; i < pathList.length; i++ ) {

            let path = pathList[ i ];

            let poolTexture = this.pathInList( path );

            if ( poolTexture ) {

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
                             *   key: key, 
                             *   path: requestURL, 
                             *   data: null|response, (Blob, Text, JSON, FormData, ArrayBuffer)
                             *   error: false|response 
                             * } 
                             */

                            let image = new Image();

                            // Blob data type requires Image .onload for processing.

                            image.onload = () => {

                                //document.body.appendChild( image );

                                // Create a WebGLTexture from the Image (left off 'type' for gl.TEXTURE type).

                                let textureObj = this.addTexture( image, updateObj.path, updateObj.key, mimeType );

                                if ( textureObj ) {

                                    if( ! keepDOMImage ) {

                                        // Kill the reference to our local Image and its (Blob) data.

                                        textureObj.image = null;

                                        window.URL.revokeObjectURL( image.src );

                                    }

                                    // Emit a 'texture ready event' with the key in the pool and path.

                                    this.util.emitter.emit( this.util.emitter.events.TEXTURE_READY, prim, textureObj.key );

                                    prim.textures.push( textureObj );

                                }

                            } // end of image.onload

                            // Create a URL to the Blob, and fire the onload event (internal browser URL instead of network).

                            image.src = window.URL.createObjectURL( updateObj.data );


                        }, cacheBust, mimeType, 0 ); // end of this.doRequest(), initial request at 0 tries

                } else {

                    console.error( 'TexturePool::getTextures(): file type "' + this.util.getFileExtension( path ) + ' not supported, not loading' );

                }

            }

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
     * @param {Number} compressed the parameter identifying a compressed texture, e.g. gl.COMPRESSED_RGBA8_ETC2_EAC
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
    create3dTexture ( data, size, key ) {

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

            console.error( 'TextureObj::create2DTexture(): no data (' + data + '), for 3d, giving up' );

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
     * @memberOf module: webvr-mini/LoadTexture
     */
    createCubeMapTexture ( images, key ) {

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

}

export default TexturePool;