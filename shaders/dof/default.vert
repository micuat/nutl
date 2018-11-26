uniform mat4 transform; 
uniform mat4 modelview;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix; 

attribute vec4 vertex; 
attribute vec4 color; 
attribute vec3 normal; 

varying vec4 vertColor;
varying vec3 vNormal;
varying vec3 vPosition;

void main() { 
  vertColor = color;
  vec4 vPosition4 = modelview * vertex; // Get vertex position in model view space
  vNormal = normalize(normalMatrix * normal); // Get normal direction in model view space
  gl_Position = transform * vertex;
  vPosition = vPosition4.xyz / vPosition4.w;//gl_Position.xyz / gl_Position.w;
}
