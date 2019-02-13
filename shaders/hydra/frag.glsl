#version 120
#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec3 vertNormal;
varying vec3 vertLightDir;
varying vec4 vertColor;
varying vec4 vertTexCoord;

uniform float time;

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

vec4 noise(vec2 st, float scale, float offset){
    return vec4(vec3(_noise(vec3(st*scale, offset*time))), 1.0);
}

vec4 voronoi(vec2 st, float scale, float speed, float blending) {
    vec3 color = vec3(.0);

    // Scale
    st *= scale;

    // Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 10.;  // minimun distance
    vec2 m_point;        // minimum point

    for (int j=-1; j<=1; j++ ) {
        for (int i=-1; i<=1; i++ ) {
            vec2 neighbor = vec2(float(i),float(j));
            vec2 p = i_st + neighbor;
            vec2 point = fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
            point = 0.5 + 0.5*sin(time*speed + 6.2831*point);
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);

            if( dist < m_dist ) {
                m_dist = dist;
                m_point = point;
            }
        }
    }

    // Assign a color using the closest point position
    color += dot(m_point,vec2(.3,.6));
    color *= 1.0 - blending*m_dist;
    return vec4(color, 1.0);
}

vec4 osc(vec2 _st, float freq, float sync, float offset){
    vec2 st = _st;
    float r = sin((st.x-offset/freq+time*sync)*freq)*0.5  + 0.5;
    float g = sin((st.x+time*sync)*freq)*0.5 + 0.5;
    float b = sin((st.x+offset/freq+time*sync)*freq)*0.5  + 0.5;
    return vec4(r, g, b, 1.0);
}

vec4 shape(vec2 _st, float sides, float radius, float smoothing){
    vec2 st = _st * 2. - 1.;
    // Angle and radius from the current pixel
    float a = atan(st.x,st.y)+3.1416;
    float r = (2.*3.1416)/sides;
    float d = cos(floor(.5+a/r)*r-a)*length(st);
    return vec4(vec3(1.0-smoothstep(radius,radius + smoothing,d)), 1.0);
}

vec2 rotate(vec2 p0, float t0) {
    float t = t0 * time;
    vec2 p = p0 - vec2(0.5);
    p = vec2(p.x * cos(t) - p.y * sin(t), p.x * sin(t) + p.y * cos(t));
    p += vec2(0.5);
    return p;
}

vec2 pixelate(vec2 st, float pixelX, float pixelY){
    vec2 xy = vec2(pixelX, pixelY);
    return (floor(st * xy) + 0.5)/xy;
}

vec2 modulate(vec2 st, vec4 c1, float amount){
    return st + c1.xy*amount;
}

vec4 add(vec4 a, vec4 b){
    return a + b;
}

vec4 color(vec4 a, float r0, float g0, float b0, float a0, float r1, float g1, float b1, float a1){
    return vec4(mix(vec4(r0, g0, b0, a0), vec4(r1, g1, b1, a1), a.r));
}

// vec3 modulate(vec3 m0, vec3 m1, float amp) {
//     return 
// }

void main()
{
	vec2 iResolution = vec2(1.0);
	vec2 fragCoord = vertTexCoord.st + vec2(0);

    float freq = 7.5;
    float phase = 1;
    float theta = 0.3;
#pragma insert fragColor
}