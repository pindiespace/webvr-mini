import AssetPool from './asset-pool';

'use strict' 

class ShaderPool extends AssetPool {

    /** 
     * Store Shader objects used to render scenes, input 
     * inherited classes from Shader (e.g. ShaderWater).
     */

    constructor ( init, util, glMatrix, webgl ) {

        super( util );

        console.log( 'In ShaderPool class' );
 
        this.webgl = webgl;

        this.glmatrix = glMatrix;

        if( this.init ) {

            // do something

        }

    }

    /** 
     * Render everything in mono 3d, for non-VR use case.
     * NOTE: you may want to call shaders individually in World.render()
     */
    renderMono () {

        let keyList = this.keyList;

        for ( let i in keyList ) {

            keyList[ i ].program.render();

        }

    }

    /** 
     * Render everything in VR, for displays or polyfills.
     * NOTE: you may want to call shaders individually in World.render()
     */
    renderVR ( vr, display, frameData ) {

        let keyList = this.keyList;

        for ( let i in this.keyList ) {

            keyList[ i ].program.renderVR( vr, display, frameData );

        }

    }

}

export default ShaderPool;