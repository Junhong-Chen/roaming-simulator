uniform vec3 uPlayerPosition;
uniform vec3 uSunPosition;
uniform sampler2D uTexture;
uniform mat4 uShadowMatrix;

varying vec3 vColor;
varying vec4 vShadowCoord;
varying vec3 vNormal;
varying vec3 vLightDirection;
varying float vDistance;
varying float vNdotL;
varying float vNdotUp;
varying float vElevation;
varying vec3 vFogColor;
varying float vFogIntensity;

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
  vDistance = distance(uPlayerPosition.xz, worldPosition.xz);
  vFogColor = vec3(0.5) * smoothstep(250.0, 500.0, max(0.0, vDistance - 250.0));
  vFogIntensity = 1.0 - exp(-0.001 * 0.001 * depth * depth);

  // Shadow
  vec4 shadowWorldPosition = worldPosition + vec4(viewNormal * 0.05, 0.0);
  vShadowCoord = uShadowMatrix * shadowWorldPosition; // 将顶点从模型空间转换到光源的裁剪空间

  vColor = color;
  vNormal = normal;
  vLightDirection = normalize(uSunPosition);
  vNdotL = dot(normal, vLightDirection);
  vNdotUp = dot(normal, vec3(0.0, 1.0, 0.0));
  vElevation = terrainData.a;
}