precision mediump float;

varying float vTime;
varying vec2 vUv;

void main() {
  vec3 color = vec3(.0);
  color = vec3(vUv, abs(sin(vTime)));

  gl_FragColor = vec4(color * 0.5 + 0.3, 1.0);
}