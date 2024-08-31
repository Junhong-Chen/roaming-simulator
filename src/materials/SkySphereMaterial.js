import { ShaderMaterial, Uniform, Vector3, Color } from "three"

import vertexShader from "../shaders/sky-sphere/vertex.glsl"
import fragmentShader from "../shaders/sky-sphere/fragment.glsl"

export default class SkySphereMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms:
      {
        uSunPosition: new Uniform(new Vector3()),
        uAtmosphereElevation: new Uniform(0.5),
        uAtmospherePower: new Uniform(10),
        uColorDayCycleLow: new Uniform(new Color()),
        uColorDayCycleHigh: new Uniform(new Color()),
        uColorNightLow: new Uniform(new Color()),
        uColorNightHigh: new Uniform(new Color()),
        uDawnAngleAmplitude: new Uniform(1),
        uDawnElevationAmplitude: new Uniform(0.2),
        uColorDawn: new Uniform(new Color()),
        uSunAmplitude: new Uniform(0.75),
        uSunMultiplier: new Uniform(1),
        uColorSun: new Uniform(new Color()),
        uDayCycleProgress: new Uniform(0)
      },
      vertexShader,
      fragmentShader
    })
  }
}
