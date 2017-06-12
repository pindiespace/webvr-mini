import Shader from './shader'

'use strict'

class ShaderColor extends Shader {

    /** 
     * --------------------------------------------------------------------
     * VERTEX SHADER 2
     * colorized, non-lit shader.
     * @link http://learningwebgl.com/blog/?p=684
     * StackGL
     * @link https://github.com/stackgl
     * phong lighting
     * @link https://github.com/stackgl/glsl-lighting-walkthrough
     * - vertex position
     * - texture coordinate
     * - model-view matrix
     * - projection matrix
     * --------------------------------------------------------------------
     */

    constructor ( init, util, glMatrix, webgl, webvr, shaderName, lights ) {

        super( init, util, glMatrix, webgl, webvr, shaderName, lights );

        // Define arrays that are needed for this shader.

        this.required.buffer.indices = true,

        this.required.buffer.colors = true,

        console.log( 'In ShaderColor class' );

    }

    /* 
     * Vertex and Fragment Shaders. We use the internal 'program' object from the webgl object to compile these. 
     * Alternatively, They may be defined to load from HTML or and external file.
     * @return {Object{code, varList}} an object, with internal elements
     * code: The shader code.
     * varList: A scanned list of all the variables in the shader code (created by webgl object).
     */
    vsSrc () {

        let s = [

            // Set precision.

            this.floatp,

            /* 
             * Attribute names are hard-coded in the WebGL object, with rigid indices.
             * vertex, textureX coordinates, colors, normals, tangents.
             */

            'attribute vec3 ' + this.webgl.attributeNames.aVertexPosition[ 0 ] + ';',
            'attribute vec4 ' + this.webgl.attributeNames.aVertexColor[ 0 ] + ';',
            'attribute vec3 ' + this.webgl.attributeNames.aVertexNormal[ 0 ] + ';',
            //'attribute vec2 ' + this.webgl.attributeNames.aTextureCoord[ 0 ] + ';',

            'uniform mat4 uMVMatrix;',
            'uniform mat4 uPMatrix;',
            'uniform mat3 uNMatrix;',   // Inverse-transpose of Model-View matrix

            // World position.

            'uniform vec3 uPOV;',

            // Adjusted positions and normals.

            'varying vec3 vPOV;',       // user point of view (camera)
            'varying vec4 vPositionW;', // adjusted position
            'varying vec4 vNormalW;',   // adjusted normal

            //'varying vec2 vTextureCoord;',

            'varying vec4 vVertexColor;',


            'void main(void) {',

            '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);',

            '    vVertexColor = aVertexColor;',

                'vPOV = -uPOV;',

                'vPositionW = uMVMatrix * vec4(aVertexPosition, 1.0);', // Model-View Matrix (including POV / camera).

                'vNormalW =  normalize(vec4(uNMatrix*aVertexNormal, 0.0));', // Inverse-transpose-normal matrix rotates object normals.

            '}'

        ];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    fsSrc () {

        let s = [

            // Set precision.

            this.floatp,

            /* 
             * Attribute names are hard-coded in the WebGL object, with rigid indices.
             * vertex, textureX coordinates, colors, normals, tangents.
             */

            // Lighting flags.

            'uniform bool uUseLighting;',
            'uniform bool uUseColor;',

            // Lighting values.

            'uniform vec3 uAmbientColor;',
            'uniform vec3 uLightingDirection;', // uLightingDirection
            'uniform vec3 uDirectionalColor;',

            // Material properties (includes specular highlights).

            'uniform vec3 uMatEmissive;',
            'uniform vec3 uMatAmbient;',
            'uniform vec3 uMatDiffuse;',
            'uniform vec3 uMatSpecular;',
            'uniform float uMatSpecExp;',

            // Alpha value.

            'uniform float uAlpha;',

            'varying vec3 vPOV;', // World point of view (camera)
            'varying vec4 vPositionW;',
            'varying vec4 vNormalW;',

            'varying lowp vec4 vVertexColor;',

            'void main(void) {',

                'vec4 vColor = vVertexColor;',

                //  Set light components by Light x Material.

                'vec4 Emissive = vec4(uMatEmissive, uAlpha);',

                'vec4 Ambient = vec4(uAmbientColor * uMatAmbient, uAlpha);',

                'vec4 Diffuse = vec4(uDirectionalColor * uMatDiffuse, uAlpha);',

                'vec4 Specular = vec4(0.0, 0.0, 0.0, uAlpha);',

               'if(uUseLighting) {',

                    // Add lighting direction to Diffuse.

                    'vec4 N = normalize(vNormalW);',

                    'vec4 LL = normalize(vec4(uLightingDirection, 1.0));',

                    'float NdotL = max( dot(N, LL), 0.0);',

                    'Diffuse = NdotL * Diffuse;',

                    // Compute specular dot. Changing 4th parameter to 0.0 instead of 1.0 improved results.

                    'vec4 L = normalize(vec4(uLightingDirection, 1.0) - vPositionW);',

                    'vec4 EyePosW = vec4(vPOV, 0.0);', // world = eye = camera position

                    'vec4 V = normalize(EyePosW - vPositionW );',

                    'vec4 H = normalize(L + V);',

                    'vec4 R = reflect(-L, N);', // -L computes side facing Light, +L computes shadow component

                    'float RdotV = max(dot(R, V), 0.0);',

                    'float NdotH = max(dot(N, H), 0.0);',

                    'float spec = uMatSpecExp;',

                    // Multiply Specular by global uAlpha here.

                    'Specular = pow(RdotV, spec) * pow(NdotH, spec) * vec4(uDirectionalColor * uMatSpecular, 1.0);',

                '}',

                // Final color.

                'gl_FragColor = (Emissive + Ambient + Diffuse + Specular) * vec4(vColor.rgb, vColor.a * uAlpha);',

            '}'

        ];

        return {

            code: s.join('\n'),

            varList: this.webgl.createVarList( s )

        };

    }

    /** 
     * --------------------------------------------------------------------
     * Vertex Shader 2, using color buffer but not texture.
     * --------------------------------------------------------------------
     */

    /** 
     * initialize the update() and render() methods for this shader.
     * @param{Prim[]} primList a list of initializing Prims (optional).
     */
    init ( primList ) {

        // DESTRUCTING DID NOT WORK!
        //[gl, canvas, mat4, vec3, pMatrix, mvMatrix, program ] = this.setup();

        let arr = this.setup(),

        gl = arr[ 0 ],

        canvas = arr[ 1 ],

        mat4 = arr[ 2 ],

        mat3 = arr[ 3 ],

        vec3 = arr[ 4 ],

        program = arr[ 5 ],

        vsVars = arr[ 6 ],

        fsVars = arr[ 7 ], 

        stats = arr[ 8 ],

        near = arr[ 9 ],

        far = arr[ 10 ],

        vr = arr[ 11 ],

        iSize = arr[ 12 ];

        // Attach objects.

        let shaderProgram = program.shaderProgram;

        // If we init with a primList, add them here.

        if ( primList ) {

            program.renderList = this.util.concatArr( program.renderList, primList );

        }

        // Local reference to our matrices.

        //let pMatrix = this.pMatrix,

        let mvMatrix = this.mvMatrix,
        
        vMatrix = this.vMatrix,

        mMatrix = this.mMatrix;

        /** 
         * POLYMORPHIC PROPERTIES AND METHODS
         */

        // Shorten names of attributes, uniforms for rendering.

        let aVertexPosition = vsVars.attribute.vec3.aVertexPosition,

        aVertexColor = vsVars.attribute.vec4.aVertexColor,

        aVertexNormal = vsVars.attribute.vec3.aVertexNormal,

        // Lighting

        uUseLighting = fsVars.uniform.bool.uUseLighting,

        uAmbientColor = fsVars.uniform.vec3.uAmbientColor, // ambient light color

        uDirectionalColor = fsVars.uniform.vec3.uDirectionalColor, // directional light color

        uLightingDirection = fsVars.uniform.vec3.uLightingDirection, 

        // Overall Alpha value (individual colors may have their own).

        uAlpha = fsVars.uniform.float.uAlpha,

        // Material properties.

        uMatEmissive = fsVars.uniform.vec3.uMatEmissive,

        uMatAmbient = fsVars.uniform.vec3.uMatAmbient,

        uMatDiffuse = fsVars.uniform.vec3.uMatDiffuse,

        uMatSpecular = fsVars.uniform.vec3.uMatSpecular,

        uMatSpecExp = fsVars.uniform.float.uMatSpecExp,

        // Model-view, Perspective and inverse-transpose matrix.

        uPMatrix = uPMatrix = vsVars.uniform.mat4.uPMatrix,

        uMVMatrix = uMVMatrix = vsVars.uniform.mat4.uMVMatrix,

        uNMatrix = vsVars.uniform.mat3.uNMatrix; // Inverse-transpose normal matrix

        // Lighting.

        let light0 = this.lights.getLight( this.lights.lightTypes.LIGHT_0 ), // 'this.lights' loaded in parent Shader class

        ambient = light0.ambient,

        lightingDirection = light0.lightingDirection,

        directionalColor = light0.directionalColor,

        uPOV = vsVars.uniform.vec3.uPOV; // World Position (also position of camera/POV)

        // Initialize some local variables.

        let nMatrix = mat3.create(); // TODO: ADD MAT3 TO PASSED VARIABLES

        let adjustedLD = lightingDirection;

        // Update Prim position, motion - given to World object.

        program.update = ( prim, MVM, updatePrim ) => {

            // Update the model-view matrix using current Prim position, rotation, etc.

            prim.setMV( MVM );

            // Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix.

            mat3.normalFromMat4( nMatrix, MVM );

            // Update coordinates every time for mono, but only one time for stereo.

            if ( updatePrim ) prim.updateCoords();

        }

        // Create a save matrix.

        let saveMV = mat4.create();

        /*
         * Prim rendering. We pass in a the Projection Matrix so we can render in mono and stereo, and 
         * the position of the camera/eye (POV) for some kinds of rendering (e.g. specular).
         * @param {glMatrix.mat4} PM projection matrix, either mono or stereo.
         * @param {glMatrix.vec3} pov the position of the camera in World space.
         * @param {Boolean} updatePrim if true, adjust Prim coordinates. Do every time for mono, but only 
         * one time for stereo.
         */

        program.render = ( PM, pov, updatePrim ) => {

            if ( ! program.renderList.length ) return;

            gl.useProgram( shaderProgram );

            // Save the model-view supplied by the Shader. Mono and VR return different MV matrices.

            mat4.copy( saveMV, mvMatrix );

            // Reset perspective matrix.

            //mat4.perspective( PM, Math.PI*0.4, canvas.width / canvas.height, near, far ); // right

            for ( let i = 0, len = program.renderList.length; i < len; i++ ) {

                let prim = program.renderList[ i ];

                // Only render if we are visible.

                if ( ! prim || prim.alpha === 0 ) continue; // could be null or invisible

                // Individual prim update, using mvMatrix.

                program.update( prim, mvMatrix, updatePrim );

                // Look for (multiple) materials.

                let ms = prim.matStarts;

                // Bind vertex buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.vertices.buffer );
                gl.enableVertexAttribArray( aVertexPosition );
                gl.vertexAttribPointer( aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

                // Bind color buffer.

                gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.colors.buffer );
                gl.enableVertexAttribArray( aVertexColor );
                gl.vertexAttribPointer( aVertexColor, 4, gl.FLOAT, false, 0, 0 );

                // Bind lighting.

                gl.uniform3fv( uAmbientColor, ambient );
                gl.uniform3fv( uLightingDirection, adjustedLD );
                gl.uniform3fv( uDirectionalColor, directionalColor );
                gl.uniform3fv( uPOV, pov.position ); // used for specular highlight

                // Alpha, with easing animation (in this.util).

                gl.uniform1f( uAlpha, prim.alpha );

                if ( prim.useLighting ) {

                    gl.uniform1i( uUseLighting, 1 );

                    // Bind normals for lighting.

                    gl.bindBuffer( gl.ARRAY_BUFFER, prim.geometry.normals.buffer );
                    gl.enableVertexAttribArray( aVertexNormal );
                    gl.vertexAttribPointer( aVertexNormal, 3, gl.FLOAT, false, 0, 0 );

                } else {

                    // Turn off lighting in the Shader.

                    gl.uniform1i( uUseLighting, 0 );

                }

                // Set normals matrix uniform (inverse transpose matrix).

                gl.uniformMatrix3fv( uNMatrix, false, nMatrix );

                // Set Perspective uniform.

                gl.uniformMatrix4fv( uPMatrix, false, PM );

                // Model-View matrix uniform.

                gl.uniformMatrix4fv( uMVMatrix, false, mvMatrix );

                // Bind indices buffer.

                gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, prim.geometry.indices.buffer );

                // Loop through materials

                /* 
                 * iSize is either gl.UNSIGNED_INT (0 -> 2e9) or gl.UNSIGNED_SHORT (0 -> 65535)
                 * GeometryPool and ModelPool routines are expected to "chop"
                 */

                // Loop through materials, and regions of Prim they apply to.

                for ( let j = 0; j < ms.length; j++ ) {

                    let st = ms[ j ];

                           // Get the next material from prim.matStarts

                    let m = prim.materials[ st[ 0 ] ]; // bind the material

                    // Set the material quality of the Prim.

                    gl.uniform3fv( uMatAmbient, m.ambient );
                    gl.uniform3fv( uMatDiffuse, m.diffuse );
                    gl.uniform3fv( uMatEmissive, m.emissive );
                    gl.uniform3fv( uMatSpecular, m.specular );
                    gl.uniform1f( uMatSpecExp, m.specularExponent );

                    gl.drawElements( gl.TRIANGLES, st[ 2 ], iSize, st[ 1 ] );

                }

                // Copy back the original Model-View matrix for the next Prim. 

                mat4.copy( mvMatrix, saveMV );

            } // end of renderList for Prims

        } // end of program.render()

        return program;

    } // end of init()

}

export default ShaderColor;