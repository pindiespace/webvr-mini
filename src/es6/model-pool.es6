
'use strict'

class ModelPool extends GetAssets {
	

	constructor ( init, util, webgl ) {

		console.log( 'in ModelPool' );

        // Initialize superclass.

        super( util );

        this.util = util,

        this.webgl = webgl,

        this.NOT_IN_LIST = this.util.NOT_IN_LIST;

        // If we encounter a texture file in the model file, load it, and emit.    

        this.util.emitter.on( this.util.emitter.events.TEXTURE_READY, 

        	( prim ) => {

            	// TODO: call update function when texture is ready.

        } );

        // Model data ready.

        this.util.emitter.on( this.util.emitter.events.GEOMETRY_READY, 

            ( prim ) => {

                // TODO: call update function when a geometry is ready.

        } );

        this.util.emitter.on( this.util.emitter.events.MATERIAL_READY, 

            ( prim ) => {

                // TODO: call update function when a material file is ready.

                // TODO: probably need a material pool file loader

        } );


	}

}

export default ModelPool;