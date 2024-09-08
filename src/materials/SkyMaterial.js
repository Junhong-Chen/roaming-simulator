import { BackSide, ShaderMaterial, Uniform, Vector3 } from "three"

import vertexShader from "../shaders/sky/vertex.glsl"
import fragmentShader from "../shaders/sky/fragment.glsl"

export default class SkyMaterial extends ShaderMaterial {
  constructor() {
    super({
      name: 'SkyMaterial',
      uniforms:
      {
        turbidity: new Uniform(2), // 大气浑浊度，影响光线的散射程度
        rayleigh: new Uniform(3), // 瑞利散射的系数，模拟小颗粒对光线的散射
        mieCoefficient: new Uniform(0.005), // 米氏散射系数，模拟大颗粒对光线的散射
        mieDirectionalG: new Uniform(0.77), // 控制米氏散射的方向性
        sunPosition: new Uniform(new Vector3()),
        up: new Uniform(new Vector3(0, 1, 0))
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
			side: BackSide,
			depthWrite: false
    })
  }
}