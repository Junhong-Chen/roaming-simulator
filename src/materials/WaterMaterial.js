import { FrontSide, Matrix4, ShaderMaterial, Uniform, UniformsLib, UniformsUtils, Vector2, Vector3 } from "three"

import vertexShader from "../shaders/water/vertex.glsl"
import fragmentShader from "../shaders/water/fragment.glsl"

export default class WaterMaterial extends ShaderMaterial {
  constructor(options) {
    super({
      name: 'WaterMaterial',
      uniforms: UniformsUtils.merge([
        UniformsLib['lights'],
        {
          normalSampler: new Uniform(null),
          depthSampler: new Uniform(null),
          mirrorSampler: new Uniform(null),
          alpha: new Uniform(0.75),
          time: new Uniform(0),
          size: new Uniform(1),
          distortionScale: new Uniform(0.01), // 倒影失真系数
          textureMatrix: new Uniform(new Matrix4()),
          eye: new Uniform(new Vector3()),
          near: new Uniform(1),
          far: new Uniform(1000),
          intensity: new Uniform(1),
          waveTexture: new Uniform(null),
          waveSize: new Uniform(1),
          waveScale: new Uniform(1),
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