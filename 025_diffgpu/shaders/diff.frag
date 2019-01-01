// file: grayscott.frag
// author: diewald

#version 150

out vec4 fragColor;

uniform vec2 wh_rcp;
uniform vec2 obspos;
uniform sampler2D tex;

// uniform float dA   = 1.0;
// uniform float dB   = 0.5;
// uniform float feed = 0.055;
// uniform float kill = 0.062;
// uniform float dt   = 1.0;

uniform float _K0 = -20.0/6.0 * 0.75; // center weight
uniform float _K1 = 4.0/6.0 * 1.25; // edge-neighbors
uniform float _K2 = 1.0/6.0 * 1.25; // vertex-neighbors
uniform float cs = 0.256 * 1;
uniform float ws = 0.128 * 1;
uniform float amp = 1.001;
uniform float sp = 0.2 * 1;
uniform float lps = 0.06 * 1;
uniform float lps2 = -0.08 * 1;
// uniform float ps = 0.0;
uniform float sq2 = sqrt(2.0)/2.0;
uniform float wds = 2 + 2 * sqrt(2.0);

void main () {

  vec2 posn = gl_FragCoord.xy * wh_rcp;

  vec4 val = texture(tex, posn);

  // if(length((posn*20 - floor(posn*20))/20 - obspos) < 0.001) {
  //   fragColor = vec4(val.rgb, 100.0);
  //   return;
  // }
    
  // vec4 laplace = -val;
  vec4 v_w = textureOffset(tex, posn, ivec2(-1, 0));
  vec4 v_e = textureOffset(tex, posn, ivec2(+1, 0));
  vec4 v_n = textureOffset(tex, posn, ivec2( 0,-1));
  vec4 v_s = textureOffset(tex, posn, ivec2( 0,+1));
  vec4 v_nw = textureOffset(tex, posn, ivec2(-1,-1));
  vec4 v_ne = textureOffset(tex, posn, ivec2(+1,-1));
  vec4 v_sw = textureOffset(tex, posn, ivec2(-1,+1));
  vec4 v_se = textureOffset(tex, posn, ivec2(+1,+1));
  
  float a = val.r;
  float a_n = v_n.r;
  float a_ne = v_ne.r;
  float a_e = v_e.r;
  float a_se = v_se.r;
  float a_s = v_s.r;
  float a_sw = v_sw.r;
  float a_w = v_w.r;
  float a_nw = v_nw.r;

  float b = val.g;
  float b_n = v_n.g;
  float b_ne = v_ne.g;
  float b_e = v_e.g;
  float b_se = v_se.g;
  float b_s = v_s.g;
  float b_sw = v_sw.g;
  float b_w = v_w.g;
  float b_nw = v_nw.g;

  float p = val.b;
  float p_n = v_n.b;
  float p_ne = v_ne.b;
  float p_e = v_e.b;
  float p_se = v_se.b;
  float p_s = v_s.b;
  float p_sw = v_sw.b;
  float p_w = v_w.b;
  float p_nw = v_nw.b;

  float laplacian_p = p_n*_K1 + p_ne*_K2 + p_e*_K1 + p_se*_K2 + p_s*_K1 + p_sw*_K2 + p_w*_K1 + p_nw*_K2 + p*_K0;

  float v  = (a_n - a_s - b_e + b_w + sq2 * (a_nw + b_nw) + sq2 * (a_ne - b_ne) + sq2 * (b_sw - a_sw) - sq2 * (b_se + a_se));
  float sv = cs * (v > 0 ? 1 : (v < 0 ? -1 : 0)) * pow(abs(v), sp);

  float wa = a_w + a_e + sq2 * (a_nw + a_ne + a_se + a_sw) - wds * a;
  float wb = b_s + b_n + sq2 * (b_nw + b_ne + b_se + b_sw) - wds * b;

  float pa = a_w + a_e + sq2 * (b_nw - a_nw + a_sw + b_sw + a_ne + b_ne + a_se - b_se);
  float pb = b_s + b_n + sq2 * (a_nw - b_nw + a_sw + b_sw + a_ne + b_ne - a_se + b_se);

  p = b_s - b_n - a_e + a_w + sq2 * (a_nw - b_nw) - sq2 * (a_ne + b_ne) + sq2 * (a_sw + b_sw) + sq2 * (b_se - a_se);

  float theta = atan(b, a);
  // float mag = sqrt(a*a + b*b);
  float cost = cos(theta);
  float sint = sin(theta);
  float ta = amp * a + ws * wa - lps * cost * laplacian_p + lps2 * a * p;
  float tb = amp * b + ws * wb - lps * sint * laplacian_p + lps2 * b * p;
  a = ta * cos(sv) - tb * sin(sv);
  b = ta * sin(sv) + tb * cos(sv);

  vec4 outColor;
  outColor.r = clamp(a, -1.0, 1.0);
  outColor.g = clamp(b, -1.0, 1.0);
  outColor.b = p;

  outColor.a = (abs(pb)+abs(pa));//1000000.0 * (pb + pa);
  fragColor = outColor;
}