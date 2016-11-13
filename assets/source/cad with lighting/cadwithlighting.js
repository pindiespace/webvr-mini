"use strict";

const maxNumVertices = 10000;

var gl;

// each object will use these buffers in turn when it's time to render itself 
var vertexBuffer, normalBuffer, indexBuffer;

// the camera moves on a sphere of the given radius; the two angles
// signify the latitude/longitude coordinates (in radians)
var radius = 6.0;
var theta  = 0.3;
var phi    = 0.5;

// the camera looks at the origin point without tilting
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// orthographic projection
const left   = -2.0;
const right  =  2.0;
const ytop   =  2.0;
const bottom = -2.0;
const near   = -20.0;
const far    =  20.0;

// perspective projection
const fovy = 45;    // degrees
var   aspect = 1.0; // determined dynamically
const persp_near = 0.5;
const persp_far  = 25;

var sceneColor = vec4(0.85,0.85,0.94,1);

// indexes are assumed to be in the 0..100 range
const minScale = 0.05, maxScale = 4;
const minRotate = -180.0, maxRotate = 180.0;
const minTranslate = -4, maxTranslate = 4;
const minRadius = 2, maxRadius = 8;
const minLightRad = 2, maxLightRad = 5;

// locations of the uniform variables in the GLSL code
// -- these are used in the vertex shader
var projectionMatrixLoc, modelViewMatrixLoc, normalsMatrixLoc;

// -- and these in the fragment shader
var lightPosLoc, lightAmbLoc, lightDiffLoc, lightSpecLoc, lightEnabledLoc;
var matAmbientLoc, matDiffuseLoc, matSpecularLoc, matShininessLoc, methodLoc;

// 0 - Phong, 1 - Blinn-Phong, 2 - Gaussian
var method = 0;

// ATTENTION: this should match the N_LIGHTS constant from the fragment shader (I didn't
// know how to use a single definition and haven't had the time to search for a solution)
const MAX_LIGHTS = 8;

// the current number of lights defined is kept in the obj_counts[OBJ_T.LIGHT] counter below
var numLights = 0;

var OBJ_T = {
  CUBE:     0,
  CONE:     1,
  CYLINDER: 2,
  SPHERE:   3,
  LIGHT:    4,
};

// 24 vertices
const cubeVertices = flatten([
  // Front face
  vec4( -0.5, -0.5,  0.5, 1.0 ),
  vec4(  0.5, -0.5,  0.5, 1.0 ),
  vec4(  0.5,  0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  
  // Back face
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5,  0.5, -0.5, 1.0 ),
  vec4(  0.5,  0.5, -0.5, 1.0 ),
  vec4(  0.5, -0.5, -0.5, 1.0 ),
  
  // Top face
  vec4( -0.5,  0.5, -0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  vec4(  0.5,  0.5,  0.5, 1.0 ),
  vec4(  0.5,  0.5, -0.5, 1.0 ),
  
  // Bottom face
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4(  0.5, -0.5, -0.5, 1.0 ),
  vec4(  0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5, -0.5,  0.5, 1.0 ),
  
  // Right face
  vec4(  0.5, -0.5, -0.5, 1.0 ),
  vec4(  0.5,  0.5, -0.5, 1.0 ),
  vec4(  0.5,  0.5,  0.5, 1.0 ),
  vec4(  0.5, -0.5,  0.5, 1.0 ),
  
  // Left face
  vec4( -0.5, -0.5, -0.5, 1.0 ),
  vec4( -0.5, -0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5,  0.5, 1.0 ),
  vec4( -0.5,  0.5, -0.5, 1.0 )
]);

// 24 normals - each vertex has a corresponding normal vector 
const cubeNormals = flatten([
  // Front
  vec3(0.0,  0.0,  1.0 ),
  vec3(0.0,  0.0,  1.0 ),
  vec3(0.0,  0.0,  1.0 ),
  vec3(0.0,  0.0,  1.0 ),
  
  // Back
  vec3(0.0,  0.0, -1.0 ),
  vec3(0.0,  0.0, -1.0 ),
  vec3(0.0,  0.0, -1.0 ),
  vec3(0.0,  0.0, -1.0 ),
  
  // Top
  vec3(0.0,  1.0,  0.0 ),
  vec3(0.0,  1.0,  0.0 ),
  vec3(0.0,  1.0,  0.0 ),
  vec3(0.0,  1.0,  0.0 ),
  
  // Bottom
  vec3(0.0, -1.0,  0.0 ),
  vec3(0.0, -1.0,  0.0 ),
  vec3(0.0, -1.0,  0.0 ),
  vec3(0.0, -1.0,  0.0 ),
  
  // Right
  vec3(1.0,  0.0,  0.0 ),
  vec3(1.0,  0.0,  0.0 ),
  vec3(1.0,  0.0,  0.0 ),
  vec3(1.0,  0.0,  0.0 ),
  
  // Left
  vec3(-1.0, 0.0,  0.0 ),
  vec3(-1.0, 0.0,  0.0 ),
  vec3(-1.0, 0.0,  0.0 ),
  vec3(-1.0, 0.0,  0.0 ),
]);

// 6 faces = 6 * 2 triangles = 12 * 3 = 36 indices
const cubeIndices = new Uint16Array ([
  0,  1,  2,      0,  2,  3,    // front
  4,  5,  6,      4,  6,  7,    // back
  8,  9,  10,     8,  10, 11,   // top
  12, 13, 14,     12, 14, 15,   // bottom
  16, 17, 18,     16, 18, 19,   // right
  20, 21, 22,     20, 22, 23,   // left
]);

// 6*'longDivs' vertices i.e. 2*'longDivs' triangles + normals corresponding 1:1 to the coneVertices 
var coneVertices = [];
var coneNormals  = [];
var coneIndices  = [];

// cylinder-related vertex data
var cylinderVertices = [];
var cylinderNormals  = [];
var cylinderIndices  = [];

// sphere-related vertex data
var sphereVertices = [];
var sphereNormals  = [];
var sphereIndices  = [];

// the list of all the objects in the scene
var objects = [];

// index of the selected/current object (in the list of objects and in the GUI drop-down list)
var selIdx = -1;

// these are used to generate obj names such as "Cube 1" and "Sphere 3"
const obj_names  = [ "Cube", "Cone", "Cylinder", "Sphere", "Light" ];
var   obj_counts = [ 0, 0, 0, 0, 0 ];

var dradius = 0.025;

function mat4to3( a )
{
  // verify that the input is a 4x4 matrix
  if ( !a.matrix || a.length != 4 || a[0].length != 4)
    return "mat4_top(): input is not a 4x4 matrix";
    
  // extract the 3x3 top-left matrix
  var m = [
    [ a[0][0], a[0][1], a[0][2] ],
    [ a[1][0], a[1][1], a[1][2] ],
    [ a[2][0], a[2][1], a[2][2] ]
  ];

  m.matrix = true;
  return m;
}

// compute the inverse of the 3x3 input matrix
function inverse3( a )
{
  // verify that the input is a 3x3 matrix
  if ( !a.matrix || a.length != 3 || a[0].length != 3)
    return "inverse3(): input is not a 3x3 matrix";

  // compute its determinant
  const det = a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
            - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
            + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
  if (!det) return "singular input matrix";

  // the reciprocal of the determinant value
  const f = 1.0 / det;

  // and finally the inverse matrix 
  var m = [
    [(a[1][1] * a[2][2] - a[1][2] * a[2][1]) * f,
     (a[1][2] * a[2][0] - a[1][0] * a[2][2]) * f,
     (a[1][0] * a[2][1] - a[1][1] * a[2][0]) * f ],
     
    [(a[0][2] * a[2][1] - a[0][1] * a[2][2]) * f,
     (a[0][0] * a[2][2] - a[0][2] * a[2][0]) * f,
     (a[0][1] * a[2][0] - a[0][0] * a[2][1]) * f ],
     
    [(a[0][1] * a[1][2] - a[0][2] * a[1][1]) * f,
     (a[0][2] * a[1][0] - a[0][0] * a[1][2]) * f,
     (a[0][0] * a[1][1] - a[0][1] * a[1][0]) * f ]
  ];
  
  m.matrix = true;
  return m;
}

function value2Index( val, min_val, max_val )
{
  if (val < min_val) val = min_val; if (val > max_val) val = max_val;
  return (val - min_val) * 100 / (max_val - min_val);
}

function index2Value( idx, min_val, max_val )
{
  if (idx < 0) idx = 0; if (idx > 100) idx = 100;
  return min_val + (max_val - min_val) * idx / 100;
}

function numToString( x, decimals )
{
  if (!decimals) decimals = 1;
  return parseFloat(Math.round(x * 100) / 100).toFixed(decimals);
}

function numToPercentString( x )
{
  var s = parseInt(100*x).toString();
  return s + '%';
}

function numToDegreeString( x )
{
  var s = parseInt(x).toString(); // no decimals
  return s + '\u00B0';
}

// returns a vec3 color
function parseHexColor( colStr )
{
  var fact  = 1.0 / 255;
  var red   = parseInt(colStr.substr(1,2),16) * fact;
  var green = parseInt(colStr.substr(3,2),16) * fact;
  var blue =  parseInt(colStr.substr(5,2),16) * fact;
  return [red, green, blue];
}

function float2Hex( x )
{
  var hex = Number(parseInt(x * 255)).toString(16);
  return (hex.length == 2) ? hex : "0" + hex;
}

function color2Hex( col ) // col is assume to be vec3 (or vec4 although the 4th comp. is ignored)
{
  return "#" + float2Hex(col[0]) + float2Hex(col[1]) + float2Hex(col[2]);
}

// return value is the vec3 ( x, y, z ) corresp. to ( radius, theta, phi )
function spherical2cartesian( radius, theta, phi )
{
  return vec3( radius * Math.sin(theta) * Math.cos(phi),
               radius * Math.sin(theta) * Math.sin(phi),
               radius * Math.cos(theta) );
}

window.onload = function init()
{
  var canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  gl.viewport( 0, 0, canvas.width, canvas.height );
  aspect = canvas.width / canvas.height;  
  
  gl.clearColor( sceneColor[0], sceneColor[1], sceneColor[2], 1.0 );
  document.getElementById("sceneColor").value  = color2Hex(sceneColor);
  
  // enable depth testing and polygon offset
  // so lines will be in front of filled triangles
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 2.0);

  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // create the vertex buffer (vec4 entries)
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.DYNAMIC_DRAW);

  // each vertex will get the value of the attribute 'vNormal' from the vertexBuffer
  var vPositionLoc = gl.getAttribLocation( program, "vPosition" ); // 4D vertices so 4*4=16 bytes each
  gl.vertexAttribPointer( vPositionLoc, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPositionLoc );
  
  // create the normal buffer (this will store the normal-to-surface vectors) (vec3 entries)
  normalBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, 12 * maxNumVertices, gl.DYNAMIC_DRAW);

  // each vertex will get the value of the attribute 'vNormal' from the normalBuffer
  var vNormalLoc = gl.getAttribLocation( program, "vNormal" ); // 3D vertices so 3*4=12 bytes each
  gl.vertexAttribPointer( vNormalLoc, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vNormalLoc );
  
  // array element (index) buffer
  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 2 * maxNumVertices, gl.DYNAMIC_DRAW);

  // get the uniforms' locations
  projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
  modelViewMatrixLoc  = gl.getUniformLocation( program, "modelViewMatrix" );
  normalsMatrixLoc    = gl.getUniformLocation( program, "normalsMatrix" );

  lightPosLoc     = gl.getUniformLocation( program, "lightPos" );
  lightAmbLoc     = gl.getUniformLocation( program, "lightAmb" );
  lightDiffLoc    = gl.getUniformLocation( program, "lightDiff" );
  lightSpecLoc    = gl.getUniformLocation( program, "lightSpec" );
  lightEnabledLoc = gl.getUniformLocation( program, "lightEnabled" );

  matAmbientLoc   = gl.getUniformLocation( program, "matAmbient" );
  matDiffuseLoc   = gl.getUniformLocation( program, "matDiffuse" );
  matSpecularLoc  = gl.getUniformLocation( program, "matSpecular" );
  matShininessLoc = gl.getUniformLocation( program, "matShininess" );
  
  methodLoc = gl.getUniformLocation( program, "method" );
  method = parseInt(document.getElementById("specType").value);
  gl.uniform1i(methodLoc, method);
  
  // set the handler/listeners for the various UI elements
  document.getElementById("newObject").onclick   = newObjectClicked;
  document.getElementById("sceneObjs").onchange  = newObjectSelected;
  document.getElementById("isoScaling").onchange = isoScalingChanged;
  document.getElementById("delObject").onclick   = deleteSelClicked;
  document.getElementById("deleteAll").onclick   = deleteAllClicked;
  
  document.getElementById("sXval").oninput      = newXScale;
  document.getElementById("sYval").oninput      = newYScale;
  document.getElementById("sZval").oninput      = newZScale;
  document.getElementById("resetScale").onclick = resetScaleClicked;

  document.getElementById("rXval").oninput       = newXRotate;
  document.getElementById("rYval").oninput       = newYRotate;
  document.getElementById("rZval").oninput       = newZRotate;
  document.getElementById("resetRotate").onclick = resetRotateClicked;

  document.getElementById("tXval").oninput          = newXTranslate;
  document.getElementById("tYval").oninput          = newYTranslate;
  document.getElementById("tZval").oninput          = newZTranslate;
  document.getElementById("resetTranslate").onclick = resetTranslateClicked;

  document.getElementById("sceneColor").onchange = function() {
    sceneColor = parseHexColor(document.getElementById("sceneColor").value);    
    gl.clearColor( sceneColor[0], sceneColor[1], sceneColor[2], 1.0 );
  };
  
  document.getElementById("specType").onchange = function() {
    method = parseInt(document.getElementById("specType").value);
    gl.uniform1i(methodLoc, method);
  };
  
  document.getElementById("ambCol").onchange    = ambColChanged;
  document.getElementById("diffCol").onchange   = diffColChanged;
  document.getElementById("specCol").onchange   = specColChanged;
  document.getElementById("shininess").oninput  = shininessChanged;
  
  document.getElementById("drawSolid").onchange = drawSolidChanged;
 
  document.getElementById("radVal").oninput   = newRadius; newRadius();
  document.getElementById("thetaVal").oninput = newTheta;  newTheta();
  document.getElementById("phiVal").oninput   = newPhi;    newPhi();

  document.getElementById("lightRad").oninput     = newLightRad;
  document.getElementById("lightTheta").oninput   = newLightTheta;
  document.getElementById("lightPhi").oninput     = newLightPhi;
  document.getElementById("lightAnimate").onclick = newLightAnimate;
  
  init_cone_model();
  init_cylinder_model();
  init_sphere_model();
 
  tick();
}

function tick()
{
  window.requestAnimFrame(tick);
  render_scene();
}

// sends all the light-related data to the GPU
function setLightsAttrs()
{
  var lights = [];
  
  // separate the light objects from the other objects
  for (var o of objects)
  {
    if (o.type == OBJ_T.LIGHT) lights.push(o);
  }

  // use an array for each light attribute
  var lightPos = [], lightAmb = [], lightDiff = [], lightSpec = [], lightEnabled = [];

  // *all* MAX_LIGHTS will be init'ed with real data or with zeroes if disabled
  for (var i = 0; i != MAX_LIGHTS; ++i)
  {
    if (i < lights.length && lights[i].solid)
    {
      lightPos.push(spherical2cartesian(lights[i].radius, lights[i].theta, lights[i].phi));
      lightAmb.push(lights[i].ambCol);
      lightDiff.push(lights[i].diffCol);
      lightSpec.push(lights[i].specCol);
      lightEnabled.push(lights[i].solid ? 1 : 0);
    }
    else
    {
      // non-existent / disabled light
      lightPos.push(vec3(0, 0, 0));
      lightAmb.push(vec3(0, 0, 0));
      lightDiff.push(vec3(0, 0, 0));
      lightSpec.push(vec3(0, 0, 0));
      lightEnabled.push(0);
    }
  }

  // set the light information to the GPU
  gl.uniform3fv(lightPosLoc,     flatten(lightPos));
  gl.uniform3fv(lightAmbLoc,     flatten(lightAmb));
  gl.uniform3fv(lightDiffLoc,    flatten(lightDiff));
  gl.uniform3fv(lightSpecLoc,    flatten(lightSpec));
  gl.uniform1iv(lightEnabledLoc, new Int32Array(lightEnabled));
}

function ambColChanged()
{
  if (selIdx < 0) return;
  objects[selIdx].ambCol = parseHexColor(document.getElementById("ambCol").value);
  if (objects[selIdx].type==OBJ_T.LIGHT) setLightsAttrs();
}

function diffColChanged()
{
  if (selIdx < 0) return;
  objects[selIdx].diffCol = parseHexColor(document.getElementById("diffCol").value);
  if (objects[selIdx].type==OBJ_T.LIGHT) setLightsAttrs();
}

function specColChanged()
{
  if (selIdx < 0) return;
  objects[selIdx].specCol = parseHexColor(document.getElementById("specCol").value);
  if (objects[selIdx].type==OBJ_T.LIGHT) setLightsAttrs();
}

function shininessChanged()
{
  if (selIdx < 0) return;
  var idx = document.getElementById("shininess").value;
  var val = index2Value(idx, 0, 1);
  objects[selIdx].shininess = val;
}

function resetScaleClicked()
{
  if (selIdx < 0) return;
 
  var obj = objects[selIdx];
  
  obj.scale = vec3(1,1,1); obj.iso_scale = true;
  update_matrix(obj);
  
  newObjectSelected(); // update all GUI information
}

function newXScale()
{
  if (selIdx < 0) return;
  
  var obj = objects[selIdx], idx = document.getElementById("sXval" ).value;
  var val = index2Value(idx, minScale, maxScale), str = numToPercentString(val);
  
  obj.scale[0] = val; document.getElementById("sXdisp").value = str;
  
  if (obj.iso_scale)
  {
    obj.scale[1] = obj.scale[2] = val;
    
    document.getElementById("sYval" ).value = idx;
    document.getElementById("sZval" ).value = idx;
    document.getElementById("sYdisp").value = str;
    document.getElementById("sZdisp").value = str;
  }
  
  update_matrix(obj);
}

function newYScale()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("sYval" ).value;
  var val = index2Value(idx, minScale, maxScale), str = numToPercentString(val);
  
  obj.scale[1] = val; document.getElementById("sYdisp").value = str;
  update_matrix(obj);
}

function newZScale()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("sZval" ).value;
  var val = index2Value(idx, minScale, maxScale), str = numToPercentString(val);
  
  obj.scale[2] = val; document.getElementById("sZdisp").value = str;
  update_matrix(obj);
}

function isoScalingChanged()
{
  if (selIdx < 0) return;
  
  var checked = document.getElementById("isoScaling").checked;

  objects[selIdx].iso_scale = checked;

  document.getElementById("sYval" ).disabled = checked;
  document.getElementById("sZval" ).disabled = checked;
}

function drawSolidChanged()
{
  if (selIdx < 0) return;
  objects[selIdx].solid = document.getElementById("drawSolid").checked;
  if (objects[selIdx].type==OBJ_T.LIGHT) setLightsAttrs();
}

function newRadius()
{
  var idx = document.getElementById("radVal").value;
  radius = index2Value(idx, minRadius, maxRadius);
  document.getElementById("radDisp").value = numToString(radius,2);
}

function newLightRad()
{
  // a light must be selected (it should but you can never be too careful...)
  if (selIdx < 0 || objects[selIdx].type != OBJ_T.LIGHT) return;
  
  var radius = index2Value(document.getElementById("lightRad").value, minLightRad, maxLightRad);
  objects[selIdx].radius = radius;
  document.getElementById("lightRadDisp").value = numToString(radius, 2);
  
  setLightsAttrs();  
}

function newTheta()
{
  var idx = document.getElementById("thetaVal").value;
  theta = index2Value(idx, 0, 2*Math.PI);
  document.getElementById("thetaDisp").value = numToDegreeString(theta*180/Math.PI);
}

function newLightTheta()
{
  // a light must be selected (it should but you can never be too careful...)
  if (selIdx < 0 || objects[selIdx].type != OBJ_T.LIGHT) return;
  
  var theta = index2Value(document.getElementById("lightTheta").value, 0, 2*Math.PI);
  objects[selIdx].theta = theta;
  document.getElementById("lightThetaDisp").value = numToDegreeString(theta*180/Math.PI);

  setLightsAttrs();  
}

function newPhi()
{
  var idx = document.getElementById("phiVal").value;
  phi = index2Value(idx, 0, 2*Math.PI);
  document.getElementById("phiDisp").value = numToDegreeString(phi*180/Math.PI);
}

function newLightPhi()
{
  // a light must be selected (it should but you can never be too careful...)
  if (selIdx < 0 || objects[selIdx].type != OBJ_T.LIGHT) return;
  
  var phi = index2Value(document.getElementById("lightPhi").value, 0, 2*Math.PI);
  objects[selIdx].phi = phi;
  document.getElementById("lightPhiDisp").value = numToDegreeString(phi*180/Math.PI);

  setLightsAttrs();  
}

function newLightAnimate()
{
  // a light must be selected (it should but you can never be too careful...)
  if (selIdx < 0 || objects[selIdx].type != OBJ_T.LIGHT) return;
  
  objects[selIdx].animate   = document.getElementById("lightAnimate").checked;
  objects[selIdx].animsteps = 0;
}

function newXRotate()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("rXval" ).value;
  var val = index2Value(idx, minRotate, maxRotate), str = numToDegreeString(val);
  
  obj.rotate[0] = val; document.getElementById("rXdisp").value = str;
  update_matrix(obj);
}

function newYRotate()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("rYval" ).value;
  var val = index2Value(idx, minRotate, maxRotate), str = numToDegreeString(val);
  
  obj.rotate[1] = val; document.getElementById("rYdisp").value = str;
  update_matrix(obj);
}

function newZRotate()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("rZval" ).value;
  var val = index2Value(idx, minRotate, maxRotate), str = numToDegreeString(val);
  
  obj.rotate[2] = val; document.getElementById("rZdisp").value = str;
  update_matrix(obj);
}

function resetRotateClicked()
{
  if (selIdx < 0) return;
 
  var obj = objects[selIdx];
  obj.rotate = vec3(0,0,0); update_matrix(obj);
  
  newObjectSelected(); // update all GUI information
}

function newXTranslate()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("tXval").value;
  var val = index2Value(idx, minTranslate, maxTranslate), str = numToString(val, 2);
  
  obj.translate[0] = val; document.getElementById("tXdisp").value = str;
  update_matrix(obj);
}

function newYTranslate()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("tYval").value;
  var val = index2Value(idx, minTranslate, maxTranslate), str = numToString(val, 2);
  
  obj.translate[1] = val; document.getElementById("tYdisp").value = str;
  update_matrix(obj);
}

function newZTranslate()
{
  if (selIdx < 0) return;

  var obj = objects[selIdx], idx = document.getElementById("tZval").value;
  var val = index2Value(idx, minTranslate, maxTranslate), str = numToString(val, 2);
  
  obj.translate[2] = val; document.getElementById("tZdisp").value = str;
  update_matrix(obj);
}

function resetTranslateClicked()
{
  if (selIdx < 0) return;
 
  var obj = objects[selIdx];
  obj.translate = vec3(0,0,0); update_matrix(obj);
  
  newObjectSelected(); // update all GUI information
}

// called when the user wants to delete the currently selected object
function deleteSelClicked()
{
  // retrieve the index of the currently selected item in the drop-down list
  var selectBox = document.getElementById("sceneObjs");  
  selIdx = parseInt(selectBox.selectedIndex);
  
  // if anything selected
  if (selIdx >= 0)
  {
    // decrement the number of light objects
    if (objects[selIdx].type == OBJ_T.LIGHT) --numLights;
    
    // delete the object with the specified index from the object list
    objects.splice( selIdx, 1 );
    
    // remove it from the drop-down listbox
    selectBox.remove( selIdx );
    
    // if the last item
    if (selIdx >= selectBox.length) selIdx = selectBox.length - 1;
    
    // refresh GUI information
    sceneObjs.selectedIndex = selIdx;
    if (selIdx < 0) obj_counts = [0,0,0,0,0];
    
    newObjectSelected();
  }
}

// called when the user wants to delete all the objects/reset scene
function deleteAllClicked()
{
  // clear the object list and counts
  objects = []; obj_counts = [0,0,0,0,0];

  // clear all the options/objects in the "sceneObjs" drop-down list  
  var selectBox = document.getElementById("sceneObjs");
  for (var idx = selectBox.length - 1; idx >= 0; --idx)
  {
    selectBox.remove(idx);
  }

  newObjectSelected();
}

// called when the user wants to create a new object
function newObjectClicked()
{
  var obj_type = parseInt(document.getElementById("objType").value);
  var obj = createNewObject(obj_type);
  if (obj === null) return;
  
  // add the object into the objects list
  objects.push(obj);
  
  // give it a name that will be shown in the GUI
  const idx  = ++obj_counts[obj_type];
  const name = obj_names[obj_type] + ' ' + idx.toString();
  
  // add the new name into the objects list
  var sceneObjs = document.getElementById("sceneObjs");
  var option = document.createElement("option");
  option.text = name; option.value = sceneObjs.length;
  sceneObjs.add(option);
  
  // and make it the current one (selected)
  sceneObjs.selectedIndex = sceneObjs.length - 1;
  
  // for some reason the prev. change does not trigger the newObjectSelected()
  // listener so call it directly here
  newObjectSelected();
}

// called when the user selects an object from the list of scene objects
function newObjectSelected()
{
  // this is called from multiple places so put it here for simplicity
  // (even if it will unnecessarily send data to the GPU sometimes)
  setLightsAttrs();
 
  // retrieve the index of the currently selected item in the drop-down list
  selIdx = parseInt(document.getElementById("sceneObjs").selectedIndex);
  
  const objAttrs      = document.getElementById("objAttrs");
  const lightAttrs    = document.getElementById("lightAttrs");
  const objLightAttrs = document.getElementById("objLightAttrs");
  
  // this should not happen if we always have (at least) a light in the list of objects
  if (selIdx < 0) {
    objAttrs.style.display      = 'none';
    lightAttrs.style.display    = 'none';
    objLightAttrs.style.display = 'none';
    return;
  }

  // the current object
  const o = objects[selIdx];

  // display the common (light/obj) attributes
  objLightAttrs.style.display = 'block';
  document.getElementById("shininess").disabled = o.type == OBJ_T.LIGHT;

  // and then the "personalized" ones
  objAttrs.style.display      = o.type != OBJ_T.LIGHT ? 'block' : 'none';
  lightAttrs.style.display    = o.type == OBJ_T.LIGHT ? 'block' : 'none';

  var val, idx;

  // regular objects
  if (o.type != OBJ_T.LIGHT)
  {
    val = o.scale[0]; idx = value2Index(val, minScale, maxScale);
    document.getElementById("sXval" ).value = idx;
    document.getElementById("sXdisp").value = numToPercentString(index2Value(idx, minScale, maxScale));

    val = o.scale[1]; idx = value2Index(val, minScale, maxScale);
    document.getElementById("sYval" ).value = idx;
    document.getElementById("sYdisp").value = numToPercentString(index2Value(idx, minScale, maxScale));

    val = o.scale[2]; idx = value2Index(val, minScale, maxScale);
    document.getElementById("sZval" ).value = idx;
    document.getElementById("sZdisp").value = numToPercentString(index2Value(idx, minScale, maxScale));
    
    document.getElementById("isoScaling").checked = o.iso_scale;
    document.getElementById("sYval" ).disabled = o.iso_scale;
    document.getElementById("sZval" ).disabled = o.iso_scale;

    val = o.rotate[0]; idx = value2Index(val, minRotate, maxRotate);
    document.getElementById("rXval" ).value = idx;
    document.getElementById("rXdisp").value = numToDegreeString(index2Value(idx, minRotate, maxRotate));

    val = o.rotate[1]; idx = value2Index(val, minRotate, maxRotate);
    document.getElementById("rYval" ).value = idx;
    document.getElementById("rYdisp").value = numToDegreeString(index2Value(idx, minRotate, maxRotate));

    val = o.rotate[2]; idx = value2Index(val, minRotate, maxRotate);
    document.getElementById("rZval" ).value = idx;
    document.getElementById("rZdisp").value = numToDegreeString(index2Value(idx, minRotate, maxRotate));
    
    val = o.translate[0]; idx = value2Index(val, minTranslate, maxTranslate);
    document.getElementById("tXval" ).value = idx;
    document.getElementById("tXdisp").value = numToString(index2Value(idx, minTranslate, maxTranslate),2);

    val = o.translate[1]; idx = value2Index(val, minTranslate, maxTranslate);
    document.getElementById("tYval" ).value = idx;
    document.getElementById("tYdisp").value = numToString(index2Value(idx, minTranslate, maxTranslate),2);

    val = o.translate[2]; idx = value2Index(val, minTranslate, maxTranslate);
    document.getElementById("tZval" ).value = idx;
    document.getElementById("tZdisp").value = numToString(index2Value(idx, minTranslate, maxTranslate),2);
  }
  else
  {
    // light position (radius, theta and phi)
    val = o.radius; idx = value2Index(val, minLightRad, maxLightRad);
    document.getElementById("lightRad").value = idx;
    document.getElementById("lightRadDisp").value = numToString(index2Value(idx, minLightRad, maxLightRad),2);
    
    val = o.theta; idx = value2Index(val, 0, Math.PI*2);
    document.getElementById("lightTheta").value = idx;
    document.getElementById("lightThetaDisp").value = numToDegreeString(index2Value(idx,0,Math.PI*2)*180/Math.PI);

    val = o.phi; idx = value2Index(val, 0, Math.PI*2);
    document.getElementById("lightPhi").value = idx;
    document.getElementById("lightPhiDisp").value = numToDegreeString(index2Value(idx, 0, Math.PI*2)*180/Math.PI);
    
    document.getElementById("lightAnimate").checked = o.animate;
  }
  
  document.getElementById("ambCol").value  = color2Hex(o.ambCol);
  document.getElementById("diffCol").value = color2Hex(o.diffCol);
  document.getElementById("specCol").value = color2Hex(o.specCol);
  
  if (o.shininess) document.getElementById("shininess").value = value2Index(o.shininess, 0, 1);
  
  document.getElementById("drawSolid").checked = o.solid;
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
  return mult( rotateX(rV[0]),
         mult( rotateY(rV[1]),
               rotateZ(rV[2]) ) );
}

function translate3( tV )
{
  var result = mat4();

  result[0][3] = tV[0];
  result[1][3] = tV[1];
  result[2][3] = tV[2];

  return result;
}

function renorm( v, new_len )
{
  const len = length(v); if (len == 0) return v;
  const f = new_len/len;
  
  var res = [];
  for (var i = 0; i != v.length; ++i)
  {
    // make sure no component exceeds 'new_len' as result of scaling
    res.push(Math.min(f * v[i], new_len));
  }
  
  return res;
}

function randVal( min_v, max_v ) { return min_v + (max_v - min_v) * Math.random(); }

function randCol3()  { return [Math.random(), Math.random(), Math.random()]; }
function randColor() { return [Math.random(), Math.random(), Math.random(), 1.0]; }

// TODO: read this page: http://jonmacey.blogspot.ro/2010_11_01_archive.html

function randScale()
{
  // stick to isotropic scaling on new objects? yep, for now...
  //if (Math.random() < 0.5)
  {
    var s = randVal(0.5, 1.5); return [ s, s, s ];
  }
  
  return [ randVal(0.5, 1.5), randVal(0.5, 1.5), randVal(0.5, 1.5) ];
}

function randRotate()
{
  return [ randVal(minRotate, maxRotate),
           randVal(minRotate, maxRotate),
           randVal(minRotate, maxRotate) ];
}

function randTranslate()
{
  return [ randVal(-1.5,1.5), randVal(-1.5,1.5), randVal(-1.5,1.5) ];
}

// creates a new "object" with the specified type
function createNewObject( obj_type )
{
  const rndCols = document.getElementById("randColors").checked;

  var obj;

  if ( obj_type != OBJ_T.LIGHT )
  {
    // regular object (i.e. not a light)
    obj = {
      ambCol:    rndCols ? renorm(randCol3(),0.2) : vec3(0.2,0.1,0.25), // ambient color
      diffCol:   rndCols ? renorm(randCol3(),0.6) : vec3(0.3,0.8,0.4),  // diffuse color
      specCol:   rndCols ? renorm(randCol3(),0.4) : vec3(0.6,0.2,0.3),  // specular color
      shininess: rndCols ? Math.random()          : 0.5,
     
      scale:     rndCols ? randScale()     : vec3(1,1,1),
      rotate:    rndCols ? randRotate()    : vec3(0,0,0),               // in degrees
      translate: rndCols ? randTranslate() : vec3(0,0,0),
      iso_scale: (scale[0]===scale[1] && scale[0]===scale[2]),
      solid:     true,
      type:      obj_type,
    };

    update_matrix( obj );
  }
  else
  {
    if (numLights == MAX_LIGHTS)
    {
      alert('The maximum number of lights ('+MAX_LIGHTS+') was reached.\n\n'+
            'Set the N_LIGHTS constant in the fragment shader and\n'+
            'the MAX_LIGHTS constant in the JS file to the (same)\n'+
            'larger value for shading with more light sources.');
      return null;
    }
    
    // light object
    obj = {
      ambCol:    rndCols ? renorm(randCol3(),0.8) : vec3(1,1,1), // ambient color intensity
      diffCol:   rndCols ? renorm(randCol3(),0.8) : vec3(1,1,1), // diffuse color intensity
      specCol:   rndCols ? renorm(randCol3(),0.8) : vec3(1,1,1), // specular color intensity
      radius:    rndCols ? randVal(minLightRad, maxLightRad)     // the ligth position
                         : (minLightRad + maxLightRad) / 2,
      theta:     rndCols ? randVal(0, Math.PI*2)  : 0,           // in spherical coordinates
      phi:       rndCols ? randVal(0, Math.PI*2)  : 0,           // (radius, theta, phi)
      solid:     true,
      animate:   false, animsteps: 0, drad: 0, dtheta: 0,        // animation params
      type:      obj_type,
    };

    ++numLights;
  }
  
  return obj;
}

// updates the model matrix for the current object
// (from the scale, rotate and translate attributes)
function update_matrix ( obj )
{
  if (obj == OBJ_T.LIGHT) return; // should not be called on light objects, but...
  
  // scale by the same factor in all dimensions
  var scaleMatrix     = scale3( obj.scale );
  var rotateMatrix    = rotate3( obj.rotate );
  var translateMatrix = translate3( obj.translate );
  
  obj.matrix = mult( translateMatrix, mult( rotateMatrix, scaleMatrix) );
}

function render_cube( obj, first )
{
  // optimization: only the first obj in a sequence sends vertex data to the GPU
  if ( first )
  {
    // send the vertex data to the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cubeVertices );

    // and the normal data
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, cubeNormals );
    
    // and finally the indices  
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, cubeIndices );
  }
 
  // pass the material attributes to the shader code
  gl.uniform3fv(matAmbientLoc,   flatten(obj.ambCol));
  gl.uniform3fv(matDiffuseLoc,   flatten(obj.diffCol));
  gl.uniform3fv(matSpecularLoc,  flatten(obj.specCol));
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
  // top and base center vertices
  const top = vec4(0, 0.5, 0, 1), base_center = vec4(0, -0.5, 0, 1);

  // compute first the base vertices in a temporary array (coneLong + 1 entries)
  var base_vertices = [], base_normals = [];
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
  }
  
  // calculate the cone vertices (the intersections of longitude and latitude lines)
  var vertices = [], normals = [], indices = [];

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
    }
  }
  
  // for each "patch" of the cone surface/hull
  var crtLine = 0, nextLine = coneLong + 1;
  for (var lat = 0; lat != coneLat; ++lat)
  {
    for (var lng = 0; lng != coneLong; ++lng)
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
    crtLine = nextLine; nextLine += coneLong + 1;
  }

  // this is constant for all the base triangles/vertices
  const base_normal = vec3(0, -1, 0);

  // TODO: this could be more efficient but drawelements() + drawarrays() as triangle fan
  // doesn't seem to work properly. Why?
  
  // also coneDivs triangles for the cone base (could've been a triangle fan)
  var ind = vertices.length;
  for (var i = 0; i != coneLong; ++i)
  {
    vertices.push( base_center );        normals.push( base_normal ); indices.push(ind++);
    vertices.push( base_vertices[i] );   normals.push( base_normal ); indices.push(ind++);
    vertices.push( base_vertices[i+1] ); normals.push( base_normal ); indices.push(ind++);
  }
  
  // keep only the flattened versions of the arrays
  coneVertices = flatten(vertices);
  coneNormals  = flatten(normals);
  coneIndices  = new Uint16Array(indices);
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

    // and finally the indices
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, coneIndices );
  }
  
  // pass the material attributes to the shader code
  gl.uniform3fv(matAmbientLoc,   flatten(obj.ambCol));
  gl.uniform3fv(matDiffuseLoc,   flatten(obj.diffCol));
  gl.uniform3fv(matSpecularLoc,  flatten(obj.specCol));
  gl.uniform1f (matShininessLoc, obj.shininess);

  // draw the triangles for the cone hull + the cone base
  gl.drawElements( gl.TRIANGLES, coneLong * coneLat * 6 + coneLong * 3, gl.UNSIGNED_SHORT, 0 );
}

// longitude divisions (applicable to the cylinder)
const cylLong = 64;

function init_cylinder_model()
{
  // top and base center vertices
  const top_center = vec4(0, 0.5, 0, 1), base_center = vec4(0, -0.5, 0, 1);

  // compute first the base vertices in a temporary array (coneLong + 1 entries)
  var base_vertices = [], base_normals = [];
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
  }

  // generate two sets of vertices, one for the top disc and one for the bottom one
  var vertices = [], normals = [], indices = [];

  for (var y = 0.5; y >= -0.5; y -= 1.0)
  {
    for (var lng = 0; lng <= cylLong; ++lng)
    {
      const q = base_vertices[lng];
      
      vertices.push( vec4(q[0], y, q[2], 1) );
      normals.push( base_normals[lng] );
    }
  }
  
  // generate the indices for the triangles forming the cylinder hull
  for (var lng = 0; lng != cylLong; ++lng)
  {
    const first = lng, second = lng + cylLong + 1;
    
    // vertex indices for the first triangle of the patch
    indices.push(first);
    indices.push(second);
    indices.push(first + 1);

    // same for the second triangle
    indices.push(second);
    indices.push(second + 1);
    indices.push(first + 1);      
  }
  
  // TODO: this could be more efficient but drawelements() + drawarrays() as triangle fan
  // doesn't seem to work properly. Why?
  
  // also coneDivs triangles for the cone base (could've been a triangle fan)
  var ind = vertices.length, line = 0;
  
  for (var y = 0.5; y >= -0.5; y -= 1.0, line += cylLong + 1)
  {
    const center = vec4(0, y, 0, 1), normal = vec3(0, 2 * y, 0); // = normalize(vec3(center));
    for (var i = 0; i != cylLong; ++i)
    {
      const j = i + line;
      vertices.push( center );        normals.push( normal ); indices.push(ind++);
      vertices.push( vertices[j] );   normals.push( normal ); indices.push(ind++);
      vertices.push( vertices[j+1] ); normals.push( normal ); indices.push(ind++);
    }  
  }
 
  // keep only the flattened version of the vertex data
  cylinderVertices = flatten( vertices ); 
  cylinderNormals  = flatten( normals ); 
  cylinderIndices  = new Uint16Array (indices);  
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
    
    // then the indices  
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, cylinderIndices );
  }
  
  // pass the material attributes to the shader code
  gl.uniform3fv(matAmbientLoc,   flatten(obj.ambCol));
  gl.uniform3fv(matDiffuseLoc,   flatten(obj.diffCol));
  gl.uniform3fv(matSpecularLoc,  flatten(obj.specCol));
  gl.uniform1f (matShininessLoc, obj.shininess);

  // draw the triangles for the cylinder hull + the two cylinder bases
  gl.drawElements( gl.TRIANGLES, cylLong * 12, gl.UNSIGNED_SHORT, 0 );
}

const latBands = 24, longSegs = 45;

function init_sphere_model()
{
  var vertices = [], normals = [], indices = [];
  
  for (var lat = 0; lat <= latBands; ++lat)
  {
    const theta = lat * Math.PI / latBands; // 0 <= theta <= pi
    
    const y  = Math.cos(theta); // y = cos(theta) - constant per latitude "slice"
    const st = Math.sin(theta); // this will det. the radius of the latitude line
    
    for (var lng = 0; lng <= longSegs; ++lng)
    {
      const phi = lng * 2 * Math.PI / longSegs; // 0 <= phi <= 2 * pi
      
      const x = st * Math.cos(phi); // x = sin(theta) * cos(phi)
      const z = st * Math.sin(phi); // z = sin(theta) * sin(phi)
      
      vertices.push(vec4(x, y, z, 1));
      
      // the normals are easy for points on the sphere - there exactly the
      // vectors from the sphere centre to the points themselves
      // (with the length normalized to unit)
      normals.push(normalize(vec3(x, y, z)));
    }
  }

  // for each "patch" of the sphere surface
  var crtLine = 0, nextLine = longSegs + 1;
  for (var lat = 0; lat < latBands; ++lat)
  {
    for (var lng = 0; lng < longSegs; ++lng)
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
    crtLine = nextLine; nextLine += longSegs + 1;
  }

  // keep only the flattened version of the vertex data
  sphereVertices = flatten( vertices ); 
  sphereNormals  = flatten( normals ); 
  sphereIndices  = new Uint16Array (indices);  
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
    
    // and finally the indices
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
    gl.bufferSubData( gl.ELEMENT_ARRAY_BUFFER, 0, sphereIndices );
  }
  
  // pass the material attributes to the shader code
  gl.uniform3fv(matAmbientLoc,   flatten(obj.ambCol));
  gl.uniform3fv(matDiffuseLoc,   flatten(obj.diffCol));
  gl.uniform3fv(matSpecularLoc,  flatten(obj.specCol));
  gl.uniform1f (matShininessLoc, obj.shininess);
  
  // draw the solid triangles
  gl.drawElements( gl.TRIANGLES, latBands * longSegs * 6, gl.UNSIGNED_SHORT, 0 );
}

function render_sequence( sequence, render_fn, viewMatrix )
{
  // start with the 'first' flag set
  var first = true;

  // for each of the objects in the sequence
  for (var o of sequence)
  {
    // combine the transformations to form the modelViewMatrix for this object
    const modelViewMatrix = mult( viewMatrix, o.matrix );
    
    // compute the transformation matrix to be applied to the normal vectors
    // TODO: check why this doesn't seem to work (the transpose of the inverse):
    //const normalsMatrix = transpose( inverse3( mat4to3( modelViewMatrix ) ) );
    const normalsMatrix = mat4to3( modelViewMatrix );
    
    // send the model view matrix to the GPU
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten( modelViewMatrix ) );

    // also send the normal matrix
    gl.uniformMatrix3fv( normalsMatrixLoc, false, flatten( normalsMatrix ) );
    
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

  // position of the camera/observer
  const eye        = spherical2cartesian( radius, theta, phi );
  const viewMatrix = lookAt( eye, at, up );
  
  // the projection matrix - either orthographic or perspective
  const projectionMatrix = document.getElementById("perspective").checked ?
    perspective ( fovy, aspect, persp_near, persp_far ) :
    ortho ( left, right, bottom, ytop, near, far );

  gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
  
  // separate the different types of objects based on their type
  // (this could be done when adding/creating the items but anyway...)
  var sequences = [ [], [], [], [], [] ];

  // for each of the scene objects
  for (var o of objects)
  {
    // if the object is disabled, ignore it
    if (!o.solid) continue;
    
    // add the object reference to the corresponding bin
    sequences[o.type].push( o );
  }
  
  // for each sequence (except the one with the lights)
  for (var t = OBJ_T.CUBE; t <= OBJ_T.SPHERE; ++t)
  {
    render_sequence( sequences[t], render_fns[t], viewMatrix );
  }

  // animate by changing the value of the theta angle  
  if (document.getElementById("animate").checked)
  {
    var ang_theta = theta * 180.0 / Math.PI; ang_theta += 0.5;
    if (ang_theta > maxRotate) ang_theta = minRotate + (ang_theta-maxRotate);
    theta = ang_theta * Math.PI / 180.0;

    // update GUI elements
    document.getElementById("thetaVal" ).value = value2Index(ang_theta, minRotate, maxRotate);
    document.getElementById("thetaDisp").value = numToDegreeString(ang_theta);

    radius += dradius;
    if (radius < minRadius || radius > maxRadius) { dradius =-dradius; radius += dradius; }
    
    // update GUI elements
    document.getElementById("radVal" ).value = value2Index(radius, minRadius, maxRadius);
    document.getElementById("radDisp").value = numToString(radius, 2);
  }
  
  // we may have animated lights; TODO: ...
  var changeLights = false;
  for (var l of sequences[OBJ_T.LIGHT])
  {
    if (l.animate)
    {
      if (--l.animsteps < 0)
      {
        l.animsteps = Math.floor(randVal(100, 300));
        l.drad      = randVal(-0.01, 0.01);
        l.dtheta    = randVal(-0.1, 0.1);
      }
      
      l.radius += l.drad;
      if (l.radius < minLightRad) { l.radius = minLightRad; l.drad = -l.drad; }
      if (l.radius > maxLightRad) { l.radius = maxLightRad; l.drad = -l.drad; }
      
      l.theta += l.dtheta;
      if (l.theta < 0) l.theta = Math.PI*2 - l.theta;
      else if (l.theta > Math.PI*2) l.theta -= Math.PI*2;
      
      changeLights = true;
    }
  }
  if (changeLights) setLightsAttrs();  
}
