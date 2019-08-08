#define saturate(x) clamp(x, 0.0, 1.0)

uniform sampler2D texture;

varying vec4 vertColor;
varying vec4 vertTexCoord;

void main() {
	vec4 color = vertColor;
	color.rgb = color.rgb * saturate(1.3 - length(vertTexCoord.st - vec2(0.5)));
  gl_FragColor = color;
}