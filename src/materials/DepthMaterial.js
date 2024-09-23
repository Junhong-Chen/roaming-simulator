import { ShaderMaterial, Uniform } from "three"

import vertexShader from "../shaders/depth/vertex.glsl"
import fragmentShader from "../shaders/depth/fragment.glsl"

export default class DepthMaterial extends ShaderMaterial {
  constructor() {
    super({
      name: 'DepthMaterial',
      uniforms: {
        near: new Uniform(1),
        far: new Uniform(1000),
      },
      vertexShader,
      fragmentShader,
    })
  }
}