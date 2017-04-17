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

            case gl.TEXTURE_3D:

                texture = this.create3dTexture( image, key );

                break;

            case gl.TEXTURE_CUBE_MAP:

            case gl.TEXTURE_CUBE_MAP_POSITIVE_X:

                break;

            default:

                break;

        }

        console.log( 'after trying to make 2d texture, texture: ' + texture );

        if ( texture ) {

            let obj = {};

            console.log( 'got a 2d texture' );

            /* 
             * We save references to the object in both numeric and associative arrays.
             * Format: { texture: WebGLTexture, key: associative key, pos: position in numeric array }
             */

            obj.image = image,      // JavaScript Image object.

            obj.mimeType = mimeType, // image/png, image/jpg...

            obj.type = type, // gl.TEXTURE_2D, gl.TEXTURE_3D...

            obj.path = path,        // URL of object

            obj.src = path, ////////////////TODO: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! REPLACE.src with path in Prim

            obj.texture = texture,  // WebGLTexture

            obj.key = key;          // Associative key for this object

            if( ! this.util.isNumber( key ) ) {

                this.keyList[ key ] = obj;

            } 

            this.textureList.push( obj );

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
     * @param {Array[Object]} primTextureList the Prim textureList. 
     */
    getTextures ( pathList, primTextureList, cacheBust = true ) {

        // TODO: check texture list. If paths are already there, just use the path
        // TODO: and return the webgl texture buffer object.

        for ( let i = 0; i < pathList.length; i++ ) {

            let path = pathList[ i ];

            let poolTexture = this.pathInList( path );

            if ( poolTexture ) {

                // Immediately ready, so just bind back to Prim.

                // TODO: kludge
                poolTexture.src = poolTexture.path;

                primTextureList.push( poolTexture ); /////////////////////////////////

            } else {

                // Get the image mimeType.

                let mimeType = this.textureMimeTypes[ this.util.getFileExtension( path ) ];

                // check if mimeType is OK.

                if( mimeType ) {

                    /* 
                     * Use Fetch API to load the image, wrapped in a Promise timeout with 
                     * multiple retries possible (in parent class GetAssets). Return a 
                     * response.blob() for images, and add to DOM or WebGL texture here.
                     */

                    this.doRequest( path, i, 

                        ( updateObj ) => {

                            /* 
                             * updateObj returned from GetAssets has the following structure:
                             * { 
                             *   key: key, 
                             *   path: requestURL, 
                             *   data: null|response, 
                             *   error: false|response 
                             * } 
                             */

                            let image = new Image();

                            // Blob data type requires Image .onload for processing.

                            image.onload = () => {

                            // Create a WebGLTexture from the Image (left off 'type' for gl.TEXTURE type).

                                let textureObj = this.addTexture( image, updateObj.path, updateObj.key, mimeType );

                                console.log(")))))))))))textureObj is a:" + textureObj );

                                document.body.appendChild( image ); // WORKS PERFECTLY WITH BLOB

                                // Remove the object URL (clear storage)

                                window.URL.revokeObjectURL( this.src );

                                // TODO: KLUDGE
                                // TODO: COULD EMIT EVENT HERE.....

                                if ( textureObj ) {

                                    textureObj.src = textureObj.path;

                                    primTextureList.push( textureObj );

                                }

                            } // end of image.onload

                            // Fire the onload even (internal browser instead of off network)

                            image.src = window.URL.createObjectURL( updateObj.data );

                            // TODO: PASS ARRAYBUFFERVIEW TYPE COERCED ARRAYBUFFER
                            // TODO: get ARRAYBUFFERVIEW FROM ARRAYBUFFER
                            //let textureObj = this.addTexture( updateObj.data, updateObj.path, updateObj.key, mimeType );

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
     */
    create2dTexture ( image, key ) {

        let gl = this.webgl.getContext(),

        src = image.src,

        texture = gl.createTexture();

        ///console.log('(((((((((((create2dTexture, instanceof arraybuffer:' + ( image instanceof ArrayBuffer) ) 
        ////console.log('(((((((((((create2dTexture, image:' + image)
        //console.log('(((((((((((create2dTexture:image.src:' + image.src)

        //image = new Uint8Array(image); // for arrayBuffer (which didn't work)

        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

        // Bind the texture data to the videocard, receive a WebGL texture in our textureObject.

        gl.bindTexture( gl.TEXTURE_2D, texture );

        // Use image, or default to single-color texture if image is not present.

        if ( image ) {

            console.log('TextureObj::create2DTexture(): HAVE an Image ' + image + ', try .texImage2D')

            gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image ); // HASN'T LOADED YET

            console.log('TextureObj::create2DTexture(): texture is now a ' + texture );

            // TODO: pass ArrayBufferView for Image and this would work
            //gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 100, 100, 0, gl.RGBA, gl.UNSIGNED_BYTE, image, 0 );

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

        console.log( 'TextureObj::create2DTexture(): at end, texture is a:' + texture );

        gl.bindTexture( gl.TEXTURE_2D, null );

        console.log( 'TextureObj::create2DTexture(): after unbound, texture is a:' + texture );

        return texture;

    }

    /** 
     * Upload a 3d texture.
     * @memberOf module: webvr-mini/LoadTexture
     */
    create3dTexture ( image, key ) {

        console.log( 'creating 3D texture' );

        return null;

    }

    /** 
     * Upload a cubemap texture.
     * @memberOf module: webvr-mini/LoadTexture
     */
    createCubeMapTexture ( image, key ) {

        console.log( 'creating cubemap texture' );

        return null;

    }

    // To add textures, use super.addRequests() or super.doRequest()

}

export default TexturePool;