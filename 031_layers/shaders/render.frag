// file: render.frag
// author: diewald

#version 150

out vec4 fragColor;

uniform vec2 wh_rcp;
uniform vec3 colA;
uniform vec3 colB;
uniform vec3 colC;
uniform float amplitude = 1.0;
uniform sampler2D tex;

void main () {
  vec4 val = texture(tex, gl_FragCoord.xy * wh_rcp).rgba;
  float rate = clamp(abs(val.a) * amplitude + 0, 0, 1);
  vec3 col;
  if(rate > 0.5) {
    col = mix(colB, colC, rate * 2.0 - 1.0);
  }
  else {
    col = mix(colA, colB, rate * 2.0);
  }
  fragColor = vec4(col,1.0);//vec4(vec3(val.r * 1 + 0.5), 1);
}