uniform mat4 textureMatrix;

varying vec4 vMirrorCoord;
varying vec4 vWorldPosition;
varying vec2 vUv;

#include <common>
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;

  vWorldPosition = worldPosition;
  vMirrorCoord = textureMatrix * worldPosition;
  vUv = uv;

  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <logdepthbuf_vertex>
  #include <fog_vertex>
  #include <shadowmap_vertex>
}