

<!DOCTYPE html>
<html>
<head>
<style>
body { background-color: #EEEEFF; }
</style>
</head>

<script id="vertex-shader" type="x-shader/x-vertex">

uniform   mat4  modelViewMatrix;    // model to camera/view/eye space matrix (world space is skipped)
uniform   mat4  projectionMatrix;   // camera/view/eye to clip space matrix
uniform   mat3  normalsMatrix;      // a different transformation matrix is used for the normal vectors

attribute vec4  vPosition;          // vertex position (model space)
attribute vec3  vNormal;            // vertex normal   (model space, cartesian coordinates)
attribute vec4  vTangent;           // vertex tangent  (calculated as per www.terathon.com/code/tangent.html)
attribute vec2  vTexCoord;          // texture coordinates - input

varying   vec3  viewPos;            // current position in the view space
varying   vec2  texCoord;           // texture coordinates - output (to be interpolated)
//varying   mat3  TBN;                // TBN (tangent to view space transformation) matrix
                                    // NOTE: the normal vector is stored in the 3rd column i.e. TBN[2]
varying   vec3  Normal0, Tangent0;
varying   float handedness;
                                    
void main()
{
  // transform the vertex position from model to camera/view space
  vec4 vertexPos4 = modelViewMatrix * vPosition;

  // transform the vertex coordinates from the camera space into clip space 
  gl_Position = projectionMatrix * vertexPos4;
  
  // the texture coordinates
  texCoord = vTexCoord;
  
  // transform the homogeneous view coordinates into cartesian view coordinates
  // (so that we can compare them with the light positions)
  viewPos = vertexPos4.xyz / vertexPos4.w;
  
  // compute the normalized TBN vectors - using the code from this page:
  // http://www.gamasutra.com/blogs/RobertBasler/20131122/205462/Three_Normal_Mapping_Techniques_Explained_For_the_Mathematically_Uninclined.php
//  vec3 n = normalize( normalsMatrix * vNormal );
//  vec3 t = normalize( normalsMatrix * vTangent.xyz );
//  vec3 b = normalize( normalsMatrix * ( cross( vNormal, vTangent.xyz ) * vTangent.w ) );

  // the three vectors form the TBN matrix that will help us transform the normals from the normal map
  // texture to the view space
//  TBN = mat3( t, b, n );

  Normal0  = normalize( normalsMatrix * vNormal );
  Tangent0 = normalize( normalsMatrix * vTangent.xyz );
  handedness = vTangent.w;
}
</script>

<script id="fragment-shader" type="x-shader/x-fragment">

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

const int TEXTURING   = 0;            // if texturing is off, the solid color is used instead
const int LIGHTING    = 1;            // if lighting is off, the texture/solid color remains unaffected
const int NORMMAPPING = 2;            // if normal mapping is off, the surface normal is used in lighting calculations
const int ENVMAPPING  = 3;            // if this is on, the env map texture is sampled and multiplied with the texture color
const int SPECMAPPING = 4;            // if specular map is on, it is used to choose the fragments on which the specular color
                                      // and environment mapping is applied
const int NUM_FLAGS   = 5;

uniform int flags[NUM_FLAGS];         // boolean values for each of the flags

uniform vec3  solidColor;             // solid material color (used if texturing is OFF)

uniform vec3  lightPos0;              // position of the light sources (camera space, cartesian coords.)
uniform vec3  lightAmb0;              // the ambient light intensities * colors
uniform vec3  lightDiff0;             // the diffuse light intensities * colors
uniform vec3  lightSpec0;             // the specular light intensities * colors
uniform float matShininess;           // the specular exponent (shininess)

uniform sampler2D   Tex0;             // the texture to use
uniform samplerCube EnvTex;           // the environment map (cube map texture)
uniform sampler2D   NormMap;          // the normal map texture
uniform sampler2D   SpecMap;          // the specular map texture

varying   vec3  viewPos;              // current position in the view space
varying   vec2  texCoord;             // texture coordinates - output (to be interpolated)
//varying   mat3  TBN;                  // TBN (tangent to view space transformation) matrix
                                      // NOTE: the normal vector is stored in the 3rd column i.e. TBN[2]
varying   vec3  Normal0, Tangent0;
varying   float handedness;
    
// adapted from http://ogldev.atspace.co.uk/www/tutorial26/tutorial26.html    
vec3 CalcBumpedNormal()
{
  vec3 Normal = normalize(Normal0), Tangent = normalize(Tangent0);
  Tangent = normalize(Tangent - dot(Tangent, Normal) * Normal);
  vec3 Bitangent = cross(Normal, Tangent) * handedness;
  vec3 BumpMapNormal = texture2D(NormMap, texCoord).xyz * 2.0 - 1.0;
  vec3 NewNormal = mat3(Tangent, Bitangent, Normal) * BumpMapNormal;
  return normalize(NewNormal);
}

void main()
{
  // the vector to the viewer/eye is the vector to the origin point in view space
  // (normalize b/c the linear interpolation doesn't conserve the vector lengths)
  vec3 V = normalize(-viewPos);

  // if not normal mapping, the normal vector is just the 3rd column of the TBN matrix
  // otherwise, the perturbed normal as sampled from the normal map texture is used (and
  // converted from tangent to the view space by multiplying with the TBN matrix)
  //vec3 N = flags[NORMMAPPING] == 0 ? normalize(TBN[2]) : TBN * normalize( texture2D(NormMap, texCoord).xyz * 2.0 - 1.0 );
  vec3 N = (flags[NORMMAPPING] == 0) ? normalize(Normal0) : CalcBumpedNormal();
  
  // if texturing is on, sample the current texture (otherwise, use the solid color)
  vec3 texCol = (flags[TEXTURING] != 0) ? texture2D(Tex0, texCoord).rgb : solidColor;

  // by default, all the fragments have a specular component; if a specular map is specified
  // get this value from the red component of the texture color
  float specFact = (flags[SPECMAPPING] == 0) ? 1.0 : 1.0-texture2D(SpecMap, texCoord).r;

  // if lighting is enabled
  if (flags[LIGHTING] != 0)
  {
    // determine the normalized vector to the light
    vec3 L = normalize(lightPos0 - viewPos);

    // the dot product of the normalized light and normal-to-surface vectors equals
    // the cosine of the angle between them (lambertian diffuse reflection coefficient)
    float Kd = max(dot(L, N), 0.0);

    // start with a zero specular reflection coefficient
    float Ks = 0.0;

    // if the lambertian was <0, the angle between the light direction and the normal
    // to the surface is over 90-degrees (on the other side) so consider neither
    // a diffuse nor a specular component to the fragment color
    if (Kd > 0.0)
    {
      // how far is the light source from the current point
      // (compute an attenuation factor that inversely depends on the distance)
      float dist = distance(lightPos0, viewPos);
      float fatt = 1.0 / (1.0 + 0.125 * dist); // TODO: determine the dist coeff. in denominator

      // ***** Gaussian *****
      // taken from here: http://alfonse.bitbucket.org/oldtut/Illumination/Tut11%20Gaussian.html
      // calculate the "half vector" (as for Blinn-Phong)
      vec3 H = normalize(V + L);
      
      // then the angle (in radians) between half-vector and the surface normal
      float angHN = acos(max(dot(H, N), 0.0));// angHN in [0,pi/2] (similar to Blinn)
      
      // the shininess is in [0,1] range
      float alpha = 2.0 * angHN / (1.025 - matShininess);

      // compute the specular reflection coefficient as exp(-a^2)
      Ks = exp(-(alpha * alpha));
     
      // adjust the diffuse coefficient with the attenuation factor
      Kd *= fatt;
      
      // and the specular also with the spec factor
      Ks *= fatt * specFact;
    }

    // modulate the texture color with the combined lighting factor
    texCol = /*lightAmb0 +*/ Kd * lightDiff0 * texCol + Ks * lightSpec0;
  }

  // if no environment mapping
  if (flags[ENVMAPPING] == 0)
  {
    gl_FragColor = vec4(texCol, 1.0);
  }
  else
  {
    // use the reflected vector from the eye to the current surface point
    // as the lookup key in the cube texture to get the environment color
    vec3 envCol = textureCube(EnvTex, reflect(V, N)).rgb;
    // this is more natural but we're mixing to suit our demos purposes
    //gl_FragColor = vec4(texCol + envCol * specFact, 1.0);
    gl_FragColor = vec4(mix(texCol, envCol, specFact), 1.0);
  }
  
  // output the fragment color
  //gl_FragColor = vec4(mix(envCol, texCol, specFact), 1.0);
  //gl_FragColor = vec4(texCol * envCol, 1.0);
  //gl_FragColor = vec4(vec3(specFact), 1.0);
}
</script>

<script id="comptex_vs" type="x-shader/x-vertex">

attribute vec2 vPosition;
varying   vec2 vCoords;

void main()
{    
  vCoords = vPosition;
  gl_Position = vec4(vPosition.x, vPosition.y, 0.0, 1.0);
}

</script>

<script id="comptex_fs" type="x-shader/x-fragment">

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

const float PI   = 3.141592653589793;
const float PI_2 = 1.5707963267948966; // pi/2

varying vec2 vCoords;
uniform vec4 uParams; // function params (to generate variants for animation)
uniform bool SCorr;   // sphere correction
uniform bool mode;

void main()
{
  float y = vCoords.y, x = vCoords.x;
  if (SCorr) x *= cos(y * PI_2);
  
  if (mode)
  {
    x += uParams.x; y += uParams.y;
    float r = sqrt(x * x + y * y) * PI * uParams.z;
    
    vec3 tmp;
    
    tmp.x = cos(r + uParams.w);
    tmp.y = sin(r - uParams.w);
    tmp.z = tmp.x * tmp.y + 1.0;
    vec3 norm = normalize(tmp) * 0.5 + 0.5;
    
    gl_FragColor = vec4(norm, 1.0);
  }
  else
  {
    x += uParams.x; y += uParams.y;
    float r   = sqrt(x * x + y * y) * PI;
    float res = sin(r * uParams.z + uParams.w) * 0.5 + 0.5;

    vec4 color = vec4(res, res, res, 1.0);

    // prof. Angel's post-processing :)
    if (color.g < 0.5) color.g = 2.0 * color.g;
    else color.g = 2.0 - 2.0 * color.g;
    color.b = 1.0 - color.b;

    gl_FragColor = color;
  }
}
</script>

<script id="xformtex_vs" type="x-shader/x-vertex">

attribute vec2 vPosition;

void main()
{    
  gl_Position = vec4(vPosition.x, vPosition.y, 0.0, 1.0);
}

</script>

<script id="xformtex_fs" type="x-shader/x-fragment">

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D Tex0;
uniform vec2      uPel; // set by the CPU code to contain 1/width and 1/height

//const vec3 rgb2int = vec3(0.2989, 0.5870, 0.1140);
//float intensity( vec4 rgb ) { return dot( rgb.rgb, rgb2int); }
float intensity( vec4 rgb ) { return rgb.r; }

void main()
{
  // current pel position in [0,1] coordinates
  vec2 xy = gl_FragCoord.xy * uPel;

#if 1
  const float scFact = 2.0;

  float h00 = intensity( texture2D( Tex0, xy ) );
  float h10 = intensity( texture2D( Tex0, xy + vec2(uPel.x, 0) ) );
  float h01 = intensity( texture2D( Tex0, xy + vec2(0, uPel.y) ) );
  
  vec3 v10 = vec3(1, 0, scFact * (h10 - h00));
  vec3 v01 = vec3(0, 1, scFact * (h01 - h00));
  vec3 norm = normalize(cross(v10, v01)) * 0.5 + 0.5;
  
  gl_FragColor = vec4(norm, 1.0);
//  gl_FragColor = vec4(norm, h00);
#else
  gl_FragColor = texture2D( Tex0, xy ); // simple copy
#endif
}

</script>


<script type="text/javascript" src="http://www.cs.unm.edu/~angel/COURSERA/CODE/Common/webgl-utils.js"></script>
<script type="text/javascript" src="http://www.cs.unm.edu/~angel/COURSERA/CODE//Common/initShaders.js"></script>
<script type="text/javascript" src="http://www.cs.unm.edu/~angel/COURSERA/CODE//Common/MV.js"></script>
<script type="text/javascript" src="sphere_mapping.js"></script>

<body>

<canvas id="gl-canvas" width="800" height="800">
Oops ... your browser doesn't support the HTML5 canvas element
</canvas>
<br><br>
<div id="demoDesc"></div>
<br>
<button id = "NextDemo">NextDemo</button>
<button id = "ToggleRot" hidden>Toggle auto rotation</button>

</body>

</html>



////////////////////////////////////////////////////////////////////////////////


"use strict";

const maxNumVertices = 10000;

var gl;

var compVertices = null; // for the quad covering all the viewport

var program, comptex_prog, xformtex_prog;
var vPositionLoc, vNormalLoc, vTangentLoc, vTexCoordLoc;
var compVPosLoc, compParamsLoc, compSCorrLoc, compModeLoc;
var xformVPosLoc, xformTex0Loc, xformUPelLoc, xformUPel = flatten([1,1]);

// the render-to-texture frame buffers and their associated textures
var rttFBO = [];

// each object will use these buffers in turn when it's time to render itself 
var vertexBuffer, normalBuffer, tangentBuffer, texCoordsBuffer, indexBuffer;

// the camera moves on a sphere of the given radius; the two angles
// signify the latitude/longitude coordinates (in radians)
var radius = 4.0;
var theta  = 0.0;
var phi    = 0.0;

// the camera looks at the origin point without tilting
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// perspective projection
const fovy       = 45;  // in degrees
var   aspect     = 1.0; // this is determined dynamically
const persp_near = 0.5;
const persp_far  = 25;

// fill color
var sceneColor = vec4(0.85,0.85,0.94,1);

// the position of the light #0 (in world coordinates)
var light0PosWorld = vec4(1.5, 1.0, 1.0, 1.0);
var light0AmbCol   = vec3(0.0, 0.0, 0.0);
var light0DiffCol  = vec3(1.0, 1.0, 1.0);
var light0SpecCol  = vec3(0.5, 0.5, 0.5);

var TEXTURING   = false;
var LIGHTING    = false;
var NORMMAPPING = false;
var ENVMAPPING  = false;
var SPECMAPPING = false; 

var updateModel = null;

// the current view and projection matrices (these are global - only the model ones are one per object)
var viewMatrix = [], projectionMatrix = [];

// locations of the uniform variables in the GLSL code (vertex shader & fragment shader)
var modelViewMatrixLoc, projectionMatrixLoc, normalsMatrixLoc;
var flagsLoc, solidColorLoc, lightPos0Loc, lightAmb0Loc, lightDiff0Loc, lightSpec0Loc, matShininessLoc;

// the types of the known geometric objects
var OBJ_T = { CUBE: 0, CONE: 1, CYLINDER: 2, SPHERE: 3 };

// 24 vertices
const cubeVertices = flatten(
[
  vec4( -0.5, -0.5,  0.5, 1.0 ), vec4(  0.5, -0.5,  0.5, 1.0 ), vec4(  0.5,  0.5,  0.5, 1.0 ), vec4( -0.5,  0.5,  0.5, 1.0 ), // Front
  vec4( -0.5, -0.5, -0.5, 1.0 ), vec4( -0.5,  0.5, -0.5, 1.0 ), vec4(  0.5,  0.5, -0.5, 1.0 ), vec4(  0.5, -0.5, -0.5, 1.0 ), // Back
  vec4( -0.5,  0.5, -0.5, 1.0 ), vec4( -0.5,  0.5,  0.5, 1.0 ), vec4(  0.5,  0.5,  0.5, 1.0 ), vec4(  0.5,  0.5, -0.5, 1.0 ), // Top
  vec4( -0.5, -0.5, -0.5, 1.0 ), vec4(  0.5, -0.5, -0.5, 1.0 ), vec4(  0.5, -0.5,  0.5, 1.0 ), vec4( -0.5, -0.5,  0.5, 1.0 ), // Bottom
  vec4(  0.5, -0.5, -0.5, 1.0 ), vec4(  0.5,  0.5, -0.5, 1.0 ), vec4(  0.5,  0.5,  0.5, 1.0 ), vec4(  0.5, -0.5,  0.5, 1.0 ), // Right
  vec4( -0.5, -0.5, -0.5, 1.0 ), vec4( -0.5, -0.5,  0.5, 1.0 ), vec4( -0.5,  0.5,  0.5, 1.0 ), vec4( -0.5,  0.5, -0.5, 1.0 ), // Left
]);

// 24 normals - each vertex has a corresponding normal vector 
const cubeNormals = flatten(
[
  vec3(0.0,  0.0,  1.0 ), vec3(0.0,  0.0,  1.0 ), vec3(0.0,  0.0,  1.0 ), vec3(0.0,  0.0,  1.0 ), // Front
  vec3(0.0,  0.0, -1.0 ), vec3(0.0,  0.0, -1.0 ), vec3(0.0,  0.0, -1.0 ), vec3(0.0,  0.0, -1.0 ), // Back
  vec3(0.0,  1.0,  0.0 ), vec3(0.0,  1.0,  0.0 ), vec3(0.0,  1.0,  0.0 ), vec3(0.0,  1.0,  0.0 ), // Top
  vec3(0.0, -1.0,  0.0 ), vec3(0.0, -1.0,  0.0 ), vec3(0.0, -1.0,  0.0 ), vec3(0.0, -1.0,  0.0 ), // Bottom
  vec3(1.0,  0.0,  0.0 ), vec3(1.0,  0.0,  0.0 ), vec3(1.0,  0.0,  0.0 ), vec3(1.0,  0.0,  0.0 ), // Right
  vec3(-1.0, 0.0,  0.0 ), vec3(-1.0, 0.0,  0.0 ), vec3(-1.0, 0.0,  0.0 ), vec3(-1.0, 0.0,  0.0 ), // Left
]);

// tex coords for each of the vertices of the cube
const cubeTexCoords = flatten(
[
  vec2( 0.0, 0.0 ), vec2( 1.0, 0.0 ), vec2( 1.0, 1.0 ), vec2( 0.0, 1.0 ), // Front
  vec2( 1.0, 0.0 ), vec2( 1.0, 1.0 ), vec2( 0.0, 1.0 ), vec2( 0.0, 0.0 ), // Back
  vec2( 0.0, 1.0 ), vec2( 0.0, 0.0 ), vec2( 1.0, 0.0 ), vec2( 1.0, 1.0 ), // Top
  vec2( 1.0, 1.0 ), vec2( 0.0, 1.0 ), vec2( 0.0, 0.0 ), vec2( 1.0, 0.0 ), // Bottom
  vec2( 1.0, 0.0 ), vec2( 1.0, 1.0 ), vec2( 0.0, 1.0 ), vec2( 0.0, 0.0 ), // Right
  vec2( 0.0, 0.0 ), vec2( 1.0, 0.0 ), vec2( 1.0, 1.0 ), vec2( 0.0, 1.0 ), // Left
]);

// 6 faces = 6 * 2 triangles = 12 * 3 = 36 indices
const cubeIndices = new Uint16Array(
[
  0,  1,  2,      0,  2,  3,    // front
  4,  5,  6,      4,  6,  7,    // back
  8,  9,  10,     8,  10, 11,   // top
  12, 13, 14,     12, 14, 15,   // bottom
  16, 17, 18,     16, 18, 19,   // right
  20, 21, 22,     20, 22, 23,   // left
]);

// calculate the vertex tangents with the same function used for the other geometric figures
const cubeTangents = calculateTangents( cubeVertices, cubeNormals, cubeTexCoords, cubeIndices );

// cone-related vertex data
var coneVertices = [], coneNormals = [], coneTexCoords = [], coneIndices = [], coneTangents = [];

// cylinder-related vertex data
var cylinderVertices = [], cylinderNormals = [], cylinderTexCoords = [], cylinderIndices = [], cylinderTangents = [];

// sphere-related vertex data
var sphereVertices = [], sphereNormals = [], sphereTexCoords = [], sphereIndices = [], sphereTangents = [];

// the list of all the objects in the scene
var objects = [];

// the index of the currently selected object (hardcoded to 0 for these demos)
const selIdx = 0;

// the amount to add to the rotation around X-axis
var autoRotX = 0;

// these are used to generate obj names such as "Cube 1" and "Sphere 3"
const obj_names  = [ "Cube", "Cone", "Cylinder", "Sphere", "Light" ];

// returns a vec3 color from a hexadecimal string (format '#FFFFFF')
function parseHexColor( colStr )
{
  var fact  = 1.0 / 255;
  var red   = parseInt(colStr.substr(1,2),16) * fact;
  var green = parseInt(colStr.substr(3,2),16) * fact;
  var blue =  parseInt(colStr.substr(5,2),16) * fact;
  return [red, green, blue];
}

// single color to its two-character hex representation
function float2Hex( x ) { var hex = Number(parseInt(x * 255)).toString(16); return (hex.length == 2) ? hex : "0" + hex; }

// inverse of the parseHexColor() function - col is assumed to be vec3 (or vec4 although the 4th comp. is ignored)
function color2Hex( col ) { return "#" + float2Hex(col[0]) + float2Hex(col[1]) + float2Hex(col[2]); }

// return value is the vec3 ( x, y, z ) corresp. to ( radius, theta, phi )
function spherical2cartesian( radius, theta, phi ) { return [ radius * Math.sin(theta) * Math.cos(phi), radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta) ]; }

// available demos
const demos = [ demo_0, demo_1, demo_2 ];

// current demo
var crtDemo = 0;

// mouse rotation
var mouseDown = false, lastMouseX = 0, lastMouseY = 0;  

function handleMouseDown(event)
{
  // store the mouse position
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;

  // set the 'mouseDown' flag so that we can discern in handleMouseMove()
  // a drag operation from a simple movement
  mouseDown = true;
}

function handleMouseUp(event)
{
  // reset the 'mouseDown' flag
  mouseDown = false;
}

function handleMouseMove(event)
{
  // if not in dragging mode
  if (!mouseDown) return;

  // the new mouse position
  var newMouseX = event.clientX, newMouseY = event.clientY;

  // determine the relative mouse movement
  var deltaX = newMouseX - lastMouseX, deltaY = newMouseY - lastMouseY;

  // is there currently a selected object
  if (selIdx >= 0)
  {
    var obj = objects[selIdx];

    var relRotX = deltaY / 10, relRotY = deltaX / 10; // relative rotation around x-, resp. y-axis
    obj.rotate[0] -= relRotX; obj.rotate[1] += relRotY;
    
    obj_updModelMatrix( obj );
  }

  // record the new position
  lastMouseX = newMouseX; lastMouseY = newMouseY;
}

window.onload = function init()
{
  var canvas = document.getElementById( "gl-canvas" );
  
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  gl.viewport( 0, 0, canvas.width, canvas.height );
  aspect = canvas.width / canvas.height;
  
  xformUPel[0] = 1.0 / (canvas.width);
  xformUPel[1] = 1.0 / (canvas.height);
  
  var v = new Float32Array(8);
  v[0] = -1; v[1] = 1; v[2] = -1; v[3] = -1;
  v[4] = 1;  v[5] = 1; v[6] =  1; v[7] = -1;
  compVertices = v;
  
  gl.clearColor( sceneColor[0], sceneColor[1], sceneColor[2], 1.0 );
  
  // enable depth testing (no multipass so gl.LESS should be okay)
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); //gl.depthFunc(gl.LEQUAL);

  comptex_prog  = initShaders( gl, "comptex_vs", "comptex_fs" );
  compVPosLoc   = gl.getAttribLocation( comptex_prog, "vPosition" );
  compParamsLoc = gl.getUniformLocation( comptex_prog, "uParams" );
  compSCorrLoc  = gl.getUniformLocation( comptex_prog, "SCorr" );
  compModeLoc   = gl.getUniformLocation( comptex_prog, "mode" );
  
  xformtex_prog = initShaders( gl, "xformtex_vs", "xformtex_fs" );
  xformVPosLoc  = gl.getAttribLocation( xformtex_prog, "vPosition" );
  xformTex0Loc  = gl.getUniformLocation( xformtex_prog, "Tex0" );
  xformUPelLoc  = gl.getUniformLocation( xformtex_prog, "uPel" );
  
  // create two off-screen framebuffers (the first to compute the image into
  // and the second to compute the spherical mapping of the first image)
  for (var i = 0; i != 2; ++i)
  {
    rttFBO.push( newRTTFramebuffer( 512, 512, false, false ) );
  }

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // create the vertex buffer (vec4 entries)
  vertexBuffer = gl.createBuffer(); gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.DYNAMIC_DRAW);

  // each vertex will get the value of the attribute 'vNormal' from the vertexBuffer
  vPositionLoc = gl.getAttribLocation( program, "vPosition" ); // 4D vertices so 4*4=16 bytes each
  gl.vertexAttribPointer( vPositionLoc, 4, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vPositionLoc );
  
  /////////////////////////////////////////////////////////////////////////////////////////////////
  // create the normal buffer (this will store the normal-to-surface vectors) (vec3 entries)
  normalBuffer = gl.createBuffer(); gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, 12 * maxNumVertices, gl.DYNAMIC_DRAW);

  // each vertex will get the value of the attribute 'vNormal' from the normalBuffer
  vNormalLoc = gl.getAttribLocation( program, "vNormal" ); // 3D vertices so 3*4=12 bytes each
  gl.vertexAttribPointer( vNormalLoc, 3, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vNormalLoc );

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // create the tangent buffer (vec4 entries)
  tangentBuffer = gl.createBuffer(); gl.bindBuffer( gl.ARRAY_BUFFER, tangentBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.DYNAMIC_DRAW);

  // each vertex will get the value of the attribute 'vTangent' from the tangentBuffer
  vTangentLoc = gl.getAttribLocation( program, "vTangent" ); // 4D vertices so 4*4=16 bytes each
  gl.vertexAttribPointer( vTangentLoc, 4, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vTangentLoc );
  
  /////////////////////////////////////////////////////////////////////////////////////////////////
  // create the texture coordinates buffer (this will store 2D texture coords) (vec2 entries)
  texCoordsBuffer = gl.createBuffer(); gl.bindBuffer( gl.ARRAY_BUFFER, texCoordsBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.DYNAMIC_DRAW);
  
  // each vertex will get the value of the attribute 'vTexCoord' from the normalBuffer
  vTexCoordLoc = gl.getAttribLocation( program, "vTexCoord" ); // 2D vertices so 2*4=8 bytes each
  gl.vertexAttribPointer( vTexCoordLoc, 2, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vTexCoordLoc );
    
  /////////////////////////////////////////////////////////////////////////////////////////////////
  // array element (index) buffer
  indexBuffer = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 2 * maxNumVertices, gl.DYNAMIC_DRAW);

  // get the uniforms' locations
  modelViewMatrixLoc  = gl.getUniformLocation( program, "modelViewMatrix" );
  projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
  normalsMatrixLoc    = gl.getUniformLocation( program, "normalsMatrix" );

  flagsLoc        = gl.getUniformLocation( program, "flags" );
  solidColorLoc   = gl.getUniformLocation( program, "solidColor" );
  lightPos0Loc    = gl.getUniformLocation( program, "lightPos0" );
  lightAmb0Loc    = gl.getUniformLocation( program, "lightAmb0" );
  lightDiff0Loc   = gl.getUniformLocation( program, "lightDiff0" );
  lightSpec0Loc   = gl.getUniformLocation( program, "lightSpec0" );
  matShininessLoc = gl.getUniformLocation( program, "matShininess" );
  
  // hardcode the sampler uniforms to the first 4 tex units
  gl.uniform1i( gl.getUniformLocation( program, "Tex0"   ), 0 );
  gl.uniform1i( gl.getUniformLocation( program, "EnvTex" ), 1 );
  gl.uniform1i( gl.getUniformLocation( program, "NormMap"), 2 );
  gl.uniform1i( gl.getUniformLocation( program, "SpecMap"), 3 );
  
  // set-up the view and projection matrices
  gbl_updViewMatrix(); gbl_updProjectionMatrix();
  
  canvas.onmousedown   = handleMouseDown;
  document.onmouseup   = handleMouseUp;
  document.onmousemove = handleMouseMove;  

//  const TEX_SIZE = 512, NUM_CHECKS = 16;
//  var img = makeCheckerboxImage( TEX_SIZE, NUM_CHECKS, [0,0,1,1], [1,1,1,1] );
//  img = spherical_correction(img, TEX_SIZE, TEX_SIZE);
//  set2DTexture( makeGLTexture( img, TEX_SIZE, TEX_SIZE ), 0 );

  demos[crtDemo]();
  
  document.getElementById("NextDemo").onclick = function(){ demos[++crtDemo % demos.length]() };  
  document.getElementById("ToggleRot").onclick = function(){ autoRotX = 0.5 - autoRotX; };
  
  tick();
}

// TODO: change to false when deploying on codepen.io
const local = false;

// see here for other textures: http://ktmpower.imgur.com/all/
const URLs = {
  EARTH_TEX:  (local ? 'earthmap1k.jpg'  : 'http://i.imgur.com/n0QcbBy.jpg'),
  EARTH_BUMP: (local ? 'earthbump1k.jpg' : 'http://i.imgur.com/pXfLR6T.jpg'),
  EARTH_NORM: (local ? 'earthnorm1k.jpg' : 'http://i.imgur.com/TFyvAus.jpg'),
  EARTH_SPEC: (local ? 'earthspec1k.jpg' : 'http://i.imgur.com/JPMhdcg.jpg'),
  SKY_ENV   : (local ? 'sky_map.jpg'     : 'http://i.imgur.com/3onoPEj.jpg'),
  GALAXY_ENV: (local ? 'galaxy.jpg'      : 'http://i.imgur.com/RXA14OX.jpg'),
  METAL1_TEX: (local ? 'metal1.jpg'      : 'http://i.imgur.com/kivTwfy.jpg'),
  STUCCO_TEX: (local ? 'stucco.jpg'      : 'http://i.imgur.com/2xdEGkp.jpg'),
  FLOWER_NORM:(local ? 'flowernorm.jpg'  : 'http://i.imgur.com/OK3kYnj.jpg'),
};

function demo_0()
{
  document.getElementById("demoDesc").innerHTML = "Lighting w/ normal mapping with dynamically generated texture and normal map (render-to-texture)";
  document.getElementById("ToggleRot").hidden = true;
  
  // no rotation for this
  autoRotX = 0;
  
  // clear the object list up-front (so nothing will show up until the new demo is ready)
  objects = [];

  init_sphere_model();

  update_dynamic_texture();
  
  // create a new sphere object
  var obj = createNewObject( OBJ_T.SPHERE, false );
  
  // TODO: rotate it? change other attributes?
  obj.rotate = vec3(170,0,0); obj.shininess = 0.5;
  obj_updModelMatrix( obj );
  
  // set the shader flags to appropriate values for this demo
  TEXTURING   = true;
  LIGHTING    = true;
  NORMMAPPING = true;
  ENVMAPPING  = false;
  SPECMAPPING = false;
  
  // pass the current flags to the shaders
  setFlagsUniforms();
  
  // set the callback to update the model
  updateModel = update_demo_0;
  
  // okay, ready for rendering...
  objects.push( obj );
}

function update_demo_0()
{
//  var obj = objects[0];
//  obj.rotate[1] += 1; if (obj.rotate[1] >= 360) obj.rotate[1] -= 360;
//  obj_updModelMatrix( obj );
  update_dynamic_texture();
}

function demo_1()
{
  document.getElementById("demoDesc").innerHTML = "Lighting, normal and specular mapping with static textures";
  document.getElementById("ToggleRot").hidden = false;

  // this starts with auto rotation
  autoRotX = 0.5;
  
  // clear the object list up-front (so nothing will show up until the new demo is ready)
  objects = [];
  
  // load the needed resources
  loadTextureImage( URLs.EARTH_TEX );
  loadBumpMapImage( URLs.EARTH_BUMP );
  loadSpecMapImage( URLs.EARTH_SPEC );

  init_sphere_model();
 
  // create a new sphere object
  var obj = createNewObject( OBJ_T.SPHERE, false );
  
  // TODO: rotate it? change other attributes?
  obj.rotate = vec3(170,0,0); obj.shininess = 0.5;
  obj_updModelMatrix( obj );
  
  // set the shader flags to appropriate values for this demo
  TEXTURING   = true;
  LIGHTING    = true;
  NORMMAPPING = true;
  ENVMAPPING  = false;
  SPECMAPPING = true; 
  
  // pass the current flags to the shaders
  setFlagsUniforms();
  
  // set the callback to update the model
  updateModel = update_demo_1;
  
  // okay, ready for rendering...
  objects.push( obj );
}

function update_demo_1()
{
  var obj = objects[0];
  obj.rotate[1] += autoRotX; if (obj.rotate[1] >= 360) obj.rotate[1] -= 360;
  obj_updModelMatrix( obj );
}

function demo_2()
{
  document.getElementById("demoDesc").innerHTML = "Lighting, normal, specular and environment mapping with static textures";
  document.getElementById("ToggleRot").hidden = false;

  // this starts with auto rotation
  autoRotX = 0.5;
  
  // clear the object list up-front (so nothing will show up until the new demo is ready)
  objects = [];
  
  // load the needed resources
  loadTextureImage( URLs.EARTH_TEX );
  loadBumpMapImage( URLs.EARTH_BUMP );  
  loadEnvMapImage ( URLs.SKY_ENV    );
  loadSpecMapImage( URLs.EARTH_SPEC );

  init_sphere_model();
  
  // create a new sphere object
  var obj = createNewObject( OBJ_T.SPHERE, false );
  
  // TODO: rotate it? change other attributes?
  obj.rotate = vec3(170,0,0); obj.shininess = 0.5;
  obj_updModelMatrix( obj );
  
  // set the shader flags to appropriate values for this demo
  TEXTURING   = true;
  LIGHTING    = true;
  NORMMAPPING = true;
  ENVMAPPING  = true;
  SPECMAPPING = true; 
  
  // pass the current flags to the shaders
  setFlagsUniforms();
  
  // set the callback to update the model
  updateModel = update_demo_2;
  
  // okay, ready for rendering...
  objects.push( obj );  
}

function update_demo_2()
{
  var obj = objects[0];
  obj.rotate[1] += autoRotX; if (obj.rotate[1] >= 360) obj.rotate[1] -= 360;
  obj_updModelMatrix( obj );
}

// called when either the model matrix was changed (the object was transformed somehow)
// or the view position/angle changed (the view matrix was changed)
function obj_updModelViewMatrix( obj )
{
  // combine the transformations to form the modelViewMatrix for this object
  obj.modelViewMatrix = mult( viewMatrix, obj.modelMatrix );

  // compute the transformation matrix to be applied to the normal vectors
  obj.normalsMatrix = transpose_inverse3( obj.modelViewMatrix );  
}

// updates the model matrix for the current object (from the scale, rotate and translate attributes)
function obj_updModelMatrix ( obj )
{
  // scale by the same factor in all dimensions
  const scaleMatrix     = scale3( obj.scale );
  const rotateMatrix    = rotate3( obj.rotate );
  const translateMatrix = translate3( obj.translate );
  
  obj.modelMatrix = mult( translateMatrix, mult( rotateMatrix, scaleMatrix) );

  // update the matrices dependent on the model matrix
  obj_updModelViewMatrix( obj );  
}

// updates the global ViewMatrix (when the camera position or the 'at', 'up' vectors change)
function gbl_updViewMatrix()
{
  // compute the view matrix (based on the position of the camera, where it looks at and the up vector)
  viewMatrix = lookAt( spherical2cartesian( radius, theta, phi ), at, up );
  
  // go through all objects and update their matrices that are dependent on the view matrix
  for (var obj of objects) obj_updModelViewMatrix( obj );
}

// updates the global ProjectionMatrix (if field-of-view angle or the viewport aspect changes)
function gbl_updProjectionMatrix()
{
  // use perspective projection
  projectionMatrix = perspective ( fovy, aspect, persp_near, persp_far );

  // pass it also to WebGL here
  gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
}

// send the light attributes (the position is 
function setLightingUniforms()
{
  // the light position is converted to view coordinates
  const light0PosView = matXvec3(viewMatrix, light0PosWorld);

  // set the light information to the GPU
  gl.uniform3fv(lightPos0Loc,  flatten(light0PosView));
  gl.uniform3fv(lightAmb0Loc,  flatten(light0AmbCol));
  gl.uniform3fv(lightDiff0Loc, flatten(light0DiffCol));
  gl.uniform3fv(lightSpec0Loc, flatten(light0SpecCol));
}

// used to modify the flags to the WebGL shaders
function setFlagsUniforms()
{
  var flags = new Int32Array( 5 );
  
  flags[0] = TEXTURING;
  flags[1] = LIGHTING;
  flags[2] = NORMMAPPING;
  flags[3] = ENVMAPPING;
  flags[4] = SPECMAPPING; 
  
  gl.uniform1iv(flagsLoc, flags);
}

function loadTextureImage ( image_url, sphere_corr )
{
  var img = new Image(); img.crossOrigin = ''; img.src = image_url;
  img.onload = function() { newTexImageLoaded( img, sphere_corr, false, 0 ); }
}

function loadEnvMapImage ( image_url )
{
  var img = new Image(); img.crossOrigin = ''; img.src = image_url;
  img.onload = function() { newCubemapLoaded( img ); }
}

function loadBumpMapImage ( image_url )
{
  var img = new Image(); img.crossOrigin = ''; img.src = image_url;
  img.onload = function() { newTexImageLoaded( img, false, true, 2 ); }
}

function loadNormalMapImage ( image_url )
{
  var img = new Image(); img.crossOrigin = ''; img.src = image_url;
  img.onload = function() { newTexImageLoaded( img, false, false, 2 ); }
}

function loadSpecMapImage ( image_url )
{
  var img = new Image(); img.crossOrigin = ''; img.src = image_url;
  img.onload = function() { newTexImageLoaded( img, false, false, 3 ); }
}

function newTexImageLoaded ( img, sp_corr, bump2norm, unit )
{
  // create an off-screen canvas object (of the same size as the image)
  var canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  
  // get the handle to its 2d context
  var ctx = canvas.getContext('2d');
  
  // draw the image on the canvas
  ctx.drawImage(img, 0, 0);
  
  // get the image data in RGBA format
  var img_data = new Uint8Array(ctx.getImageData( 0, 0, img.width, img.height ).data.buffer);
  
  // this step is optional (can be used for mapping a regular texture onto a sphere)
  if (sp_corr)
  {
    img_data = spherical_correction( img_data, img.width, img.height );
  }

  // if a bump map image that should be converted to a normal map
  if (bump2norm)
  {
    img_data = normalMapFromBumpMap( img_data, img.width, img.height );
  }
  
  // 'cast' the Uint8ClampedArray returned to a plain Uint8Array needed by the texImage2D() function...
  var texture = makeGLTexture( img_data, img.width, img.height );
  
  // set the input texture as the GL texture 'unit'
  gl.activeTexture( gl.TEXTURE0 + unit );
  gl.bindTexture  ( gl.TEXTURE_2D, texture );
}

// called when an image representing a cubemap texture was loaded
function newCubemapLoaded ( img )
{
  if ( img.width * 3 != img.height * 4 )
  {
    alert('The cube map is not a 4:3 (width : height) format image\n'); return;
  }
  const tex_size = img.width / 4.0;
  if ( !isPowerOf2(tex_size) )
  {
    alert('The size of the cube sides is not a power of 2\n'); return;
  }
  
  // create an off-screen canvas object (of the size of a cube side)
  var canvas = document.createElement('canvas');
  canvas.width = tex_size; canvas.height = tex_size;
  
  // get the handle to its 2d context
  var ctx = canvas.getContext('2d');
  
  // the GL target names for the sides of the cube texture
  const sideName = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // swap pos-y with neg-y b/c of the UNPACK_FLIP_Y_WEBGL flag used below
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
  ];
  // the position of each cube side inside the big image
  const sideRow = [ 1, 1, 0, 2, 1, 1 ];
  const sideCol = [ 2, 0, 1, 1, 1, 3 ];
  
  // create a GL texture to be used as the cube map texture
  var texture = gl.createTexture();
  
  // set it as the current GL texture for texture unit #1
  gl.activeTexture( gl.TEXTURE1 );
  gl.bindTexture( gl.TEXTURE_CUBE_MAP, texture );
  
  // flip the Y coordinate (top-down to bottom-up) b/c the images usually have the origin
  // in the top-left corner while GL considers it to be the lower-left corner
  gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true ); // TODO: needed in this case ?
  
  // for each side
  for ( var i = 0; i != 6; ++i )
  {
    // draw the side image on the canvas
    ctx.drawImage(img, sideCol[i] * tex_size, sideRow[i] * tex_size,
                  tex_size, tex_size, 0, 0, tex_size, tex_size);
                  
    // get the side data in RGBA format
    var side_data = new Uint8Array(ctx.getImageData( 0, 0, tex_size, tex_size ).data.buffer);

    // upload the data to the corresponding GL cube side
    gl.texImage2D( sideName[i], 0 /*level*/, gl.RGBA, tex_size, tex_size,
                   0 /* border */, gl.RGBA, gl.UNSIGNED_BYTE, side_data );
  }
  
  // generate the mipmap for the cube texture
  gl.generateMipmap( gl.TEXTURE_CUBE_MAP );
  
  // choose a filtering quality (pick the best one in general for now)
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,
                    //gl.NEAREST_MIPMAP_NEAREST); // choose the best mip, then pick one pixel from that mip
                    //gl.LINEAR_MIPMAP_NEAREST ); // choose the best mip, then blend 4 pixels from that mip
                    gl.NEAREST_MIPMAP_LINEAR ); // choose the best 2 mips, choose 1 pixel from each, blend them
                    //gl.LINEAR_MIPMAP_LINEAR  ); // choose the best 2 mips. choose 4 pixels from each, blend them
  gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    
  // no coordinates wrap       
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  // the cube map texture remains bound to texunit #1
//  gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );
}

function tick()
{
  window.requestAnimFrame(tick);
  render_scene();
}

function matXvec3( m, v )
{
  const v0 = v[0], v1 = v[1], v2 = v[2], m0 = m[0], m1 = m[1], m2 = m[2];
  return [ m0[0] * v0 + m0[1] * v1 + m0[2] * v2,
           m1[0] * v0 + m1[1] * v1 + m1[2] * v2,
           m2[0] * v0 + m2[1] * v1 + m2[2] * v2 ];
}

function scale3( sV )
{
    var result = mat4();
    
    result[0][0] = sV[0];
    result[1][1] = sV[1];
    result[2][2] = sV[2];

    return result;
}

function rotate3( rV )
{
  return mult( rotateX(rV[0]), mult( rotateY(rV[1]), rotateZ(rV[2]) ) );
}

function translate3( tV )
{
  var result = mat4();

  result[0][3] = tV[0];
  result[1][3] = tV[1];
  result[2][3] = tV[2];

  return result;
}

// creates a new "object" with the specified type
function createNewObject( obj_type, update )
{
  var obj = {
    type       : obj_type,
    solidColor : [0.2,0.7,0.5],
    shininess  : 0.5,
    scale      : [1,1,1],
    rotate     : [0,0,0],               // in degrees
    translate  : [0,0,0],
  };

  // make sure the object matrices are computed before returning
  if ( update ) obj_updModelMatrix( obj );
  return obj;
}

function render_cube( obj, first )
{
  // optimization: only the first obj in a sequence sends vertex data to the GPU
  if ( first )
  {
    // send the vertex data to the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cubeVertices );

    // the normals data
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cubeNormals );

    // the tangent data
    gl.bindBuffer( gl.ARRAY_BUFFER, tangentBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cubeTangents );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, texCoordsBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cubeTexCoords );
    
    // and finally the indices  
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, cubeIndices );
  }
 
  // pass the material attributes to the shader code
  gl.uniform3fv(solidColorLoc,   flatten(obj.solidColor));
  gl.uniform1f (matShininessLoc, obj.shininess);

  // draw all the cube triangles with a single drawElements() call
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}

// computes the un-normalized normal (vec3) at vertex A (perpendicular on plane formed by A->C and A->B)
// NOTE: the opposite direction is returned if the B and C vertices are swapped
function triangle_normal( A, B, C )
{
  return cross(subtract(C, A), subtract(B, A));
}

// A and B are two points in the same plane with constant y;
// returns the normal/perpedicular to the A->B vector in the same plane (as a vec3)
function const_y_normal( A, B )
{
  if ( !Array.isArray(A) || A.length < 3 || !Array.isArray(B) || B.length < 3 ) {
    throw "const_y_normal(): params must be vec3 or vec4";
  }

  if ( A[1] != B[1] ) {
    throw "const_y_normal(): A and B don't have the same y-coordinate";
  }
  
  // determine the displacement on x- and z- coordinates
  const dx = B[0] - A[0], dz = B[2] - A[2];
  
  // the two (opposite directions) normals to a 2D vector (dx,dy) are
  // (-dy,dx) and (dy,-dx)
  return [-dz, 0, dx];
}

const coneLat  = 8;  // how many vertical slices
const coneLong = 64; // how many divisions around each circle section

function init_cone_model()
{
  // if the model was already initialized, return
  if (coneTangents.length > 0) return;
  
  // top and base center vertices
  const top = vec4(0, 0.5, 0, 1), base_center = vec4(0, -0.5, 0, 1);

  // compute first the base vertices in a temporary array (coneLong + 1 entries)
  var base_vertices = [], base_normals = [], base_texCoords = [];
  for (var lng = 0; lng <= coneLong; ++lng)
  {
    const phi = lng * 2 * Math.PI / coneLong; // 0 <= phi <= 2 * pi
    const x = Math.cos(phi), z = Math.sin(phi);

    // the current vertex
    const p = vec4(x, -0.5, z, 1);
  
    // the two tangents to the cone in this point
    const long_tan = subtract(top, p), lat_tan = const_y_normal(base_center, p);

    // compute the normal to the cone surface as the cross product of the two tangents
    const N = normalize( cross( long_tan, lat_tan ) ); // TODO: need swapping?
  
    base_vertices.push(p);
    base_normals.push(N);
    
    base_texCoords.push(vec2(0.5 + 0.5 * x, 0.5 + 0.5 * z));
  }
  
  // calculate the cone vertices (the intersections of longitude and latitude lines)
  var vertices = [], normals = [], texCoords = [], indices = [];

  // for each section of the code (start at the top and going down the Y coordinate)
  for (var lat = 0; lat <= coneLat; ++lat)
  {
    const rad = lat / coneLat; // factor ranging from 0 to 1 (corresp. to the
                               // radius of circle i.e. of the current code section)
    const y = 0.5 - rad;       // y coordinate will range from 0.5 down to -0.5
    
    for (var lng = 0; lng <= coneLong; ++lng)
    {
      // the current vertex - interpolate from the top vertex to the crt base one
      // using the height ratio as the mix factor
      const p = mix(base_vertices[lng], top, rad);
      
      // the tangent is simply the corresponding one from the base normals
      const N = base_normals[lng];
      
      // add the crt vertex and its normal to the corresp. arrays
      vertices.push(p);
      normals.push(N);
      
      const base_coords = base_texCoords[lng], b0 = base_coords[0] - 0.5, b1 = base_coords[1] - 0.5;
      texCoords.push(vec2(0.5 + rad * b0, 0.5 + rad * b1));
    }
  }
  
  // for each "patch" of the cone surface/hull
  var crtLine = 0, nextLine = coneLong + 1;
  for (var lat = 0; lat != coneLat; ++lat)
  {
    for (var lng = 0; lng != coneLong; ++lng)
    {
      const first = crtLine + lng, second = nextLine + lng;

      // if not degenerated...
      if (lat > 0)
      {
        // vertex indices for the first triangle of the patch
        indices.push(first);
        indices.push(second);
        indices.push(first + 1);
      }

      // same for the second triangle
      indices.push(second);
      indices.push(second + 1);
      indices.push(first + 1);      
    }
    crtLine = nextLine; nextLine += coneLong + 1;
  }

  // this is constant for all the base triangles/vertices
  const base_normal = vec3(0, -1, 0);

  const base_centerCoords = vec2(0.5, 0.5);
  
  // also coneDivs triangles for the cone base (could've been a triangle fan)
  var ind = vertices.length;
  for (var i = 0; i != coneLong; ++i)
  {
    vertices.push( base_center );        normals.push( base_normal ); texCoords.push( base_centerCoords); indices.push(ind++);
    vertices.push( base_vertices[i] );   normals.push( base_normal ); texCoords.push( base_texCoords[i]); indices.push(ind++);
    vertices.push( base_vertices[i+1] ); normals.push( base_normal ); texCoords.push( base_texCoords[i+1]);indices.push(ind++);
  }
  
  // keep only the flattened versions of the arrays
  coneVertices  = flatten(vertices);
  coneNormals   = flatten(normals);
  coneTexCoords = flatten(texCoords);
  coneIndices   = new Uint16Array(indices);
  coneTangents  = calculateTangents( coneVertices, coneNormals, coneTexCoords, coneIndices );
}

function render_cone( obj, first )
{
  // optimization: only the first obj in a sequence sends vertex data to the GPU
  if ( first )
  {
    // send the vertex data to the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, coneVertices );
    
    // then the normal data
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, coneNormals );

    // the tangent data
    gl.bindBuffer( gl.ARRAY_BUFFER, tangentBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, coneTangents );
    
    // and the texture coordinates
    gl.bindBuffer( gl.ARRAY_BUFFER, texCoordsBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, coneTexCoords );
    
    // and finally the indices
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, coneIndices );
  }
  
  // pass the material attributes to the shader code
  gl.uniform3fv(solidColorLoc,   flatten(obj.solidColor));
  gl.uniform1f (matShininessLoc, obj.shininess);

  // draw the triangles for the cone hull + the cone base
  gl.drawElements( gl.TRIANGLES, coneIndices.length/*coneLong * coneLat * 6 + coneLong * 3*/, gl.UNSIGNED_SHORT, 0 );
}

// latitude and longitude divisions (applicable to the cylinder)
const cylLat  = 8;  
const cylLong = 64;

function init_cylinder_model()
{
  // if the model was already initialized, return
  if (cylinderTangents.length > 0) return;
  
  // top and base center vertices
  const top_center = vec4(0, 0.5, 0, 1), base_center = vec4(0, -0.5, 0, 1);

  // compute first the base vertices in a temporary array (coneLong + 1 entries)
  var base_vertices = [], base_normals = [], base_texCoords = [];
  for (var lng = 0; lng <= cylLong; ++lng)
  {
    const phi = lng * 2 * Math.PI / cylLong; // 0 <= phi <= 2 * pi
    const x = Math.cos(phi), z = Math.sin(phi);

    // the current vertex
    const p = vec4(x, -0.5, z, 1);
  
    // the normal is just the vector from the circle origin to this point, normalized
    const N = normalize( vec3 ( subtract (p, base_center) ) );
  
    base_vertices.push(p);
    base_normals.push(N); 
    base_texCoords.push(vec2(0.5 + 0.5 * x, 0.5 + 0.5 * z));
  }

  // generate two sets of vertices, one for the top disc and one for the bottom one
  var vertices = [], normals = [], texCoords = [], indices = [];

  for (var lat = 0; lat <= cylLat; ++lat)
  {
    const y = 0.5 - lat / cylLat; // y in 0.5 down to -0.5
    for (var lng = 0; lng <= cylLong; ++lng)
    {
      const q = base_vertices[lng];
      
      vertices.push( vec4(q[0], y, q[2], 1) );
      normals.push( base_normals[lng] );
      texCoords.push( vec2(Math.PI * lng / cylLong, y + 0.5) );
    }
  }
  
  // generate the indices for the triangles forming the cylinder hull
  var crtLine = 0, nextLine = cylLong + 1;
  for (var lat = 0; lat != cylLat; ++lat)
  {
    for (var lng = 0; lng != cylLong; ++lng)
    {
      const first = crtLine + lng, second = nextLine + lng;
      
      // vertex indices for the first triangle of the patch
      indices.push(first);
      indices.push(second);
      indices.push(first + 1);

      // same for the second triangle
      indices.push(second);
      indices.push(second + 1);
      indices.push(first + 1);      
    }
    crtLine = nextLine; nextLine += cylLong + 1;
  }  
  
  // also coneDivs triangles for the cone base (could've been a triangle fan)
  var ind = vertices.length, line = 0;
  
  const base_centerCoords = vec2(0.5, 0.5);
  for (var y = 0.5; y >= -0.5; y -= 1.0)
  {
    const center = vec4(0, y, 0, 1), normal = vec3(0, 2 * y, 0); // = normalize(vec3(center));
    for (var i = 0; i != cylLong; ++i)
    {
      const j = i + line;
      vertices.push( center );        normals.push( normal ); texCoords.push( base_centerCoords ); indices.push(ind++);
      vertices.push( vertices[j] );   normals.push( normal ); texCoords.push( base_texCoords[i] ); indices.push(ind++);
      vertices.push( vertices[j+1] ); normals.push( normal ); texCoords.push( base_texCoords[i+1] );indices.push(ind++);
    }  
    line = (cylLong + 1) * cylLat; // update line offset for the bottom disc
  }
 
  // keep only the flattened version of the vertex data
  cylinderVertices  = flatten( vertices );
  cylinderNormals   = flatten( normals );
  cylinderTexCoords = flatten( texCoords );
  cylinderIndices   = new Uint16Array (indices);
  cylinderTangents  = calculateTangents( cylinderVertices, cylinderNormals, cylinderTexCoords, cylinderIndices );
}

function render_cylinder( obj, first )
{
  // optimization: only the first obj in a sequence sends vertex data to the GPU
  if ( first )
  {
    // send the vertex data to the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cylinderVertices );

    // then the normal data
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cylinderNormals );
    
    // the tangent data
    gl.bindBuffer( gl.ARRAY_BUFFER, tangentBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cylinderTangents );
    
    // and the texture coordinates
    gl.bindBuffer( gl.ARRAY_BUFFER, texCoordsBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cylinderTexCoords );

    // and finally the indices  
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, cylinderIndices );
  }
  
  // pass the material attributes to the shader code
  gl.uniform3fv(solidColorLoc,   flatten(obj.solidColor));
  gl.uniform1f (matShininessLoc, obj.shininess);
  
  // draw the triangles for the cylinder hull + the two cylinder bases
  gl.drawElements( gl.TRIANGLES, cylinderIndices.length/*cylLong * (cylLat + 1) * 6*/, gl.UNSIGNED_SHORT, 0 );
}

// maps a (x, y, z) point on the surface of a sphere to a vec2
// (the corresponding texture coordinates) 
function sphere_map( x, y, z )
{
  const invPI = 1.0 / Math.PI;

  const v = Math.acos(y) * invPI;
  const u = Math.acos(x / Math.sin(Math.PI * v)) * 0.5 * invPI;

  return [ ((z > -1.e-10) ? u : (u + 0.5)), v ];
}

//const latBands = 8, longSegs = 16;
const latBands = 24, longSegs = 45;

function init_sphere_model()
{
  // if the model was already initialized, return
  if (sphereTangents.length > 0) return;
  
  var vertices = [], normals = [], texCoords = [], indices = [];
  
  for (var lat = 0; lat <= latBands; ++lat)
  {
    const v     = lat / latBands; // also used as the vertical texture coordinate
    const theta = v * Math.PI;    // 0 <= theta <= pi
    
    const y  = Math.cos(theta);   // y = cos(theta) - constant per latitude "slice"
    const st = Math.sin(theta);   // this will det. the radius of the latitude line
    
    for (var lng = 0; lng <= longSegs; ++lng)
    {
      const u   = lng / longSegs; // also used as the horizontal texture coordinate
      const phi = (lng / longSegs) * 2.0 * Math.PI; // 0 <= phi <= 2 * pi
      
      const x = st * Math.cos(phi); // x = sin(theta) * cos(phi)
      const z = st * Math.sin(phi); // z = sin(theta) * sin(phi)
      
      vertices.push( vec4(x, y, z, 1) );
      
      // the normals are easy for points on the sphere - there exactly the
      // vectors from the sphere centre to the points themselves
      // (with the length normalized to unit)
      normals.push( normalize(vec3(x, y, z)) );
      
      //console.log('lat='+lat+',lng='+lng+' => u='+tc[0]+', v='+tc[1]+'\n');
      texCoords.push( vec2( u, v) );
    }
  }

  // for each "patch" of the sphere surface
  var crtLine = 0, nextLine = longSegs + 1;
  for (var lat = 0; lat < latBands; ++lat)
  {
    for (var lng = 0; lng < longSegs; ++lng)
    {
      const first = crtLine + lng, second = nextLine + lng;
      
      // watch out for degenerate triangles
      if (lat > 0)
      {
        // vertex indices for the first triangle of the patch
        indices.push(first);
        indices.push(second);
        indices.push(first + 1);
      }

      // watch out for degenerate triangles
      if (lat + 1 < latBands)
      {
        // same for the second triangle
        indices.push(second);
        indices.push(second + 1);
        indices.push(first + 1);
      }      
    }
    crtLine = nextLine; nextLine += longSegs + 1;
  }

  // keep only the flattened version of the vertex data
  sphereVertices  = flatten( vertices ); 
  sphereNormals   = flatten( normals );
  sphereTexCoords = flatten( texCoords ); 
  sphereIndices   = new Uint16Array ( indices );  
  sphereTangents  = calculateTangents( sphereVertices, sphereNormals, sphereTexCoords, sphereIndices );
}

function render_sphere( obj, first )
{
  // optimization: only the first obj in a sequence sends vertex data to the GPU
  if ( first )
  {
    // send the vertex data to the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, sphereVertices );
    
    // then the normal data
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, sphereNormals );

    // the tangent data
    gl.bindBuffer( gl.ARRAY_BUFFER, tangentBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, sphereTangents );
    
    // then the texture coordinates
    gl.bindBuffer( gl.ARRAY_BUFFER, texCoordsBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, sphereTexCoords );
    
    // and finally the indices
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, sphereIndices );
  }
  
  // pass the material attributes to the shader code
  gl.uniform3fv(solidColorLoc,   flatten(obj.solidColor));
  gl.uniform1f (matShininessLoc, obj.shininess);
  
  // draw the solid triangles
  gl.drawElements( gl.TRIANGLES, sphereIndices.length/*latBands * longSegs * 6*/, gl.UNSIGNED_SHORT, 0 );
}

// computes the normal matrix from the model view one
// (transpose of the inverse of the 3x3 top-left submatrix)
function transpose_inverse3( m )
{
  // the input should be at least a 3x3 matrix
  // (if larger, only the 3x3 top-left elements are used)
  if ( !m.matrix || m.length < 3 || m[0].length < 3)
    return "inverse3(): input is not (at least) a 3x3 matrix";

  const m0 = m[0], m00 = m0[0], m01 = m0[1], m02 = m0[2];
  const m1 = m[1], m10 = m1[0], m11 = m1[1], m12 = m1[2];
  const m2 = m[2], m20 = m2[0], m21 = m2[1], m22 = m2[2];
  
  // compute its determinant
  const det = m00 * (m11 * m22 - m12 * m21) -
              m01 * (m10 * m22 - m12 * m20) +
              m02 * (m10 * m21 - m11 * m20);
  if (!det) return "singular input matrix";
  
  // the reciprocal of the determinant value
  const f = 1.0 / det;

  // then the transpose inverse matrix 
  var m = [
    [(m11 * m22 - m12 * m21) * f, (m12 * m20 - m10 * m22) * f, (m10 * m21 - m11 * m20) * f ],
    [(m02 * m21 - m01 * m22) * f, (m00 * m22 - m02 * m20) * f, (m01 * m20 - m00 * m21) * f ],
    [(m01 * m12 - m02 * m11) * f, (m02 * m10 - m00 * m12) * f, (m00 * m11 - m01 * m10) * f ]   
  ];
 
  m.matrix = true;
  return m;
}

function render_sequence( sequence, render_fn )
{
  // start with the 'first' flag set
  var first = true;

  // for each of the objects in the sequence
  for (var o of sequence)
  {
    // send the model view matrix to the GPU
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten( o.modelViewMatrix ) );

    // also send the normal matrix
    gl.uniformMatrix3fv( normalsMatrixLoc, false, flatten( o.normalsMatrix ) );
    
    // then let the object draw itself (depending on its type)
    render_fn( o, first );
    
    // reset the 'first' flag
    first = false;
  }
}

// object rendering functions
var render_fns = [ render_cube, render_cone, render_cylinder, render_sphere ];

function render_scene()
{
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  // make sure the light is set-up ok (not the best thing to do but an acceptable
  // compromise that allows for a changeable view position)
  setLightingUniforms();
  
  // separate the different types of objects based on their type
  // (this could be done when adding/creating the items but anyway...)
  var sequences = [ [], [], [], [] ];

  // put each of the scene objects in the corresponding bin
  for (var o of objects) sequences[o.type].push( o );
  
  // then render the sequences
  for (var t = OBJ_T.CUBE; t <= OBJ_T.SPHERE; ++t)
  {
    render_sequence( sequences[t], render_fns[t] );
  }
  
  // call the current function that will update the model to render
  updateModel();
}

function isPowerOf2(value) { return (value & (value - 1)) == 0; }

// bgCol and fgCol are vec4 colors (in floating point normalized format)
function makeCheckerboxImage( texSize, numChecks, bgCol, fgCol )
{
  var img = new Uint8Array(4*texSize*texSize); // square image, each pel is a 32-bit (4x8-bit) RBGA value
  
  const bg0 = bgCol[0]*255, bg1 = bgCol[1]*255, bg2 = bgCol[2]*255, bg3 = bgCol[3]*255;
  const fg0 = fgCol[0]*255, fg1 = fgCol[1]*255, fg2 = fgCol[2]*255, fg3 = fgCol[3]*255;

  const f = numChecks / texSize;
  for (var y = 0, ofs = 0; y != texSize; ++y)
  {
    const odd_check_row = Math.floor(y * f) % 2;
    for (var x = 0; x != texSize; ++x, ofs += 4)
    {
      const odd_check_column = Math.floor(x * f) % 2;
      
      if (odd_check_row ^ odd_check_column)
      {
        img[ofs  ] = bg0;
        img[ofs+1] = bg1;
        img[ofs+2] = bg2;
        img[ofs+3] = bg3;      
      }
      else
      {
        img[ofs  ] = fg0;
        img[ofs+1] = fg1;
        img[ofs+2] = fg2;
        img[ofs+3] = fg3;
      }
    }
  }

  img.width  = texSize;
  img.height = texSize;
  
  // return the array holding the checkerbox image data
  return img;
}

// transforms a regular texture into a direct polar/spherical texture
// (i.e. so that it can be used to texture a sphere using latitude/longitude coordinates)
// hmm... this could be quite easily be done as a GLSL program B-)
function spherical_correction ( src, width, height )
{
  if (!(src instanceof Uint8Array))
    throw "The first parameter is not an Uint8Array";

  // create the array to represent the destination image
  var dst = new Uint8Array(4 * width * height);
  
  const h1 = height - 1, h_mid = 0.5 * h1, inv_h1 = 1.0 / h1;
  const w_mid = (width - 1) * 0.5, stride = 4 * width;
  
  for (var j = 0, line_ofs = 0; j < height; ++j, line_ofs += stride)
  {
    const theta = (j - h_mid) * inv_h1 * Math.PI; // theta is in [-pi/2, pi/2] range
    //const theta = j * inv_h1 * Math.PI;           // theta is in [0, pi] range
    const cos_t = Math.cos(theta);

    for (var i = 0, dofs = line_ofs; i < width; ++i, dofs += 4)
    {
      // sample nearest pel from the source image
      const src_i = Math.round((i - w_mid) * cos_t + w_mid);
      const sofs  = line_ofs + src_i * 4;
      
      // the pels are RGBA => we need to copy 4 bytes from src to dst img
      dst[dofs  ] = src[sofs  ];
      dst[dofs+1] = src[sofs+1];
      dst[dofs+2] = src[sofs+2];
      dst[dofs+3] = src[sofs+3];
    }
  }
  
  return dst;
}

function intensity( img, ofs )
{
  return 0.2989 * img[ofs] + 0.5870 * img[ofs + 1] + 0.1140 * img[ofs + 2];
}

// calculates a normal map from a bump map (the bump map is assumed to be a RGBA
// texture containing a grayscale image i.e. R=G=B values - we don't calculate the
// an intensity value but simply picking one the first component of a pixel to be
// its intensity/bump height)
function normalMapFromBumpMap ( src, width, height )
{
  if (!(src instanceof Uint8Array))
    throw "The first parameter is not an Uint8Array";

  // create the array to represent the destination image
  var dst = new Uint8Array(width * height * 4);
  
  // factor to convert a [0..255] value to a [0,1] one + line stride in bytes
  const f = 4.0/255.0, stride = width * 4;
  
  // for each line of the bump map
  var ofs = 0;
  for (var y = 1; y <= height; ++y)
  {
    const notLastLine = y != height;
    
    // for each pel in the bump map line
    for (var x = 1; x <= width; ++x, ofs += 4)
    {
      // the height of the current pixel and of the next pels in x and y directions
      const h00 = src[ofs];
      const h10 = x != width  ? src[ofs +      4] : h00;
      const h01 = notLastLine ? src[ofs + stride] : h00;
      
      // the un-normalized normal vector (z = 1)
      const nx = (h00 - h10) * f, ny = (h01 - h00) * f;
      
      // normalize factor so that each component value is in [-127,127] range
      const nf127 = 127.0 / Math.sqrt(nx * nx + ny * ny + 1.0);
      
      dst[ofs  ] = nx * nf127 + 128.0;
      dst[ofs+1] = ny * nf127 + 128.0;
      dst[ofs+2] =      nf127 + 128.0;
      dst[ofs+3] = h00; // save the original bump height in the alpha component
//      dst[ofs+3] = 255; // save the original bump height in the alpha component
/*
      const h00 = intensity(src, ofs) * f;
      const h10 = x != width  ? intensity(src, ofs + 4) * f : h00;
      const h01 = notLastLine ? intensity(src, ofs + stride) * f : h00;
      
      const v10 = [1, 0, h10 - h00], v01 = [0, 1, h01 - h00]; 
      
      const N = normalize(cross(v10, v01));
      
      dst[ofs  ] = N[0] * 127.0 + 128.0;
      dst[ofs+1] = N[1] * 127.0 + 128.0;
      dst[ofs+2] = N[2] * 127.0 + 128.0;
      dst[ofs+3] = 255;
*/      
    }
  }
  
  return dst;  
}

// takes a RGBA image as Uint8Array and uses it to create a GL texture
function makeGLTexture( img_data, img_width, img_height )
{
  // use unit #7 for creating new textures (so that we won't unbind useful textures)
  gl.activeTexture( gl.TEXTURE7 );
  
  // create a 2D GL texture
  var texture = gl.createTexture();
  
  // set it as the current GL texture
  gl.bindTexture( gl.TEXTURE_2D, texture );
  
  // flip the Y coordinate (top-down to bottom-up) b/c the images usually have the origin
  // in the top-left corner while GL considers it to be the lower-left corner
  gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );

/*  
  if (!(img_data instanceof Uint8Array))
  {
    // pass the image data to GL (level 0 means the first mipmap - the largest one)
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img_data );
  }
  else
*/
  {
    // pass the image data to GL (level 0 means the first mipmap - the largest one)
    gl.texImage2D( gl.TEXTURE_2D, 0 /*level*/, gl.RGBA, img_width, img_height,
                   0 /* border */, gl.RGBA, gl.UNSIGNED_BYTE, img_data );
  }
  
  // if the image can be mipmapped under WebGL's limitations...
  if ( img_width === img_height && isPowerOf2(img_width) && isPowerOf2(img_height) )
  {
    // do it
    gl.generateMipmap(gl.TEXTURE_2D);
    
    // choose a filtering quality (pick the best one in general for now)
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      //gl.NEAREST_MIPMAP_NEAREST); // choose the best mip, then pick one pixel from that mip
                      //gl.LINEAR_MIPMAP_NEAREST ); // choose the best mip, then blend 4 pixels from that mip
                      gl.NEAREST_MIPMAP_LINEAR ); // choose the best 2 mips, choose 1 pixel from each, blend them
                      //gl.LINEAR_MIPMAP_LINEAR  ); // choose the best 2 mips. choose 4 pixels from each, blend them
                      
    // wrap texture coordinates 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  }
  else
  {
     // WebGL does not support repeating textures with dimensions not powers of 2
     // but can use them in clamp mode
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
     // also no mipmaps for non-powers-of 2 textures, so just set the minification filter to linear
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  // always use bilinear filtering when magnifying
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
  //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
  
  gl.bindTexture( gl.TEXTURE_2D, null );
  
  // return the texture object
  return texture;
}

/*
generateNormalAndTangent(float3 v1, float3 v2, text2 st1, text2 st2)
	{
		float3 normal = v1.crossProduct(v2);
		
		float coef = 1/ (st1.u * st2.v - st2.u * st1.v);
		float3 tangent;

		tangent.x = coef * ((v1.x * st2.v)  + (v2.x * -st1.v));
		tangent.y = coef * ((v1.y * st2.v)  + (v2.y * -st1.v));
		tangent.z = coef * ((v1.z * st2.v)  + (v2.z * -st1.v));
		
		float3 binormal = normal.crossProduct(tangent);
	}
*/

// adapted from the C++ code from this link: http://www.terathon.com/code/tangent.html
// "The code below generates a four-component tangent T in which the handedness of the local coordinate system
// is stored as ±1 in the w-coordinate. The bitangent vector B is then given by B = (N × T) · Tw."
function calculateTangents( vertices, normals, texcoords, indices )
{
  const vertexCount = vertices.length / 4; // the vertices are assumed to be flattened vec4s (i.e. 4 floats per vertex)
  
  // the normals and texcoords must correspond to the vertices (although each has 3, resp. 2 floating-point components)
  if ( normals.length !== vertexCount * 3 || texcoords.length !== vertexCount * 2 || !indices.length || indices.length % 3 != 0.0)
    throw "Something's wrongs with the params but I have no time for more detailed messages... :)";

  var tan1 = new Float32Array( normals.length );
  var tan2 = new Float32Array( normals.length );

  // the indices array specifies the triangles forming the object mesh (3 indices per triangle)
  const numIndices = indices.length; 
  
  // for each triangle (step through indices 3 by 3)
  for (var i = 0; i < numIndices; i += 3)
  {
    const i1 = indices[i], i2 = indices[i + 1], i3 = indices[i + 2];
    
    var j = i1 * 4; const v1x = vertices[j], v1y = vertices[j + 1], v1z = vertices[j + 2];
    var j = i2 * 4; const v2x = vertices[j], v2y = vertices[j + 1], v2z = vertices[j + 2];
    var j = i3 * 4; const v3x = vertices[j], v3y = vertices[j + 1], v3z = vertices[j + 2];
     
    const x1 = v2x - v1x, x2 = v3x - v1x;
    const y1 = v2y - v1y, y2 = v3y - v1y;
    const z1 = v2z - v1z, z2 = v3z - v1z;
    
    var j = i1 * 2; const w1x = texcoords[j], w1y = texcoords[j + 1];
    var j = i2 * 2; const w2x = texcoords[j], w2y = texcoords[j + 1];
    var j = i3 * 2; const w3x = texcoords[j], w3y = texcoords[j + 1];
    
    const s1 = w2x - w1x, s2 = w3x - w1x;
    const t1 = w2y - w1y, t2 = w3y - w1y;
      
    const r = 1.0 / (s1 * t2 - s2 * t1);
    
    const sx = (t2 * x1 - t1 * x2) * r, sy = (t2 * y1 - t1 * y2) * r, sz = (t2 * z1 - t1 * z2) * r;
    const tx = (s1 * x2 - s2 * x1) * r, ty = (s1 * y2 - s2 * y1) * r, tz = (s1 * z2 - s2 * z1) * r;

    var j = i1 * 3; tan1[j] += sx; tan1[j + 1] += sy; tan1[j + 2] += sz;
                    tan2[j] += tx; tan2[j + 1] += ty; tan2[j + 2] += tz;
    var j = i2 * 3; tan1[j] += sx; tan1[j + 1] += sy; tan1[j + 2] += sz;
                    tan2[j] += tx; tan2[j + 1] += ty; tan2[j + 2] += tz;
    var j = i3 * 3; tan1[j] += sx; tan1[j + 1] += sy; tan1[j + 2] += sz;
                    tan2[j] += tx; tan2[j + 1] += ty; tan2[j + 2] += tz;
  }
  
  const numVertices = vertices.length;
  var tangents = new Float32Array( numVertices );
    
  for (var i3 = 0, i4 = 0; i4 < numVertices; i3 += 3, i4 += 4)
  {
    // not very efficient here (used the vec3 type and dot/cross operations from MV.js)
    const n  = [ normals[i3], normals[i3 + 1], normals[i3 + 2] ];
    const t1 = [ tan1   [i3], tan1   [i3 + 1], tan1   [i3 + 2] ];
    const t2 = [ tan2   [i3], tan2   [i3 + 1], tan2   [i3 + 2] ];
    
    // Gram-Schmidt orthogonalize
    const tmp  = subtract(t1, scale(dot(n, t1), n));
    const len2 = tmp[0] * tmp[0] + tmp[1] * tmp[1] + tmp[2] * tmp[2];

    // normalize the vector only if non-zero length
    const txyz = (len2 > 0) ? scale(1.0 / Math.sqrt(len2), tmp) : tmp;
   
    // Calculate handedness
    const tw = (dot(cross(n, t1), t2) < 0.0) ? -1.0 : 1.0;

    tangents[i4    ] = txyz[0];
    tangents[i4 + 1] = txyz[1];
    tangents[i4 + 2] = txyz[2];
    tangents[i4 + 3] = tw;
  }
  
  return tangents;
}

// taken from here: http://learningwebgl.com/blog/?p=1786
function newRTTFramebuffer( width, height, depth_buffer, mipmapped )
{
  var rttFramebuffer = gl.createFramebuffer();
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);
  rttFramebuffer.width  = width;
  rttFramebuffer.height = height;

  var rttTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, rttTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);  

  if (mipmapped)
  {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  else
  {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);

  if (depth_buffer)
  {
    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
  }

  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  // return an object containing the two references (to the frame buffer and its texture)
  return { rttFramebuffer: rttFramebuffer, rttTexture : rttTexture };
}

const compLimits = [ [-1,1], [-1,1], [-5, 5], [0, 2*Math.PI] ];
var compParams = new Float32Array(4), compSteps = new Float32Array(4), compInc = new Float32Array(4);

function randVal( min_v, max_v ) { return min_v + (max_v - min_v) * Math.random(); }

function update_comp_tex_params()
{
  for (var i = 0; i != 4; ++i)
  {
    var min_v = compLimits[i][0], max_v = compLimits[i][1];
    if (--compSteps[i] < 0)
    { 
      compSteps[i] = Math.floor(randVal(120, 480));
      compInc[i]   = (max_v - min_v) / randVal(240, 960);
    }
    compParams[i] += compInc[i];
    if (compParams[i] < min_v) { compParams[i] = min_v; compInc[i] = -compInc[i]; }
    if (compParams[i] > max_v) { compParams[i] = max_v; compInc[i] = -compInc[i]; }
  }
}

// will update the dynamic texture using a two-pass off-screen rendering
// (the dynamic texture is bound on unit #0 before returning)
function update_dynamic_texture()
{
  // bind the 1st off-screen framebuffer
  gl.bindFramebuffer( gl.FRAMEBUFFER, rttFBO[0].rttFramebuffer );
  gl.useProgram( comptex_prog );
  
  // put the four extreme points in the vertex buffer
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferSubData( gl.ARRAY_BUFFER, 0, compVertices );

  // update the texture generation params for this iteration
  update_comp_tex_params(); gl.uniform4fv( compParamsLoc, compParams );
  
  // enable/disable the spherical texture correction
  gl.uniform1i( compSCorrLoc, true );
  gl.uniform1i( compModeLoc, false );   
  
  // the "vPosition" attributes will be supplied from the vertex buffer
  gl.vertexAttribPointer( compVPosLoc, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( compVPosLoc );
  
  // issue the draw call that will start the computation of the texture
  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
  
  //////////////////////////////////////////////////////////////////////////////////////
  // ok, now switch to the second off-screen framebuffer
  gl.bindFramebuffer( gl.FRAMEBUFFER, rttFBO[1].rttFramebuffer );
  //gl.useProgram( xformtex_prog );

  gl.uniform1i( compModeLoc, true );   
  
  // set the "Tex0" texture from the fragment shader to the previously rendered texture
  //gl.activeTexture( gl.TEXTURE0 ); gl.bindTexture( gl.TEXTURE_2D, rttFBO[0].rttTexture );
  //gl.uniform1i( xformTex0Loc, 0 );
  //gl.uniform2fv( xformUPelLoc, xformUPel );
  
  // the "vPosition" attributes will be supplied from the vertex buffer
  //gl.vertexAttribPointer( xformVPosLoc, 2, gl.FLOAT, false, 0, 0 );
  //gl.enableVertexAttribArray( xformVPosLoc );

  // then issue another drawing call that copy the texture to canvas
  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  // ok, now switch to the canvas framebuffer
  gl.bindFramebuffer( gl.FRAMEBUFFER, null ); gl.useProgram( program );

  // restore the bindings (necessary?)
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.vertexAttribPointer( vPositionLoc, 4, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vPositionLoc );
  gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
  gl.vertexAttribPointer( vNormalLoc, 3, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vNormalLoc );
  gl.bindBuffer( gl.ARRAY_BUFFER, tangentBuffer );
  gl.vertexAttribPointer( vTangentLoc, 4, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vTangentLoc );
  gl.bindBuffer( gl.ARRAY_BUFFER, texCoordsBuffer );
  gl.vertexAttribPointer( vTexCoordLoc, 2, gl.FLOAT, false, 0, 0 ); gl.enableVertexAttribArray( vTexCoordLoc );

  // set the "Tex0" texture from the fragment shader to the previously rendered texture
  gl.activeTexture( gl.TEXTURE0 ); 
  gl.bindTexture( gl.TEXTURE_2D, rttFBO[0].rttTexture );

  gl.activeTexture( gl.TEXTURE2 ); 
  gl.bindTexture( gl.TEXTURE_2D, rttFBO[1].rttTexture );
}
