import { ShaderMaterial, Uniform } from "three"

import vertexShader from "../shaders/terrain-material/vertex.glsl"
import fragmentShader from "../shaders/terrain-material/fragment.glsl"

export default class TerrainMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uPlayerPosition: new Uniform(null),
        uGradientTexture: new Uniform(null),
        uLightnessSmoothness: new Uniform(null),
        uFresnelOffset: new Uniform(null),
        uFresnelScale: new Uniform(null),
        uFresnelPower: new Uniform(null),
        uSunPosition: new Uniform(null),
        uFogTexture: new Uniform(null),
        uGrassDistance: new Uniform(null),
        uTexture: new Uniform(null)
      },
      vertexShader,
      fragmentShader
    })
  }
}
