// uniform vec3 cameraPosition;

varying vec3 vRd;
varying vec2 vUv;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vRd = normalize(worldPosition.xyz - cameraPosition);
  vUv = uv;
}