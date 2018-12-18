#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec4 vertColor;
uniform float minDepth;
uniform float maxDepth;

void main() {
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float d = 1.0 - (depth-minDepth)/(maxDepth-minDepth);
  d = vertColor.r;
  d = max(0.0, min(1.0, d));
  gl_FragColor = vec4(vec3(d), 1.0);
}