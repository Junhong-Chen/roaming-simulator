import { Color, FrontSide, Matrix4, ShaderMaterial, Uniform, UniformsLib, UniformsUtils, Vector3 } from "three"

import vertexShader from "../shaders/water/vertex.glsl"
import fragmentShader from "../shaders/water/fragment.glsl"

export default class WaterMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      name: 'WaterMaterial',
      uniforms: UniformsUtils.merge([
        UniformsLib['fog'],
        UniformsLib['lights'],
        {
          'normalSampler': new Uniform(null),
          'mirrorSampler': new Uniform(null),
          'alpha': new Uniform(1),
          'time': new Uniform(0),
          'size': new Uniform(1),
          'distortionScale': new Uniform(20.0),
          'textureMatrix': new Uniform(new Matrix4()),
          'sunColor': new Uniform(new Color(0x7F7F7F)),
          'sunDirection': new Uniform(new Vector3(0.70707, 0.70707, 0)),
          'eye': new Uniform(new Vector3()),
          'waterColor': new Uniform(new Color(0x555555))
        }
      ]),
      vertexShader,
      fragmentShader,
      transparent: true,
			lights: true,
			side: FrontSide,
      ...options
    })
  }
}