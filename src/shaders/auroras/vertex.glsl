uniform vec3 uCameraPosition;

varying vec3 vWorldPosition;
varying vec3 vRd;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position.z = gl_Position.w; // set z to camera.far

  vWorldPosition = worldPosition.xyz;
  vRd = normalize(worldPosition.xyz - uCameraPosition);
}