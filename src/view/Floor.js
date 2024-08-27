import { DoubleSide, Mesh, RawShaderMaterial, RingGeometry, Vector2 } from "three"
import vertexShader from "../shaders/wave/vertex.vs.glsl"
import fragmentShader from "../shaders/wave/fragment.fs.glsl"
import Debugger from "../utils/Debugger"

export default class Floor {
  constructor(view) {
    this.view = view

    this.geometry = new RingGeometry(2, 1, 128)
    this.material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uFrequency: { value: new Vector2(2, 2) },
        uTime: { value: view.clock.elapsed },
      }
    })

    this.mesh = new Mesh(
      this.geometry,
      this.material
    )
    this.mesh.rotation.x = -Math.PI / 2
    view.scene.add(this.mesh)

    this.debug()
  }

  update(_, elapsedTime) {
    this.material.uniforms.uTime.value = elapsedTime

    const dataArray = this.view.music.analyser
    const bufferLength = dataArray.length
    if (bufferLength) {
      // magic number
      // const amplitude = 1 + dataArray.reduce((p, c) => p + c) / bufferLength / 512
      const amplitude = 1 + dataArray[8] / 512
      this.mesh.scale.set(amplitude, amplitude, 0)
    }
  }

  debug() {
    if (Debugger.gui) {
      const folder = Debugger.gui.addFolder('WAVE')
      folder.add(this.material.uniforms.uFrequency.value, 'x').min(0).max(4).step(1).name('frequencyX')
      folder.add(this.material.uniforms.uFrequency.value, 'y').min(0).max(4).step(1).name('frequencyY')
    }
  }

  destroy() { }
}