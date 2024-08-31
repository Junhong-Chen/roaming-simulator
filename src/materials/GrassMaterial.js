import { ShaderMaterial, Uniform } from "three"

import vertexShader from "../shaders/grass/vertex.glsl"
import fragmentShader from "../shaders/grass/fragment.glsl"

export default class GrassMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: new Uniform(null),
        uGrassDistance: new Uniform(null),
        uPlayerPosition: new Uniform(null),
        uTerrainSize: new Uniform(null),
        uTerrainTextureSize: new Uniform(null),
        uTerrainATexture: new Uniform(null),
        uTerrainAOffset: new Uniform(null),
        uTerrainBTexture: new Uniform(null),
        uTerrainBOffset: new Uniform(null),
        uTerrainCTexture: new Uniform(null),
        uTerrainCOffset: new Uniform(null),
        uTerrainDTexture: new Uniform(null),
        uTerrainDOffset: new Uniform(null),
        uNoiseTexture: new Uniform(null),
        uFresnelOffset: new Uniform(null),
        uFresnelScale: new Uniform(null),
        uFresnelPower: new Uniform(null),
        uSunPosition: new Uniform(null),
      },
      vertexShader,
      fragmentShader
    })
  }
}