// file: render.frag
// author: diewald

#version 150

out vec4 fragColor;

uniform vec2 wh_rcp;
uniform float amplitude = 1.0;
uniform sampler2D tex;

void main () {
  vec4 val = texture(tex, gl_FragCoord.xy * wh_rcp).rgba;
  float rate = clamp(abs(val.a) * amplitude + 0, 0, 1);
  vec3 colB = vec3(176/255.0, 219/255.0, 67/255.0);
  vec3 colC = vec3(219/255.0, 39/255.0, 99/255.0);
  vec3 colA = vec3(18/255.0, 234/255.0, 234/255.0);
  vec3 col;
  if(rate > 0.5) {
    col = mix(colB, colC, rate * 2.0 - 1.0);
  }
  else {
    col = mix(colA, colB, rate * 2.0);
  }
  fragColor = vec4(col,1.0);//vec4(vec3(val.r * 1 + 0.5), 1);
}