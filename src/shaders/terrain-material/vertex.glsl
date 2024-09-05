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
varying float vLdotUp;
varying float vNdotL;
varying float vNdotUp;
varying float vElevation;
varying vec3 vFogColor;
varying float vFogIntensity;

vec3 getFogColor(vec2 screenUv) {
  vec3 fogColor = texture2D(uFogTexture, screenUv).rgb;

  return fogColor;
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

  // Soil
  vec3 dirtColor = vec3(0.1, 0.1, 0.1);
  color = mix(dirtColor, color, terrainData.g);

  // Varyings
  // Fog
  vec2 screenUv = (gl_Position.xy / gl_Position.w * 0.5) + 0.5;
  vFogColor = getFogColor(screenUv);
  vFogIntensity = 1.0 - exp(-0.001 * 0.001 * depth * depth);

  // Shadow
  vec4 shadowWorldPosition = worldPosition + vec4(viewNormal * 0.05, 0.0);
  vShadowCoord = uShadowMatrix * shadowWorldPosition; // 将顶点从模型空间转换到光源的裁剪空间

  vColor = color;
  vNormal = normal;
  vLightDirection = normalize(uSunPosition);
  vDistance = distance(uPlayerPosition.xz, worldPosition.xz);
  vLdotUp = dot(vec3(0.0, 1.0, 0.0), vLightDirection); // 计算地平线与光照方向的点积
  vNdotL = dot(normal, vLightDirection);
  vNdotUp = dot(normal, vec3(0.0, 1.0, 0.0));
  vElevation = terrainData.a;
}