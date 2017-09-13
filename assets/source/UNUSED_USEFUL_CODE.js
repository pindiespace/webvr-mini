
/* unused JS code */

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



