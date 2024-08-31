import { PerspectiveCamera } from "three"

export default class Camera extends PerspectiveCamera {
  constructor(view) {
    super(75, 1, 0.1, 1000)

    this.view = view
    this.rotation.reorder('YXZ')
  }

  resize(width, height) {    
    this.aspect = width / height
    this.updateProjectionMatrix()
  }

  update() {
    const { position, quaternion } = this.view.state.player.camera

    // Apply coordinates from view
    this.position.set(...position)
    this.quaternion.set(...quaternion)
  }

  destroy() {
  }
}