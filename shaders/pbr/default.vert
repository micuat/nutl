uniform mat4 transform;
uniform mat4 texMatrix;
uniform mat4 modelview;
uniform mat4 modelviewInv;
uniform mat4 viewMatrix;
uniform mat4 projection;
uniform mat3 normalMatrix;
uniform mat4 shadowTransform;
uniform vec3 lightDirection;
uniform vec3 vLightPosition;
uniform float tween0;
uniform float tween1;

attribute vec4 vertex; 
attribute vec4 color; 
attribute vec3 normal; 
attribute vec2 texCoord;
attribute vec4 aPbr;
attribute vec4 tweened0;
attribute vec4 tweened1;

varying vec4 vertColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vTexCoord;
varying vec4 shadowCoord;
varying vec3 vPbr;
varying float lightIntensity;
// varying vec3 vWsNormal;
// varying vec3 vEyePosition;
// varying vec3 vWsPosition;

void main() { 
  vertColor = color;
  vTexCoord = texMatrix * vec4(texCoord, 1.0, 1.0);
  vPbr = aPbr.rgb;

  vec4 newVertex = vertex * (1.0 - tween0) + tweened0 * tween0;
  newVertex = newVertex * (1.0 - tween1) + tweened1 * tween1;
  vec4 vPosition4 = modelview * newVertex; // Get vertex position in model view space
  vPosition = vPosition4.xyz / vPosition4.w;
  gl_Position = transform * newVertex;

  vNormal = normalize(normalMatrix * normal); // Get normal direction in model view space

  shadowCoord = shadowTransform * (vPosition4 + vec4(vNormal, 0.0)); // Normal bias removes the shadow acne

  lightIntensity = 0.5 + dot(-lightDirection*0.0 - (vPosition-vLightPosition), vNormal) * 0.5; 
}
