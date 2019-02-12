uniform mat4 transformMatrix;
uniform float tween;

attribute vec4 position;
attribute vec4 tweened;
attribute vec4 color;
// attribute float id;

varying vec4 vertColor;
varying vec4 vTweened;

void main() {
  float t = tween - tweened.z;
  if(t<0)t = 0;
  if(t>0.2)t = 0.2;
  t*=5;
  t = cos(t * 3.1415) * 0.5 + 0.5;
  vec4 pTweened = tweened;
  // pTweened.z = 0.0;
  gl_Position = transformMatrix * ((1- t) * position + t * pTweened);
  vTweened = pTweened;
  vertColor = color;
}