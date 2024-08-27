import { PerspectiveCamera, Vector3 } from "three"

export default class Camera extends PerspectiveCamera {
  constructor() {
    super(75, 1, 0.1, 1000)

    this.position.set(1, 2, 3)
    this.lookAt(new Vector3())
  }

  update() { }

  resize(width, height) {    
    this.aspect = width / height
    this.updateProjectionMatrix()
  }

  destroy() {
  }
}