// file: render.frag
// author: diewald

#version 150

out vec4 fragColor;

uniform vec2 wh_rcp;
uniform float amplitude = 1.0;
uniform sampler2D tex;

void main () {
  vec4 val = texture(tex, gl_FragCoord.xy * wh_rcp).rgba;
  fragColor = vec4(vec3(abs(val.r * amplitude)),1.0);
}