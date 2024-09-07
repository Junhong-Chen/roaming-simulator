precision highp float;

// Uniform 变量，需要从主程序中传递
uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;

varying vec3 vRd;

// 生成二维旋转矩阵
mat2 mm2(in float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

// 定义一个旋转矩阵，固定角度
mat2 m2 = mat2(0.95534, 0.29552, -0.29552, 0.95534);

// 三角波函数，用于生成纹理
float tri(in float x) {
  return clamp(abs(fract(x) - .5), 0.01, 0.49);
}

// 生成二维三角波纹理
vec2 tri2(in vec2 p) {
  return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x)));
}

// 生成二维三角噪声纹理，并进行多次迭代来模拟极光纹理
float triNoise2d(in vec2 p, float spd) {
  float z = 1.8;  // 控制噪声的缩放因子
  float z2 = 2.5; // 控制噪声的缩放因子
  float rz = 0.; // 最终噪声值
  p *= mm2(p.x * 0.06); // 旋转变换
  vec2 bp = p; // 保存原始坐标
  for(float i = 0.; i < 5.; i++) {
    vec2 dg = tri2(bp * 1.85) * .75; // 生成三角波
    dg *= mm2(uTime * spd); // 旋转并随时间变化
    p -= dg / z2;

    bp *= 1.3;
    z2 *= .45;
    z *= .42;
    p *= 1.21 + (rz - 1.0) * .02;

    rz += tri(p.x + tri(p.y)) * z; // 累加噪声值
    p *= -m2; // 再次旋转
  }
  return clamp(1. / pow(rz * 29., 1.3), 0., .55); // 返回最终噪声值
}

// 生成简单的二维随机数，用于扰动
float hash21(in vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

// 极光生成函数
vec4 aurora(vec3 ro, vec3 rd) {
  vec4 color = vec4(0);
  vec4 avgCol = vec4(0); // 平均颜色
  vec3 mixCol = 1. - vec3(2.15, -.75, 1.2); // 混合基色
  float rdFactor = rd.y * 2. + .4;
  float rf = hash21(gl_FragCoord.xy); // 随机值

  for(float i = 0.; i < 37.; i++) // 循环叠加颜色、循环次数越多，效果越逼真
  {
    float of = .006 * rf * smoothstep(0., 15., i); // 随机偏移
    float pt = ((.8 + pow(i, 1.4) * .002) - ro.y) / rdFactor; // 计算光线步长
    pt -= of;
    vec3 bpos = ro + pt * rd; // 计算光线位置
    vec2 p = bpos.zx;
    float rzt = triNoise2d(p, .06); // 获取噪声值
    vec4 col = vec4(0, 0, 0, rzt); // 设置颜色透明度
    col.rgb = (sin(mixCol + i * .06) * .5 + .5) * rzt; // 对颜色进行偏移
    avgCol = avgCol * .5 + col * .5; // 混合颜色 mix(avgCol, col, .5)
    color += avgCol * exp2(-i * .065 - 2.5) * smoothstep(0., 5., i); // 累加颜色
  }

  color *= clamp(rd.y * 15. + .4, 0., 1.) * 1.8; // 颜色调整
  return color;
}

// 生成三维随机数，用于背景星星的生成
vec3 nmzHash33(vec3 q) {
  uvec3 p = uvec3(ivec3(q));
  p = p * uvec3(374761393U, 1103515245U, 668265263U) + p.zxy + p.yzx;
  p = p.yzx * (p.zxy ^ (p >> 3U));
  return vec3(p ^ (p >> 16U)) * (1.0 / vec3(0xffffffffU));
}

// 星星背景生成函数
vec3 stars(in vec3 p) {
  vec3 c = vec3(0.); // 初始化颜色
  float res = uResolution.x * 1.; // 获取分辨率

  for(float i = 0.; i < 4.; i++) {
    vec3 q = fract(p * (.15 * res)) - 0.5; // 生成星星的位置
    vec3 id = floor(p * (.15 * res)); // 获取星星的id
    vec2 rn = nmzHash33(id).xy; // 生成随机数
    float c2 = 1. - smoothstep(0., .6, length(q)); // 设置星星亮度
    c2 *= step(rn.x, .0005 + i * i * 0.001); // 调整星星数量
    c += c2 * (mix(vec3(1.0, 0.49, 0.1), vec3(0.75, 0.9, 1.), rn.y) * 0.1 + 0.9); // 混合颜色
    p *= 1.3; // 调整位置
  }
  return c * c * .8; // 返回星星颜色
}

// 背景生成函数
vec3 bg(in vec3 rd) {
  float sd = dot(normalize(vec3(-0.5, -0.6, 0.9)), rd) * 0.5 + 0.5; // 计算背景颜色混合比例
  sd = pow(sd, 5.); // 调整混合比例
  vec3 col = mix(vec3(0.05, 0.1, 0.2), vec3(0.1, 0.05, 0.2), sd); // 生成背景颜色
  return col * .63; // 返回背景颜色
}

void main() {
  vec3 ro = vec3(0.); // 光线起点
  vec3 rd = vRd; // 光线方向

  vec3 color = vec3(0.); // 初始化颜色
  float fade = smoothstep(0., 0.01, abs(rd.y)) * 0.1 + 0.9; // 计算淡化效果

  // color = bg(rd) * fade; // 添加背景色

  float nightI = .25;
  if(rd.y > 0. && uIntensity < nightI) { // 如果光线朝向天空 & 夜晚
    vec4 aur = smoothstep(0., 1.5, aurora(ro, rd)) * fade; // 生成极光
    // color += stars(rd); // 添加星星
    color = aur.rgb * smoothstep(nightI, 0., uIntensity); // 混合极光和背景颜色
  }

  gl_FragColor = vec4(color, 1.);
}