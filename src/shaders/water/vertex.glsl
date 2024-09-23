uniform mat4 textureMatrix;
uniform float time;

varying vec4 vMirrorCoord;
varying vec4 vWorldPosition;
varying vec4 vPosition;
varying vec2 vUv;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  worldPosition.y += sin(worldPosition.y * 2. + time) * .01;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;

  vWorldPosition = worldPosition;
  vMirrorCoord = textureMatrix * worldPosition;
  vPosition = gl_Position;
  vUv = uv;
}