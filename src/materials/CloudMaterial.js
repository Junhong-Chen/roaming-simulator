import { AdditiveBlending, BackSide, Color, ShaderMaterial, Uniform, Vector3 } from "three"
import vertexShader from "../shaders/cloud/vertex.glsl"
import fragmentShader from "../shaders/cloud/fragment.glsl"

export default class CloudMaterial extends ShaderMaterial {
  constructor() {
    super({
      name: 'CloudMaterial',
      uniforms: {
        time: new Uniform(0),
        cloudColor: new Uniform(new Color(0xffffff)), // Cloud color
        skyColor: new Uniform(new Color(0x87CEEB)), // Sky color (light blue)
        noiseScale: new Uniform(20), // Scale of the noise, adjust this for cloud size
        cameraPosition: new Uniform(new Vector3()),
      },
      vertexShader,
      fragmentShader,
      side: BackSide,
      transparent: true,
			depthWrite: false,
      blending: AdditiveBlending
    })
  }
}