// file: render.frag
// author: diewald

#version 150

out vec4 fragColor;

uniform vec2 wh_rcp;
uniform sampler2D tex;

void main () {
  vec4 val = texture(tex, gl_FragCoord.xy * wh_rcp).rgba;
  fragColor = vec4(vec3(abs(val.r * 10)),1.0);
}