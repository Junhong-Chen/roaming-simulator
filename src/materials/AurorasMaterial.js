import { AdditiveBlending, BackSide, DoubleSide, Matrix4, ShaderMaterial, Uniform, Vector2, Vector3 } from "three"

import vertexShader from "../shaders/auroras/vertex.glsl"
import fragmentShader from "../shaders/auroras/fragment.glsl"

export default class AurorasMaterial extends ShaderMaterial {
  constructor() {
    super({
      name: 'AurorasMaterial',
      uniforms:
      {
        uResolution: new Uniform(new Vector2()),
        uTime: new Uniform(0),
        uMouse: new Vector2(0.5),
        uCameraPosition: new Uniform(new Vector3()),
        uIntensity: new Uniform(0)
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
			side: BackSide,
			depthWrite: false,
      blending: AdditiveBlending
    })
  }
}