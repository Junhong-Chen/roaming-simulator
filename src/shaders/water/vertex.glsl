uniform mat4 textureMatrix;

varying vec4 vMirrorCoord;
varying vec4 vWorldPosition;
varying vec2 vUv;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;

  vWorldPosition = worldPosition;
  vMirrorCoord = textureMatrix * worldPosition;
  vUv = uv;
}