uniform sampler2D normalSampler;
uniform sampler2D depthSampler;
uniform sampler2D mirrorSampler;
uniform float alpha;
uniform float time;
uniform float size;
uniform float distortionScale;
uniform vec3 eye;
uniform float intensity;
uniform sampler2D waveTexture;
uniform float waveSize;
uniform float waveScale;
uniform float near;
uniform float far;

varying vec4 vMirrorCoord;
varying vec4 vWorldPosition;
varying vec4 vPosition;
varying vec2 vUv;

#include <packing>

vec4 normalNoise(vec2 uv, float time) {

  vec2 uv0 = (uv / 103.0) + vec2(time / 17.0, time / 29.0);
  vec2 uv1 = uv / 107.0 - vec2(time / -19.0, time / 31.0);
  vec2 uv2 = uv / vec2(8907.0, 9803.0) + vec2(time / 101.0, time / 97.0);
  vec2 uv3 = uv / vec2(1091.0, 1027.0) - vec2(time / 109.0, time / -113.0);

  // 叠加多个噪声纹理增加复杂性
  vec4 noise = texture2D(normalSampler, uv0) +
               texture2D(normalSampler, uv1) +
               texture2D(normalSampler, uv2) +
               texture2D(normalSampler, uv3);

  return noise * 0.5 - 1.0;
}

// 双线性插值使涟漪平滑过渡
vec4 bilinearInterpolation(sampler2D t, vec2 uv, float texelSize) {
  // 计算纹理坐标所在像素的左下角坐标
  vec2 uvMin = floor(uv / texelSize) * texelSize;
  // 计算右上角的偏移坐标
  vec2 uvMax = uvMin + vec2(texelSize, texelSize);
  
  // 计算插值权重
  vec2 f = (uv - uvMin) / texelSize;
  
  // 获取四个邻近像素的颜色值
  float bl = texture2D(t, uvMin).r; // 左下
  float br = texture2D(t, vec2(uvMax.x, uvMin.y)).r; // 右下
  float tl = texture2D(t, vec2(uvMin.x, uvMax.y)).r; // 左上
  float tr = texture2D(t, uvMax).r; // 右上

  float bottom = mix(bl, br, f.x); // 对 x 方向进行线性插值
  float top = mix(tl, tr, f.x);    // 对 x 方向进行线性插值
  return vec4(mix(bottom, top, f.y)); // 对 y 方向进行线性插值
}

// 将深度值转为线性
float NDCToLinear(float zNDC) {
  float zView = (2.0 * far * near) / (zNDC * (far - near) - (far + near));
  return -zView;
}

void main() {
  vec4 noise = normalNoise(vWorldPosition.xz * size, time * .1);
  vec3 surfaceNormal = normalize(noise.xzy * vec3(1.5, 1.0, 1.5));

  float intensity = smoothstep(-.5, 1.2, intensity);

  // 浪花
  float spray = surfaceNormal.x > .3 ? 1. : 0.;

  // 岸边
  float boundry;
  if (spray <= 0.) {
    float z = vPosition.z / vPosition.w;
    float depth = NDCToLinear(z);

    vec3 pos = vPosition.xyz / vPosition.w * 0.5 + 0.5;
    float depthSample = unpackRGBAToDepth(texture2D(depthSampler, pos.xy)); // 将 RGBA 值还原为深度值
    float sceneDepth = depthSample * (far - near) + near;
    float diffDepth = sceneDepth - depth;

    // [0, 0.3] => [0, 1]
    boundry = clamp(diffDepth / .3, 0., 1.);
    boundry = surfaceNormal.x > boundry ? 1. : 0.;
  }

  // 涟漪
  float wave;
  vec2 minUv = vec2(0.5 - waveScale);
  vec2 maxUv = vec2(1.0 - minUv.x, 1.0 - minUv.y);

  // 判断当前 UV 是否在中心区域内
  if (spray + boundry <= 0. && vUv.x > minUv.x && vUv.x < maxUv.x && vUv.y > minUv.y && vUv.y < maxUv.y) {
    // 将中心区域的 UV 映射到 [0, 1] 范围内
    vec2 centeredUv = (vUv - minUv) / (maxUv - minUv);

    float wCell = 1. / waveSize; // 涟漪纹理单个像素的大小

    wave = bilinearInterpolation(waveTexture, centeredUv, wCell).r;

    // 截取值范围
    float minRange = 0.1;
    float maxRange = 0.2;
    wave = clamp((wave - minRange) / (maxRange - minRange), 0.0, 1.0);
    wave = step(minRange, wave);
  }

  // 倒影
  vec3 reflectionSample = vec3(0.);
  if (wave + spray + boundry <= 0.) {
    float t = 1.0 - clamp(0.0001 / distance(vUv, vec2(0.5)) - 0.5, 0.0, 1.0); // 角色倒影偏离矫正
    vec2 distortion = surfaceNormal.xz * distortionScale * t;
    reflectionSample = vec3(texture2D(mirrorSampler, vMirrorCoord.xy / vMirrorCoord.w + distortion));
  }

  vec3 color = reflectionSample + (spray + wave + boundry) * intensity;

  gl_FragColor = vec4(color, alpha);
}