varying vec3 vColor;
varying float vIntensity;

void main() {
  gl_FragColor = vec4(vColor, vIntensity);
}