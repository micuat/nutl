#define saturate(x) clamp(x, 0.0, 1.0)

uniform sampler2D texture;
uniform vec4 fColor;
uniform vec4 gColor;

varying vec4 vertColor;
varying vec4 vertTexCoord;
varying vec4 vertPosition;

uniform float iTime;

float rand(float n){return fract(sin(n) * 43758.5453123);}

//	Simplex 3D Noise
//	by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float _noise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

vec4 noise(vec2 st, float scale, float offset) {
  return vec4(vec3(_noise(vec3(st*scale, offset*iTime))), 1.0);
}

float edgeFactor(){
    vec3 d = fwidth(vertColor.xyz);// * mix(1, 2, 0.5+0.5*sin(_noise(vec3(iTime,iTime,0)*3.0+0.1*vertPosition.xyz)));
    vec3 a3 = smoothstep(vec3(0.0), d*1.0, vertColor.xyz);
    return min(min(a3.x, a3.y), a3.z);
}

float edgeFactor2(){
    vec3 d = fwidth(vertColor.xyz);
    vec3 a3 = smoothstep(vec3(0.0), d*6.5, vertColor.xyz);
    return min(min(a3.x, a3.y), a3.z);
}

// https://github.com/mattdesl/webgl-wireframes/blob/gh-pages/lib/wire.frag
// This is like
float aastep (float threshold, float dist) {
  float afwidth = fwidth(dist) * 0.5;
  return smoothstep(threshold - afwidth, threshold + afwidth, dist);
}

// This function is not currently used, but it can be useful
// to achieve a fixed width wireframe regardless of z-depth
float computeScreenSpaceWireframe (vec3 barycentric, float lineWidth) {
  vec3 dist = fwidth(barycentric);
  vec3 smoothed = smoothstep(dist * ((lineWidth * 0.5) - 0.5), dist * ((lineWidth * 0.5) + 0.5), barycentric);
  return 1.0 - min(min(smoothed.x, smoothed.y), smoothed.z);
}

// This function returns the fragment color for our styled wireframe effect
// based on the barycentric coordinates for this fragment
vec4 getStyledWireframe (vec3 barycentric) {
  // this will be our signed distance for the wireframe edge
  float d = min(min(barycentric.x, barycentric.y), barycentric.z);

  // for dashed rendering, we can use this to get the 0 .. 1 value of the line length
  float positionAlong = max(barycentric.x, barycentric.y);
  if (barycentric.y < barycentric.x && barycentric.y < barycentric.z) {
    positionAlong = 1.0 - positionAlong;
  }

  // the thickness of the stroke
  float computedThickness = 0.01;

  // if we want to shrink the thickness toward the center of the line segment
  if (true) {
    // computedThickness *= mix(0.2, 1.5, (1.0 - sin(positionAlong * 3.1415)));
    computedThickness *= mix(0.8, 2.5, (1.0 - sin(positionAlong * 3.1415)));
  }

  // if we should create a dash pattern
  if (true) {
    // here we offset the stroke position depending on whether it
    // should overlap or not
    float dashRepeats = 9;
    float dashLength = 0.7;
    float offset = 1.0 / dashRepeats * dashLength / 2.0;

    // create the repeating dash pattern
    float pattern = fract((positionAlong + offset) * dashRepeats);
    computedThickness *= 1.0 - aastep(dashLength, pattern);
  }

  // compute the anti-aliased stroke edge  
  float edge = 1.0 - aastep(computedThickness, d);

  // now compute the final color of the mesh
  vec4 outColor = vec4(0.0);
  if (true) {
    outColor = vec4(gColor.rgb, edge);
    if (!gl_FrontFacing) {
      outColor.rgb = fColor.rgb;//vec3(0,0,0);
    }
  }
  return outColor;
}

void main() {
	vec4 color = vec4(gColor);//vertColor;
  color = getStyledWireframe(vertColor.xyz);
  float alpha = 0;
  // alpha = (1.0-edgeFactor())*0.95;
	float index = vertColor.w * 5.0;
	float n = 3.0;
	float tAlpha = 0.75;
	if(fract(iTime/n + index) < 1.0/n)
	alpha = max(alpha, abs(1.0+vertColor.x - 4.0*fract(iTime + index * n)) < 0.501 ? tAlpha : 0.0);
	else if(fract(iTime/n + index) < 2.0/n)
	alpha = max(alpha, abs(1.0+vertColor.y - 4.0*fract(iTime + index * n)) < 0.501 ? tAlpha : 0.0);
	else if(fract(iTime/n + index) < 3.0/n)
	alpha = max(alpha, abs(1.0+vertColor.z - 4.0*fract(iTime + index * n)) < 0.501 ? tAlpha : 0.0);

	color.a = max(color.a, alpha * 0.9 + 0.1);
  gl_FragColor = color;
}