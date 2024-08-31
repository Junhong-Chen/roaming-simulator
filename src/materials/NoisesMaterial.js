import { ShaderMaterial } from "three"

import vertexShader from "../shaders/noises/vertex.glsl"
import fragmentShader from "../shaders/noises/fragment.glsl"

export default class NoisesMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {},
      vertexShader,
      fragmentShader
    })
  }
}