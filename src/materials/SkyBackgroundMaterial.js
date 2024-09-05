import { ShaderMaterial, Uniform } from "three"

import vertexShader from "../shaders/sky-background/vertex.glsl"
import fragmentShader from "../shaders/sky-background/fragment.glsl"

export default class SkyBackgroundMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms:
      {
        uInverse: new Uniform(false),
        uTexture: new Uniform(null)
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    })
  }
}