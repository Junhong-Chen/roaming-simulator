uniform vec3 uPlayerPosition;
uniform float uLightnessSmoothness;
uniform float uFresnelOffset;
uniform float uFresnelScale;
uniform float uFresnelPower;
uniform vec3 uSunPosition;
uniform float uGrassDistance;
uniform sampler2D uTexture;
uniform sampler2D uFogTexture;

varying vec3 vColor;

#include ../common/inverseLerp.glsl
#include ../common/remap.glsl
#include ../common/getSunShade.glsl;
#include ../common/getSunShadeColor.glsl;
#include ../common/getSunReflection.glsl;
#include ../common/getSunReflectionColor.glsl;
#include ../common/getFogColor.glsl;
#include ../common/getGrassAttenuation.glsl;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  float depth = -viewPosition.z;
  gl_Position = projectionMatrix * viewPosition;

  // Terrain data
  vec4 terrainData = texture2D(uTexture, uv);
  vec3 normal = terrainData.rgb;

  // Slope
  float slope = 1.0 - abs(dot(vec3(0.0, 1.0, 0.0), normal));

  vec3 viewDirection = normalize(modelPosition.xyz - cameraPosition);
  vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
  vec3 viewNormal = normalize(normalMatrix * normal);

  // Color
  vec3 uGrassDefaultColor = vec3(0.3, 0.6, 0.3);
  // vec3 uGrassShadedColor = vec3(0.52 / 1.3, 0.65 / 1.3, 0.26 / 1.3);

  // Grass distance attenuation
  // Terrain must match the bottom of the grass which is darker
  // float grassDistanceAttenuation = getGrassAttenuation(modelPosition.xz);
  // float grassSlopeAttenuation = smoothstep(remap(slope, 0.4, 0.5, 1.0, 0.0), 0.0, 1.0);
  // float grassAttenuation = grassDistanceAttenuation * grassSlopeAttenuation;
  // vec3 grassColor = mix(uGrassShadedColor, uGrassDefaultColor, 1.0 - grassAttenuation);

  vec3 color = uGrassDefaultColor;

  // Sun shade
  float sunShade = getSunShade(normal);
  color = getSunShadeColor(color, sunShade);

  // Sun reflection
  float sunReflection = getSunReflection(viewDirection, worldNormal, viewNormal);
  color = getSunReflectionColor(color, sunReflection);

  // Fog
  vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
  color = getFogColor(color, depth, screenUv);

  // vec3 dirtColor = vec3(0.3, 0.2, 0.1);
  // vec3 color = mix(dirtColor, grassColor, terrainData.g);

  // Varyings
  vColor = color;
}