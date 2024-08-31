import { ShaderMaterial, Uniform } from "three"

import vertexShader from "../shaders/player/vertex.glsl"
import fragmentShader from "../shaders/player/fragment.glsl"

export default class PlayerMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms:
      {
        uSunPosition: new Uniform(null)
      },
      vertexShader,
      fragmentShader
    })
  }
}
