uniform float near;
uniform float far;

varying vec4 vPosition;

#include <packing>

float getDepth(float zNDC) {
  float zView = (2.0 * far * near) / (zNDC * (far - near) - (far + near));
  float depth = (zView + near) / (far - near);
  return -depth;
}

void main() {
  float depth = getDepth(vPosition.z / vPosition.w);
  gl_FragColor = packDepthToRGBA(depth); // 将深度值编码为 RGBA 值
}