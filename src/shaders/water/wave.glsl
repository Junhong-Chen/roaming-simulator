precision highp float;

// uniform sampler2D uWaveTexture; // 注入的变量默认被申明
uniform vec2 uOffsetUv;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 oUv = uv + uOffsetUv;
  vec2 p = 1.0 / resolution; // 单个像素大小

  vec4 t = texture(uWaveTexture, oUv);

  // 获取相邻的上下左右的像素值
  float up = texture(uWaveTexture, oUv + vec2(0.0, p.y)).r;
  float down = texture(uWaveTexture, oUv - vec2(0.0, p.y)).r;
  float left = texture(uWaveTexture, oUv - vec2(p.x, 0.0)).r;
  float right = texture(uWaveTexture, oUv + vec2(p.x, 0.0)).r;

  float decay = 0.9;
  float wave = ((up + down + left + right) * 0.5 - t.g) * decay;

  // 角色移动
  if((length(vec2(.5) - uv) < p.x * 4.) && t.ba != uOffsetUv) { // 由中心点开始散播值
    wave = 1.;
  }

  t.g = t.r; // g 为上一帧的值，r 为当前帧的值
  t.r = wave;
  t.ba = uOffsetUv; // 保存当前偏移量

  gl_FragColor = t;
}