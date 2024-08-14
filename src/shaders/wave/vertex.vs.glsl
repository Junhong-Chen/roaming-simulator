uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying float vTime;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  modelPosition.x += sin(modelPosition.z * uFrequency.x + uTime) * 0.1;
  modelPosition.z += cos(modelPosition.x * uFrequency.y + uTime) * 0.1;

  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;

  vUv = uv;
  vTime = uTime;
}