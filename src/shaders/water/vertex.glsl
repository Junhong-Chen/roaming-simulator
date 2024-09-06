uniform mat4 textureMatrix;

varying vec4 mirrorCoord;
varying vec2 vUv;

#include <common>
varying vec4 worldPosition;
#include <fog_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  mirrorCoord = textureMatrix * modelMatrix * vec4(position, 1.0);
  worldPosition = mirrorCoord.xyzw;
  vUv = uv;

  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <logdepthbuf_vertex>
  #include <fog_vertex>
  #include <shadowmap_vertex>
}