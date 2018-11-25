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
  for(i=-3; i<3; i++){
    for (j=-3; j<3; j++){
      vec2 tc = vertTexCoord.st + vec2(j, i) * delta;
      sum += texture2D(texture, tc) * 0.25;
    }
  }

  vec4 outputColor;
  if (texture2D(texture, vertTexCoord.st).r < 0.3){
      outputColor = sum * sum * 0.012 + texture2D(texture, vertTexCoord.st);
  } else {
      if (texture2D(texture, vertTexCoord.st).r < 0.5){
          outputColor = sum * sum * 0.009 + texture2D(texture, vertTexCoord.st);
      } else {
          outputColor = sum * sum * 0.0075 + texture2D(texture, vertTexCoord.st);
      }
  }
  gl_FragColor = outputColor * vertColor;
}
