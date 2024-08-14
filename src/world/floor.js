import { DoubleSide, Mesh, RawShaderMaterial, RingGeometry, Vector2 } from "three"
import vertexShader from "../shaders/wave/vertex.vs.glsl"
import fragmentShader from "../shaders/wave/fragment.fs.glsl"
import Debugger from "@/utils/debugger"

export default class Floor {
  constructor(world) {

    const geometry = new RingGeometry(2, 1, 128)
    const material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uFrequency: { value: new Vector2(2, 2) },
        uTime: { value: world.time.elapsed },
      }
    })

    if (Debugger.gui) {
      const folder = Debugger.gui.addFolder('WAVE')
      folder.add(material.uniforms.uFrequency.value, 'x').min(0).max(4).step(1).name('frequencyX')
      folder.add(material.uniforms.uFrequency.value, 'y').min(0).max(4).step(1).name('frequencyY')
    }

    const plane = new Mesh(
      geometry,
      material
    )
    plane.rotation.x = -Math.PI / 2
    world.scene.add(plane)

    world.time.on('tick', ({ elapsedTime }) => {
      material.uniforms.uTime.value = elapsedTime

      const dataArray = world.music.analyser
      const bufferLength = dataArray.length
      if (bufferLength) {
        // magic number
        // const amplitude = 1 + dataArray.reduce((p, c) => p + c) / bufferLength / 512
        const amplitude = 1 + dataArray[8] / 512
        plane.scale.set(amplitude, amplitude, 0)
      }
    })
  }
}