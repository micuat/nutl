#version 120 

#define saturate(x) clamp(x, 0.0, 1.0)
#define PI 3.14159265359

// Used a bigger poisson disk kernel than in the tutorial to get smoother results
const vec2 poissonDisk[9] = vec2[] ( 
  vec2(0.95581, -0.18159), vec2(0.50147, -0.35807), vec2(0.69607, 0.35559), 
  vec2(-0.0036825, -0.59150), vec2(0.15930, 0.089750), vec2(-0.65031, 0.058189), 
  vec2(0.11915, 0.78449), vec2(-0.34296, 0.51575), vec2(-0.60380, -0.41527) 
); 

// Unpack the 16bit depth float from the first two 8bit channels of the rgba vector
float unpackDepth(vec4 color) { 
  return color.r + color.g / 255.0; 
} 

uniform sampler2D texture;
uniform sampler2D normalTexture;
uniform sampler2D shadowMap;
uniform mat3 normalMatrix; 
uniform vec3 lightDirection;
uniform vec3 vLightPosition;
uniform vec3 uLightColor;
// uniform vec3 uBaseColor;
uniform float uSpecular;
uniform float uMetallic;
uniform float uRoughness;
uniform float uLightRadius;
uniform float uExposure;
uniform float uGamma;
uniform float uVignette;
uniform int uUseTexture;

uniform mat4 viewMatrix;

varying vec4 vertColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec4 vTexCoord;
varying vec4 shadowCoord; 
varying float lightIntensity; 

// OrenNayar diffuse
vec3 getDiffuse( vec3 diffuseColor, float roughness4, float NoV, float NoL, float VoH )
{
	float VoL = 2.0 * VoH - 1.0;
	float c1 = 1.0 - 0.5 * roughness4 / (roughness4 + 0.33);
	float cosri = VoL - NoV * NoL;
	float c2 = 0.45 * roughness4 / (roughness4 + 0.09) * cosri * ( cosri >= 0.0 ? min( 1.0, NoL / NoV ) : NoL );
	return diffuseColor / PI * ( NoL * c1 + c2 );
}

// GGX Normal distribution
float getNormalDistribution( float roughness4, float NoH )
{
	float d = ( NoH * roughness4 - NoH ) * NoH + 1;
	return roughness4 / ( d*d );
}

// Smith GGX geometric shadowing from "Physically-Based Shading at Disney"
float getGeometricShadowing( float roughness4, float NoV, float NoL, float VoH, vec3 L, vec3 V )
{	
	float gSmithV = NoV + sqrt( NoV * (NoV - NoV * roughness4) + roughness4 );
	float gSmithL = NoL + sqrt( NoL * (NoL - NoL * roughness4) + roughness4 );
	return 1.0 / ( gSmithV * gSmithL );
}

// Fresnel term
vec3 getFresnel( vec3 specularColor, float VoH )
{
	vec3 specularColorSqrt = sqrt( clamp( vec3(0, 0, 0), vec3(0.99, 0.99, 0.99), specularColor ) );
	vec3 n = ( 1 + specularColorSqrt ) / ( 1 - specularColorSqrt );
	vec3 g = sqrt( n * n + VoH * VoH - 1 );
	return 0.5 * pow( (g - VoH) / (g + VoH), vec3(2.0) ) * ( 1 + pow( ((g+VoH)*VoH - 1) / ((g-VoH)*VoH + 1), vec3(2.0) ) );
}

// Filmic tonemapping from
// http://filmicgames.com/archives/75

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;

vec3 Uncharted2Tonemap( vec3 x )
{
	return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;
}

// From "I'm doing it wrong"
// http://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/
float getAttenuation( vec3 lightPosition, vec3 vertexPosition, float lightRadius )
{
	float r				= lightRadius;
	vec3 L				= lightPosition - vertexPosition;
	float dist			= length(L);
	float d				= max( dist - r, 0 );
	L					/= dist;
	float denom			= d / r + 1.0f;
	float attenuation	= 1.0f / (denom*denom);
	float cutoff		= 0.0052f;
	attenuation			= (attenuation - cutoff) / (1 - cutoff);
	attenuation			= max(attenuation, 0);
	
	return attenuation;
}

void main(void) {
	vec4 vlp4 = viewMatrix * vec4(vLightPosition*0.0-(vPosition-vLightPosition), 1.0);
	vec3 vlp = vlp4.xyz / vlp4.w;
	vec3 N;
	if(uUseTexture > 0) {
		float h01 = texture2D(texture, vTexCoord.st * vec2(1.0, 0.5) - vec2(1.0/800.0, 0.0) + vec2(0.0, 0.0)).r;
		float h21 = texture2D(texture, vTexCoord.st * vec2(1.0, 0.5) + vec2(1.0/800.0, 0.0) + vec2(0.0, 0.0)).r;
		float h10 = texture2D(texture, vTexCoord.st * vec2(1.0, 0.5) - vec2(0.0, 1.0/800.0) + vec2(0.0, 0.0)).r;
		float h12 = texture2D(texture, vTexCoord.st * vec2(1.0, 0.5) + vec2(0.0, 1.0/800.0) + vec2(0.0, 0.0)).r;
		N                  = normalize(vNormal + 2.0 * normalMatrix * vec3(h21 - h01, 0.0, h10 - h12));
	}
	else {
		N                  = normalize(vNormal);
	}

	vec3 L                  = normalize( vlp - vPosition );
	vec3 V                  = normalize( -vPosition );
	vec3 H					= normalize(V + L);
	float NoL				= saturate( dot( N, L ) );
	float NoV				= saturate( dot( N, V ) );
	float VoH				= saturate( dot( V, H ) );
	float NoH				= saturate( dot( N, H ) );

	// deduce the diffuse and specular color from the baseColor and how metallic the material is
	vec3 uBaseColor;
	if(uUseTexture > 0) {
		uBaseColor = texture2D(texture, vTexCoord.st * vec2(1.0, 0.5) + vec2(0.0, 0.5)).rgb * vertColor.rgb;
	}
	else {
		uBaseColor = vertColor.rgb * saturate(1.0 - uVignette * length(vTexCoord.st - vec2(0.5)));
	}
	vec3 diffuseColor		= uBaseColor - uBaseColor * uMetallic;
	vec3 specularColor = mix( vec3( 0.08 * uSpecular ), uBaseColor, uMetallic );
	float distribution		= getNormalDistribution( uRoughness, NoH );
	vec3 fresnel			= getFresnel( specularColor, VoH );
	float geom				= getGeometricShadowing( uRoughness, NoV, NoL, VoH, L, V );

	vec3 diffuse			= getDiffuse( diffuseColor, uRoughness, NoV, NoL, VoH );
	vec3 specular			= NoL * ( distribution * fresnel * geom );

	vec3 color				= uLightColor * ( diffuse + specular );

	float attenuation		= getAttenuation( vlp, vPosition, uLightRadius );
	color					*= attenuation;
	
	color					= Uncharted2Tonemap( color * uExposure );
	const float whiteInputLevel = 0.5;
	vec3 whiteScale			= 1.0 / Uncharted2Tonemap( vec3( whiteInputLevel ) );
	color					= color * whiteScale;
	color					= pow( color, vec3( 1.0f / uGamma ) );
	
  // Project shadow coords, needed for a perspective light matrix (spotlight)
  vec3 shadowCoordProj = shadowCoord.xyz / shadowCoord.w; 

  // Only render shadow if fragment is facing the light
  if(lightIntensity > 0.5) { 
    float visibility = 9.0; 

    // I used step() instead of branching, should be much faster this way
    for(int n = 0; n < 9; ++n) 
      visibility += step(shadowCoordProj.z, unpackDepth(texture2D(shadowMap, shadowCoordProj.xy + poissonDisk[n] / 512.0))); 
    // for(int n = 0; n < 9; ++n) 
    //   visibility += step(shadowCoordProj.z, unpackDepth(texture2D(shadowMap, shadowCoordProj.xy + 10.0 * (n+1.0) / 10.0 * poissonDisk[n] / 512.0))); 

    gl_FragColor = vec4(color * min(visibility * 0.05556, lightIntensity), vertColor.a); 
  } else 
    gl_FragColor = vec4(color * lightIntensity, vertColor.a); 
}
