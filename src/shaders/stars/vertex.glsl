#define M_PI 3.1415926535897932384626433832795

uniform vec3 uSunPosition;
uniform float uSize;
uniform float uBrightness;
uniform float uHeightFragments;

attribute float aSize;
attribute vec3 aColor;

varying vec3 vColor;
varying float vIntensity;

void main() {
  // Vertex position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // Sun size multiplier
  vec3 normalizedPosition = normalize(modelPosition.xyz);
  vIntensity = 1.0 - (dot(normalize(uSunPosition), normalizedPosition) * 0.5 + 0.5);

  gl_PointSize = aSize * uSize * uHeightFragments;

  // Clip out if too small
  // if(gl_PointSize < 0.1)
  //   gl_Position = vec4(2.0, 2.0, 2.0, 1.0);

  vColor = mix(aColor, vec3(1.0), uBrightness);
}