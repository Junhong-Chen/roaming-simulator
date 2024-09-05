uniform sampler2D uTexture;
uniform bool uInverse;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  if (uInverse) { // 生成水面反射纹理
    uv = 1.0 - vUv;
  }

  vec3 color = texture2D(uTexture, uv).rgb;
  gl_FragColor = vec4(color, 1.0);
}