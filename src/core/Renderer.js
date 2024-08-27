import { WebGLRenderer } from "three"

export default class Renderer extends WebGLRenderer {
  constructor() {
    super({ antialias: true })

    this.shadowMap.enabled = true

    document.body.appendChild(this.domElement)
  }

  update(scene, camera) {
    this.render(scene, camera)
  }

  resize(width, height, pixelRatio) {
    this.setSize(width, height)
    this.setPixelRatio(pixelRatio)
  }

  destroy() {
    this.dispose()
  }
}