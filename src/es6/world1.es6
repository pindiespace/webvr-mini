export default class world {

    /** 
     * The World class creates the scene, and should be uniquely 
     * written for each instance using the WebVR-Mini library.
     * Required functions:
     * getVS() - the vertex shader.
     * getFS() - get the fragment shader.
     * rer() - update on rer of <canvas>.
     * render() - rendering loop.
     * init() - create the world for this first time.
     * constructor() - initialize, passing in WebVR-Mini object.
     */

    /** 
     * constructor.
     * @param {WeVRMini} webvr the webvr module.
     */
    constructor ( webgl, prim ) {

        this.webgl = webgl;

        this.prim = prim;

        this.canvas = webgl.getCanvas();

        this.gl = webgl.getContext();

        this.glMatrix = webgl.glMatrix;

        this.objVertices = [];

        this.objIndices = [];

        this.objColors = [];

        this.pMatrix = this.glMatrix.mat4.create();

        this.mvMatrix = this.glMatrix.mat4.create();

        this.time_old = this.time = 0;

        this.ready = false;

    }

    /** 
     * vertex shader.
     * sample vertex and fragment shaders.
     * @link http://sethlakowske.com/articles/webgl-using-gl-mat4-browserify-shader-and-browserify/
     */
    getVS () {

        return [

        'attribute vec3 position;',
        'uniform mat4 Pmatrix;',
        'uniform mat4 Vmatrix;',
        'uniform mat4 Mmatrix;',
        'attribute vec4 color;',//the color of the point
        'varying vec4 vColor;',
            
        'void main(void) { ',//pre-built function
            'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);',
            'vColor = color;',
        '}'

        ].join('\n');
    }

    /**
     * fragment shader.
     */
    getFS () {

        return [

        'precision mediump float;',
        'varying vec4 vColor;',
        'void main(void) {',
            'gl_FragColor = vColor;',
            //'gl_FragColor = vec4(vColor, 1.);',
        '}'

        ].join('\n');

    }

    /**
     * Handle resize event for the World.
     * @param {Number} width world width (x-axis).
     * @param {Number} depth world depth (z-axis).
     */
    resize ( width, depth ) {


    }

    /** 
     * Start building the world for the first time.

http://learningwebgl.com/blog/?p=28

https://www.tutorialspoint.com/webgl/webgl_colors.htm

some fixes for glmatrix
https://github.com/kpreid/cubes/blob/master/util.js

http://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html


     */
    init () {

        let gl = this.gl;

        this.vertices = [
            -1,-1,-1,  1,-1,-1,  1, 1,-1, -1, 1,-1,
            -1,-1, 1,  1,-1, 1,  1, 1, 1, -1, 1, 1,
            -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
             1,-1,-1,  1, 1,-1,  1, 1, 1,  1,-1, 1,
            -1,-1,-1, -1,-1, 1,  1,-1, 1,  1,-1,-1,
            -1, 1,-1, -1, 1, 1,  1, 1, 1,  1, 1,-1, 
         ];
         this.vertices.itemSize = 3;
         this.vertices.numItems = 24; /////////////////NOT RIGHT


        this.colors = [
            1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1,
            1,1,3,1, 1,1,3,1, 1,1,3,1, 1,1,3,1,
            0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1,
            1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1,
            1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
            0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1
         ];
         this.colors.itemSize = 4;
         this.colors.numItems = 28;

        this.indices = [
            0,1,2,     0,2,3,
            4,5,6,     4,6,7,
            8,9,10,    8,10,11,
            12,13,14, 12,14,15,
            16,17,18, 16,18,19,
            20,21,22, 20,22,23 
         ];
         this.indices.itemSize = 1;
         this.indices.numItems = 36;

        let vs = this.webgl.createVertexShader( this.getVS() );

        let fs = this.webgl.createFragmentShader( this.getFS() );

        this.shaderProgram = this.webgl.createProgram( vs, fs );
        let shaderProgram = this.shaderProgram;

        // Get reference to uniform locations in shader program
        this.Pmatrix = gl.getUniformLocation( shaderProgram, "Pmatrix" );
        this.Vmatrix = gl.getUniformLocation( shaderProgram, "Vmatrix" );
        this.Mmatrix = gl.getUniformLocation( shaderProgram, "Mmatrix" );


        let myCube = this.prim.createCube( 
            'bob', 
            1.0, 
            this.glMatrix.vec3.create(), 
            this.glMatrix.vec3.create(), 
            this.glMatrix.vec3.create()
        );

        //this.vertices = myCube.vertices;
        //this.indices = myCube.indices;

        window.myCube = myCube;

        // Vertex buffer.
        this.vbo = this.webgl.createVBO( this.vertices, gl.STATIC_DRAW );
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        let position = gl.getAttribLocation( shaderProgram, "position" );
        this.position = position;
        gl.vertexAttribPointer( position, 3, gl.FLOAT, false, 0 ,0 ) ;
        gl.enableVertexAttribArray( position );


        // Color buffer.
        this.cbo = this.webgl.createCBO( this.colors, gl.STATIC_DRAW );
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cbo);
        let color = gl.getAttribLocation( shaderProgram, "color" );
        this.color = color;
        gl.vertexAttribPointer( color, 4, gl.FLOAT, false, 0, 0 ) ;
        gl.enableVertexAttribArray( color );

        // Index buffer.
        this.ibo = this.webgl.createIBO( this.indices, gl.STATIC_DRAW );
        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo );
        //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        // Use the program.

        gl.useProgram( this.shaderProgram );

        this.proj_matrix = this.get_projection(40, this.canvas.width/this.canvas.height, 1, 100);
        this.view_matrix = this.glMatrix.mat4.create(); 
        this.mov_matrix = this.glMatrix.mat4.create();

        this.glMatrix.mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, this.proj_matrix);
        this.glMatrix.mat4.identity( this.view_matrix );
        this.view_matrix[14] = this.view_matrix[14]-3;//ZOOM THE SIZE IMPORTANT HAS TO BE DONE!!!!!
        this.glMatrix.mat4.identity( this.mov_matrix );


        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        this.render();

    }

    rotateZ(m, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var mv0 = m[0], mv4 = m[4], mv8 = m[8];
                
            m[0] = c*m[0]-s*m[1];
            m[4] = c*m[4]-s*m[5];
            m[8] = c*m[8]-s*m[9];

            m[1]=c*m[1]+s*mv0;
            m[5]=c*m[5]+s*mv4;
            m[9]=c*m[9]+s*mv8;
         }

    rotateX(m, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var mv1 = m[1], mv5 = m[5], mv9 = m[9];
                
            m[1] = m[1]*c-m[2]*s;
            m[5] = m[5]*c-m[6]*s;
            m[9] = m[9]*c-m[10]*s;

            m[2] = m[2]*c+mv1*s;
            m[6] = m[6]*c+mv5*s;
            m[10] = m[10]*c+mv9*s;
         }

    rotateY(m, angle) {
            var c = Math.cos(angle);
            var s = Math.sin(angle);
            var mv0 = m[0], mv4 = m[4], mv8 = m[8];
                
            m[0] = c*m[0]+s*m[2];
            m[4] = c*m[4]+s*m[6];
            m[8] = c*m[8]+s*m[10];

            m[2] = c*m[2]-s*mv0;
            m[6] = c*m[6]-s*mv4;
            m[10] = c*m[10]-s*mv8;
         }



    get_projection(angle, a, zMin, zMax) {
            var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
            return [
               0.5/ang, 0 , 0, 0,
               0, 0.5*a/ang, 0, 0,
               0, 0, -(zMax+zMin)/(zMax-zMin), -1,
               0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
            ];
         }

    /** 
     * WORLD-SPECIFIC FUNCTIONS GO HERE.
     */

    /**
     * Create objects specific to this world.
     * TODO: 'EXTENDS'
     */
    create () {


    }

    /** 
     * update the world in time increments, e.g. motion and 
     * animation.
     */
    update () {

        let dt = this.time - this.time_old;
        dt = 2;
        this.rotateZ(this.mov_matrix, dt*0.005);//time
        this.rotateY(this.mov_matrix, dt*0.002);
        this.rotateX(this.mov_matrix, dt*0.003);
        this.time_old = this.time;

    }

    /**
     * Render the World.
     */
   render () {

        let gl = this.gl;

        let program = this.shaderProgram;

        let position = this.position;

        let color = this.color;

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);

        this.update();

        gl.useProgram( program );

        gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniformMatrix4fv(this.Pmatrix, false, this.proj_matrix);
        gl.uniformMatrix4fv(this.Vmatrix, false, this.view_matrix);
        gl.uniformMatrix4fv(this.Mmatrix, false, this.mov_matrix);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame( () => { this.render() } );

    }

}