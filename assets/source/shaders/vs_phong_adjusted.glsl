
link: http://www.mathematik.uni-marburg.de/~thormae/lectures/graphics1/code/WebGLShaderLightMat/ShaderLightMat.html

/////////////////////////////////
// PHONG PER-VERTEX
/////////////////////////////////
// vertexShader

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aVertexNormal; 

uniform mat4 uPMatrix, uMVMatrix, uNMatrix; // uPMatrix, uMVMatrix, uNMatrix
uniform int mode;

varying vec4 vLightWeighting;

const vec3 lightPos = vec3(1.0, 1.0, 1.0);
const vec3 diffuseColor = vec3(0.5, 0.0, 0.0);
const vec3 specColor = vec3(1.0, 1.0, 1.0);

void main(){
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

  vec3 transformedNormal = vec3(uNMatrix * vec4(aVertexNormal, 0.0));
  vec4 vertPos4 = uMVMatrix * vec4(aVertexPosition, 1.0);
  vec3 vertPos = vec3(vertPos4) / vertPos4.w;
  vec3 lightDir = normalize(lightPos - vertPos);
  vec3 reflectDir = reflect(-lightDir, transformedNormal);
  vec3 viewDir = normalize(-vertPos);

  float lambertian = max(dot(lightDir, transformedNormal), 0.0);
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
  
  vLightWeighting = vec4(lambertian*diffuseColor + specular*specColor, 1.0);
}

/////////////////////////////////////////////
// fragmentShader

precision mediump float; 
varying vec4 vLightWeighting;

void main() {
  gl_FragColor = vLightWeighting;
}



