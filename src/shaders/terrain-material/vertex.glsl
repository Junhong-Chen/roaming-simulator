uniform vec3 uPlayerPosition;
uniform vec3 uSunPosition;
uniform sampler2D uTexture;
uniform sampler2D uFogTexture;
uniform mat4 uShadowMatrix;

varying vec3 vColor;
varying vec4 vShadowCoord;
varying vec3 vNormal;
varying vec3 vLightDirection;
varying float vDistance;

vec3 getFogColor(vec3 baseColor, float depth, vec2 screenUv) {
  float uFogIntensity = 0.0025;
  vec3 fogColor = texture2D(uFogTexture, screenUv).rgb;

  float fogIntensity = 1.0 - exp(-uFogIntensity * uFogIntensity * depth * depth);
  return mix(baseColor, fogColor, fogIntensity);
}

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;
  float depth = -viewPosition.z;
  gl_Position = projectionMatrix * viewPosition;

  // Terrain datads
  vec4 terrainData = texture2D(uTexture, uv);
  vec3 normal = terrainData.rgb;

  vec3 viewNormal = normalize(normalMatrix * normal);

  // Color
  vec3 color = vec3(0.3, 0.6, 0.3);

  // Fog
  vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
  color = getFogColor(color, depth, screenUv);

  // Soil
  vec3 dirtColor = vec3(0.3, 0.2, 0.1);
  color = mix(dirtColor, color, terrainData.g);
  
  // Shadow
  vec4 shadowWorldPosition = worldPosition + vec4(viewNormal * 0.05, 0.0);

  // Varyings
  vColor = color;
  vShadowCoord = uShadowMatrix * shadowWorldPosition; // 将顶点从模型空间转换到光源的裁剪空间
  vNormal = normal;
  vLightDirection = normalize(uSunPosition);
  vDistance = distance(uPlayerPosition.xz, worldPosition.xz);
}