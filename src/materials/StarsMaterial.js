import { ShaderMaterial, Uniform, Vector3, Color } from "three"

import vertexShader from "../shaders/stars/vertex.glsl"
import fragmentShader from "../shaders/stars/fragment.glsl"

export default class StarsMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms:
      {
        uSunPosition: new Uniform(new Vector3()),
        uSize: new Uniform(0.01),
        uBrightness: new Uniform(0.5),
        uHeightFragments: new Uniform(null)
      },
      vertexShader,
      fragmentShader
    })
  }
}
