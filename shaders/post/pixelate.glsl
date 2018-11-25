#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform sampler2D texture;

varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform vec2 resolution;
uniform float delta;

void main() {
  vec2 fragCoord = vertTexCoord.st;
  float amount = resolution.x / 16;
  float d = 1.0 / amount;
  float ar = resolution.x / resolution.y;
  float u = floor(vertTexCoord.x / d) * d;

  d = ar / amount;

  float v = floor(vertTexCoord.y / d) * d;

  gl_FragColor = texture2D(texture, vec2(u, v));
}
