import { Mesh, PlaneGeometry, RawShaderMaterial, Uniform } from "three"

import vertexShader from "../shaders/mask/vertex.vs.glsl"
import fragmentShader from "../shaders/mask/fragment.fs.glsl"

export default class Mask extends Mesh {
  constructor(view) {
    super(
      new PlaneGeometry(2, 2, 1, 1),
      new RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uAlpha: new Uniform(1)
        },
        transparent: true,
        depthWrite: false,
      })
    )

    view.scene.add(this)
  }
}