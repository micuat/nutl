#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec4 vertColor;
uniform float minDepth;
uniform float maxDepth;

void main() {
  float d = vertColor.a;
  d = max(0.0, min(1.0, d));
  gl_FragColor = vec4(vec3(d), 1.0);
}