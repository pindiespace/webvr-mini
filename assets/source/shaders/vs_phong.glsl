
link: http://www.mathematik.uni-marburg.de/~thormae/lectures/graphics1/code/WebGLShaderLightMat/ShaderLightMat.html

/////////////////////////////////
// BLINN PHONG SHADING
/////////////////////////////////
// vertexShader

attribute vec3 inputPosition;
attribute vec2 inputTexCoord;
attribute vec3 inputNormal;

uniform mat4 projection, modelview, normalMat;

varying vec3 normalInterp;
varying vec3 vertPos;

void main(){
    gl_Position = projection * modelview * vec4(inputPosition, 1.0);
    vec4 vertPos4 = modelview * vec4(inputPosition, 1.0);
    vertPos = vec3(vertPos4) / vertPos4.w;
    normalInterp = vec3(normalMat * vec4(inputNormal, 0.0));
}


/////////////////////////////////
// fragmentShader
precision mediump float; 

varying vec3 normalInterp;
varying vec3 vertPos;

uniform int mode;

const vec3 lightPos = vec3(1.0,1.0,1.0);
const vec3 ambientColor = vec3(0.1, 0.0, 0.0);
const vec3 diffuseColor = vec3(0.5, 0.0, 0.0);
const vec3 specColor = vec3(1.0, 1.0, 1.0);

void main() {

  vec3 normal = normalize(normalInterp);
  vec3 lightDir = normalize(lightPos - vertPos);

  float lambertian = max(dot(lightDir,normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {

    vec3 viewDir = normalize(-vertPos);

    // this is blinn phong
    vec3 halfDir = normalize(lightDir + viewDir);
    float specAngle = max(dot(halfDir, normal), 0.0);
    specular = pow(specAngle, 16.0);
       
    // this is phong (for comparison)
    if(mode == 2) {
      vec3 reflectDir = reflect(-lightDir, normal);
      specAngle = max(dot(reflectDir, viewDir), 0.0);
      // note that the exponent is different here
      specular = pow(specAngle, 4.0);
    }
  }

  gl_FragColor = vec4(ambientColor +
                      lambertian * diffuseColor +
                      specular * specColor, 1.0);
}



/////////////////////////////////
// PHONG PER-FRAGMENT
/////////////////////////////////
// vertexShader

attribute vec3 inputPosition;
attribute vec2 inputTexCoord;
attribute vec3 inputNormal;

uniform mat4 projection, modelview, normalMat;

varying vec3 normalInterp;
varying vec3 vertPos;

void main(){
    gl_Position = projection * modelview * vec4(inputPosition, 1.0);
    vec4 vertPos4 = modelview * vec4(inputPosition, 1.0);
    vertPos = vec3(vertPos4) / vertPos4.w;
    normalInterp = vec3(normalMat * vec4(inputNormal, 0.0));
}

/////////////////////////////////
// fragmentShader
precision mediump float; 

varying vec3 normalInterp;
varying vec3 vertPos;

uniform int mode;

const vec3 lightPos = vec3(1.0,1.0,1.0);
const vec3 diffuseColor = vec3(0.5, 0.0, 0.0);
const vec3 specColor = vec3(1.0, 1.0, 1.0);

void main() {

  vec3 normal = normalize(normalInterp); 
  vec3 lightDir = normalize(lightPos - vertPos);

  float lambertian = max(dot(lightDir,normal), 0.0);
  float specular = 0.0;

  if(lambertian > 0.0) {

    vec3 reflectDir = reflect(-lightDir, normal);
    vec3 viewDir = normalize(-vertPos);

    float specAngle = max(dot(reflectDir, viewDir), 0.0);
    specular = pow(specAngle, 4.0);

    // the exponent controls the shininess (try mode 2)
    if(mode == 2)  specular = pow(specAngle, 16.0);

    // according to the rendering equation we would need to multiply
    // with the the "lambertian", but this has little visual effect
    if(mode == 3) specular *= lambertian;

    // switch to mode 4 to turn off the specular component
    if(mode == 4) specular *= 0.0;

  }

  gl_FragColor = vec4( lambertian*diffuseColor +
                        specular*specColor, 1.0);
}



/////////////////////////////////
// PHONG PER-VERTEX
/////////////////////////////////
// vertexShader

attribute vec3 inputPosition; // aVertexPosition
attribute vec2 inputTexCoord; // aTextureCoord
attribute vec3 inputNormal;   // aVertexNormal

uniform mat4 projection, modelview, normalMat; // uMVMatrix, uMVMatrix, uNMatrix
uniform int mode;

varying vec4 forFragColor;

const vec3 lightPos = vec3(1.0, 1.0, 1.0);
const vec3 diffuseColor = vec3(0.5, 0.0, 0.0);
const vec3 specColor = vec3(1.0, 1.0, 1.0);

void main(){
  gl_Position = projection * modelview * vec4(inputPosition, 1.0);

  // all following gemetric computations are performed in the
  // camera coordinate system (aka eye coordinates)
  vec3 normal = vec3(normalMat * vec4(inputNormal, 0.0));
  vec4 vertPos4 = modelview * vec4(inputPosition, 1.0);
  vec3 vertPos = vec3(vertPos4) / vertPos4.w;
  vec3 lightDir = normalize(lightPos - vertPos);
  vec3 reflectDir = reflect(-lightDir, normal);
  vec3 viewDir = normalize(-vertPos);

  float lambertian = max(dot(lightDir,normal), 0.0);
  float specular = 0.0;
  
  if(lambertian > 0.0) {
    float specAngle = max(dot(reflectDir, viewDir), 0.0);
    specular = pow(specAngle, 4.0);

    // the exponent controls the shininess (try mode 2)
    if(mode == 2)  specular = pow(specAngle, 16.0);
       
    // according to the rendering equation we would need to multiply
    // with the the "lambertian", but this has little visual effect
    if(mode == 3) specular *= lambertian;
    // switch to mode 4 to turn off the specular component
    if(mode == 4) specular *= 0.0;
  }
  
  forFragColor = vec4(lambertian*diffuseColor + specular*specColor, 1.0);
}

/////////////////////////////////////////////
// fragmentShader

precision mediump float; 
varying vec4 forFragColor;

void main() {
  gl_FragColor = forFragColor;
}



