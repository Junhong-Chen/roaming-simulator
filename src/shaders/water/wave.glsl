const float PI = 3.141592653589793238462643383279502884197169;

// uniform sampler2D uWaveTexture; // 注入的变量默认被申明
uniform vec2 uPlayerUv;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 s = 1.0 / resolution; // 纹理像素位移偏移量

  vec4 t = texture(uWaveTexture, uv);

  // 获取相邻的上下左右的像素值
  float up = texture(uWaveTexture, uv + vec2(0.0, s.y)).r;
  float down = texture(uWaveTexture, uv - vec2(0.0, s.y)).r;
  float left = texture(uWaveTexture, uv - vec2(s.x, 0.0)).r;
  float right = texture(uWaveTexture, uv + vec2(s.x, 0.0)).r;

  float decay = 0.925;
  float wave = ((up + down + left + right) * 0.5 - t.g) * decay;

  // 角色移动
  if((length(uPlayerUv - uv) < s.x) && t.ba != uPlayerUv) { // 玩家 uv 和纹理 uv 足够接近
    wave = .5;
  }
  t.ba = uPlayerUv; // 保存当前玩家位置

  t.g = t.r; // g 为上一帧的值，r 为当前帧的值
  t.r = wave;

  gl_FragColor = t;
}