uniform sampler2D mirrorSampler;
uniform float alpha;
uniform float time;
uniform float size;
uniform float distortionScale;
uniform sampler2D normalSampler;
uniform vec3 eye;
uniform float uIntensity;

varying vec4 vMirrorCoord;
varying vec4 vWorldPosition;
varying vec2 vUv;

vec4 getNoise(vec2 uv, float time) {
  // 避免时间增长导致噪声变化变小
  time = (sin(time * .01)) * 10.;

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

void main() {

  #include <logdepthbuf_fragment>
  vec4 noise = getNoise(vWorldPosition.xz * size, time);
  vec3 surfaceNormal = normalize(noise.xzy * vec3(1.5, 1.0, 1.5));

  vec3 worldToEye = eye - vMirrorCoord.xyz;

  float d = length(worldToEye);

  float t = 1.0 - clamp(0.0001 / distance(vUv, vec2(0.5)) - 0.5, 0.0, 1.0); // 角色倒影偏离矫正
  vec2 distortion = surfaceNormal.xz * (0.001 + 1.0 / d) * distortionScale * t;
  vec3 reflectionSample = vec3(texture2D(mirrorSampler, vMirrorCoord.xy / vMirrorCoord.w + distortion));

  float spray = 1. - dot(surfaceNormal, vec3(0., 1., 0.));
  spray = step(.1, spray) * smoothstep(-.5, 1.2, uIntensity);

  vec3 color = reflectionSample + spray;

  gl_FragColor = vec4(color, alpha);
}