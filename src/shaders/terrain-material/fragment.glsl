uniform sampler2D uShadowMapTexture;

varying vec3 vColor;
varying vec4 vShadowCoord;
varying vec3 vNormal;
varying vec3 vLightDirection;
varying float vDistance;

// #include ../common/inverseLerp.glsl;
// #include ../common/remap.glsl;

// float unpackDepth(const in vec4 rgba_depth) {
//   const vec4 bit_shift = vec4(1.0 / (256.0 * 256.0 * 256.0),
//                               1.0 / (256.0 * 256.0),
//                               1.0 / 256.0,
//                               1.0);
//   float depth = dot(rgba_depth, bit_shift);
//   return depth;
// }

// float getShadow(vec4 shadowCoord) {
//   // 执行透视除法
//   vec3 projCoords = shadowCoord.xyz / shadowCoord.w;

//   // 检查是否在可见范围内
//   if(projCoords.x < 0.0 || projCoords.x > 1.0 || projCoords.y < 0.0 || projCoords.y > 1.0 || projCoords.z < 0.0 || projCoords.z > 1.0) {
//     return 1.0;
//   }

//   // 当前片元的深度值
//   float currentDepth = projCoords.z + 0.003; // 添加偏移量，防止阴影伪影

//   // 从阴影贴图中取样深度值
//   float closestDepth = unpackDepth(texture2D(uShadowMapTexture, projCoords.xy));

//   // 比较深度值，确定是否在阴影中
//   float shadow = currentDepth > closestDepth ? 0.0 : 1.0;

//   return shadow;
// }

const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

const vec3 PackFactors = vec3(256. * 256. * 256., 256. * 256., 256.);
const vec4 UnpackFactors = UnpackDownscale / vec4(PackFactors, 1.);

float unpackRGBAToDepth(const in vec4 v) {
  return dot(v, UnpackFactors);
}

float texture2DCompare(sampler2D depths, vec2 uv, float compare) {

  return step(compare, unpackRGBAToDepth(texture2D(depths, uv)));

}

float getShadow(sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float ndotl) {

  float shadow = 1.0; // 条件成立时，0.5 + 0.5 = 1，表示没有阴影。

  shadowCoord.xyz /= shadowCoord.w;
  shadowCoord.z += shadowBias;

  bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
  bool frustumTest = inFrustum && shadowCoord.z <= 1.0 && ndotl > 0.0 && vDistance < 16.0; // 远距离不绘制 shadowmap

  if(frustumTest) {
    vec2 texelSize = vec2(1.0) / shadowMapSize;

    float dx0 = -texelSize.x * shadowRadius;
    float dy0 = -texelSize.y * shadowRadius;
    float dx1 = +texelSize.x * shadowRadius;
    float dy1 = +texelSize.y * shadowRadius;
    float dx2 = dx0 / 2.0;
    float dy2 = dy0 / 2.0;
    float dx3 = dx1 / 2.0;
    float dy3 = dy1 / 2.0;

    shadow = (
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx0, dy0), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(0.0, dy0), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx1, dy0), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx2, dy2), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(0.0, dy2), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx3, dy2), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx0, 0.0), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx2, 0.0), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy, shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx3, 0.0), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx1, 0.0), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx2, dy3), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(0.0, dy3), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx3, dy3), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx0, dy1), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(0.0, dy1), shadowCoord.z) +
      texture2DCompare(shadowMap, shadowCoord.xy + vec2(dx1, dy1), shadowCoord.z)
      ) * (1.0 / 17.0);
  }

  return shadow;

}

void main() {
  // 计算法线与光照方向的点积
  float ndotl = dot(vNormal, vLightDirection);
  // 计算地平线与光照方向的点积
  float hdotl = dot(vec3(0.0, 1.0, 0.0), vLightDirection);
  // 黎明 & 黄昏
  float dusk = smoothstep(0.0, 0.2, hdotl);
  // 亮度
  float intensity = smoothstep(-1.5, 1.0, hdotl);

  float shadow = 0.0; // 默认地形全都有阴影

  if(ndotl > 0.1) {
    if(ndotl < 0.6) {
      shadow += ceil(ndotl / 0.4) * 0.4;
    } else {
      shadow += 1.0;
    }
  }

  shadow *= getShadow(uShadowMapTexture, vec2(2048.0), 0.0, 1.0, vShadowCoord, ndotl); // 玩家阴影
  shadow *= dusk;

  shadow = smoothstep(-1.0, 1.0, shadow);

  vec3 color = vColor * shadow * intensity;

  gl_FragColor = vec4(color, 1.0);
}