import LoadPool from  './load-pool';

export default class LoadTexture extends LoadPool {

    /**
     * Texture loader, using a texture pool.
  	 * @link http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html
     */

    constructor ( config ) {

        super( config );

        this.MAX_IMAGES = 16;

    }

    init () {

    }


}