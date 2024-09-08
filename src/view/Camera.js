import { PerspectiveCamera } from "three"

export default class Camera extends PerspectiveCamera {
  constructor(view) {
    super(60, 1, 1, 1500) // 深度缓冲区的精度分布与 近剪裁面（near）和远剪裁面（far）的比值 相关

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