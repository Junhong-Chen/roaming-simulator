uniform vec3 uPlayerPosition;
uniform float uLightnessSmoothness;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;
uniform float uGrassDistance;
uniform sampler2D uTexture;
uniform sampler2D uFogTexture;
uniform mat4 uShadowMatrix;

varying vec3 vColor;
varying vec4 vShadowCoord;
varying vec3 vNormal;
varying vec3 vLightDirection;
varying float vDistance;

#include ../common/getSunShade.glsl;
#include ../common/getSunShadeColor.glsl;
#include ../common/getSunReflection.glsl;
#include ../common/getSunReflectionColor.glsl;
#include ../common/getFogColor.glsl;

vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {
	// dir can be either a direction vector or a normal vector
	// upper-left 3x3 of matrix is assumed to be orthogonal

	return normalize((vec4( dir, 0.0) * matrix ).xyz);
}

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;
  float depth = -viewPosition.z;
  gl_Position = projectionMatrix * viewPosition;

  // Terrain datads
  vec4 terrainData = texture2D(uTexture, uv);
  vec3 normal = terrainData.rgb;

  // Slope
  float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

  vec3 viewDirection = normalize(worldPosition.xyz - cameraPosition);
  vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
  vec3 viewNormal = normalize(normalMatrix * normal);

  // Color
  vec3 color = vec3(0.3, 0.6, 0.3);

  // Sun shade
  float sunShade = getSunShade(normal);
  color = getSunShadeColor(color, sunShade);

  // Sun reflection
  float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
  color = getSunReflectionColor(color, sunReflection);

  // Fog
  vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
  color = getFogColor(color, depth, screenUv);

  vec3 dirtColor = vec3(0.3, 0.2, 0.1);
  color = mix(dirtColor, color, terrainData.g);
  
  // Shadow
  vec3 shadowWorldNormal = inverseTransformDirection(normal, viewMatrix);
  vec4 shadowWorldPosition = worldPosition + vec4(shadowWorldNormal * 0.05, 0.0);

  // Varyings
  vColor = color;
  vShadowCoord = uShadowMatrix * shadowWorldPosition; // 将顶点从模型空间转换到光源的裁剪空间
  vNormal = normal;
  vLightDirection = normalize(uSunPosition);
  vDistance = distance(uPlayerPosition.xz, worldPosition.xz);
}