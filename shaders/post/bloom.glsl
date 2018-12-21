#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define PROCESSING_TEXTURE_SHADER

uniform sampler2D texture;
uniform float delta;

varying vec4 vertColor;
varying vec4 vertTexCoord;

// https://github.com/patriciogonzalezvivo/ofxFX/blob/master/src/filters/ofxBloom.h

void main(void) {
  vec4 col = texture2D(texture, vertTexCoord.st);
  vec4 sum;

  int j;
  int i;
  for(i=-2; i<=2; i++){
    for (j=-2; j<=2; j++){
      vec2 tc = vertTexCoord.st + vec2(j, i) * delta;
      vec4 c = texture2D(texture, tc);
      sum += texture2D(texture, tc) / 25.0;
    }
  }

  float threshold = 0.3;
  vec4 outputColor;
  if (length(sum.rgb) < threshold){
    outputColor = col;
  } else {
    outputColor = sum * sum * 0.9 + col;
  }
  gl_FragColor = outputColor * vertColor;
}
