import { ShaderMaterial, Uniform } from "three"

import vertexShader from "../shaders/terrain-material/vertex.glsl"
import fragmentShader from "../shaders/terrain-material/fragment.glsl"

export default class TerrainMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uPlayerPosition: new Uniform(null),
        uShadowMapTexture: new Uniform(null),
        uShadowMatrix: new Uniform(null),
        uSunPosition: new Uniform(null),
        uTexture: new Uniform(null),
        uIntensity: new Uniform(1)
      },
      vertexShader,
      fragmentShader,
    })
  }
}
