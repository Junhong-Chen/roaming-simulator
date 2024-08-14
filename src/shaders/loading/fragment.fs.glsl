precision mediump float;

uniform float uAlpha;

void main() {
  vec3 color = vec3(0.);

  gl_FragColor = vec4(color, uAlpha);
}