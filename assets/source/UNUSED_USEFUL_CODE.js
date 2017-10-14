


/* unused JS code */


    /** 
     * Add a model
     * @param {Prim} prim the requesting Prim object.
     * @param {Object} data data to construct the Prim GeometryBuffer.
     * @param {String} path the file path to the object.
     * @param {Number} pos the index of the object in the calling Prim's array.
     * @param {String} mimeType the MIME type of the file.
     * @param {String} type the GeometryPool.typeList type of the object, e.g. MESH, SPHERE...
     */
    addModel ( prim, data, path, mimeType, options ) {

        //let d;

        let fType = this.util.getFileExtension( path );

        let d = null,

        emitEvent = '';

        switch ( fType ) {

            case 'obj':

                // Return a Model object.

                d = this.computeObjMesh( data, prim, path ); // ADDS LOTS OF STUFF TO 'd'
 
                // Not supplied by OBJ format.

                d.tangents = [];

                d.colors = [];

                emitEvent = this.util.emitter.events.OBJ_GEOMETRY_READY;

                break;

            case 'gltf':

                d = this.computeGlTFMesh( data, prim, path );

                emitEvent = this.util.emitter.events.GLTF_GEOMETRY_READY;

                break;

            case 'gltfbinary':

                d = this.computeGlTFBinaryMesh( data, prim, path );

                emitEvent = this.util.emitter.events.GLTF_GEOMETRY_READY;

                break;

            case 'hyg': // stardome or 3d stars

                //return this.adddModel( prim, data, mimeType, options );

                prim.drawTris = false,

                prim.drawLines = false,

                prim.drawPoints = true;

                /* 
                 * OPTIONS.xyz is assigned by GeometryPool as true for 
                 * typeList.STAR3D, false for typeList.STARDOME. HYG data contains 
                 * both spherical (RA and Dec) coordinates, as well as Cartesian coords.
                 */

                d = this.computeHyg( data, prim, path, options );

                emitEvent = this.util.emitter.events.HYG_GEOMETRY_READY;

                break;

            case 'png': // heightmap in BLOB format.

                return this.adddModel( prim, data, path, mimeType, options );

                break;

            default:

                console.warn( 'ModelPool::addModel(): unknown model file:' + path + ' MIME type:' + mimeType );

                break;

        }

        /* 
         * We save references to the model object in ModelPool.
         * NOTE: .addAsset() puts the assigned key by ModelPool into our object.
         */

        if ( d ) {

            d.type = prim.type,

            d.path = path,

            d.emits = emitEvent;

            /*
             * Model format which must be returned by Mesh or procedural geometry creation.
             * {
             *   vertices: vertices,
             *   indices: indices,
             *   texCoords: texCoords,
             *   normals: normals,
             *   options: options (start points for objects, groups, smoothingGroups, etc),
             *   type: type,
             *   path: file path
             * }
            */

            return this.addAsset( d );

        } else {

             console.warn( 'ModelPool::addModel(): no model returned by addModel() + ' + mimeType + ' function' );

        }

        return null;

    }

////////////////////////////////



MAKE SEPARATE FILE FOR THIS:


    getShaderData() {

        let sData = [];

        let shaders = this.getShaders();

        for ( let i = 0; i < shaders.length; i++ ) {

            let s = shaders[ i ];

            if ( ! s || ! s.name ) console.error( '.....World::getShaderData(): bad Shader:' + s )

                let sObject = {

                    name: shaders[ i ].name,

                    prims: []

                };

            let r = shaders[ i ].program.renderList;

            console.log("Shader:" + s.name + " program.RENDERLIST:" + r )

            for ( let j = 0; j < r.length; j++ ) {

                let p = r[ j ];

                if ( p !== null ) {

                    sObject.prims.push( p.name );

                } else {

                    console.log('.....World.getShaderData(): NULL in shader:' + s.name + " at program.renderList pos:" +  j )

                }

            }

            sData.push( sObject );

        }

        return sData;

    }


    

FROM PRIMFACTORY:

    /** 
     * Create a large coordinate data array with data for multiple Prims.
     * To make one, we just concatenate their  
     * vertices. Use to send multiple prims sharing the same Shader.
    // TODO: SET UP VERTEX ARRAYS, http://blog.tojicode.com/2012/10/oesvertexarrayobject-extension.html
    // TODO: https://developer.apple.com/library/content/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html
    // TODO: http://max-limper.de/tech/batchedrendering.html
     * @param {glMatrix.vec3[]} vertices
     * @returns {glMatrix.vec3[]} vertices
     */
    setVertexData ( vertices ) {

        vertices = [];

        for ( let i in this.keyList ) {

            vertices = vertices.concat( this.prims[ i ].geometry.vertices.data );

        }

        return vertices;

    }


    /** 
     * get the big array with all index data. Use to 
     * send multiple prims sharing the same Shader.
     * @param {Array} indices the indices to add to the larger array.
     * @returns {Array} the indices.
     */
    setIndexData ( indices ) {

        indices = [];

        for ( let i in this.prims ) {

            indices = indices.concat( this.prims[ i ].geometry.indices.data );

        }

        return indices;

    }



//////////////////////////////////////





/* don't need styles for controls on WebVR WebGL <canvas>, so remove from index.html */

        /* controls get local styles in Ui module. */

        .webvr-mini-controls {

            position: absolute;

            top: 0;

            left: 0;

            width: 100%;

            /* height adjusted dynamically by internal controls */

        }


    /** 
     * Regularize detecting the end of a CSS transition. Return the 
     * first transition event the browser supports.
     * @return {String} the transition event name.
     */
    transitionEndEvent () {

        var t, elem = document.createElement( 'fake' );

        var transitions = {
            'transition'      : 'transitionend',
            'OTransition'     : 'oTransitionEnd',
            'MozTransition'   : 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        };

        for ( t in transitions ) {

            if ( elem.style[ t ] !== undefined ) {

                return transitions[ t ];

            }

        }

    }


// Use with:

        // use the transition event end to set to inline-block.
        // @link https://jonsuh.com/blog/detect-the-end-of-css-animations-and-transitions-with-javascript/

        menu.addEventListener( this.transitionEndEvent(), ( evt ) => {

            console.log("ENTERING TRANSITION END EVENT")

        } );

    /**
     * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
     * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
     * Usage:
     * console.log(getTextWidth("hello there!", "bold 12pt arial"));  // close to 86
     * @param {String} text The text to be rendered.
     * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
     * @return {Number} the approx width of the text.
     */
    getTextWidth( text, font ) {

        // Re-use canvas object for better performance

        let canvas = this.getTextWidth.canvas || ( this.getTextWidth.canvas = document.createElement( 'canvas' ) );

        var context = canvas.getContext( '2d' );

        context.font = font;

        var metrics = context.measureText( text );

        return metrics.width;

    }

    /* 
     * ---------------------------------------
     * Ui UTILITIES
     * ---------------------------------------
     */

     /** 
      * Add a CSS rule to the first stylesheet of the browser. use for properties (e.g. :before, :after) that
      * can't be easily set up via element.styles.xxx methods.
      * @link http://fiddle.jshell.net/MDyxg/1/
      * Example: addCSSRule("body:after", "content: 'foo'");
      * @param {String} selector the CSS selector.
      * @param {String} styles the associated CSS styles.
      */
    addCSSRule ( selector, styles ) {

    let sheet = document.styleSheets[ 0 ];

        if ( sheet.insertRule ) {

            return sheet.insertRule( selector + " {" + styles + "}", sheet.cssRules.length );

        } else if ( sheet.addRule ) {

            return sheet.addRule( selector, styles );

        }

    }

        /* 
         * Some styles (e.g. pseudo-elements like before: and after: can't be added as local styles, and 
         * must be embedded in the local stylesheet).
         */

        //document.styleSheets[ 0 ].insertRule(

        //    '.webvr-mini-menuContainer:before {content: " ";position:absolute;width:0;height:0;left:20px;top:-8px;opacity:10%;border:9px solid;border-color:transparent transparent #880 transparent;',

        //    1

        //);



