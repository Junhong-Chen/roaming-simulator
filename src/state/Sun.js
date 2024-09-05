import { Vector3 } from "three"

export default class Sun {
  constructor(state) {
    this.state = state

    this.theta = Math.PI * 0.8 // All around the sphere
    this.phi = Math.PI * 0.45 // Elevation
    this.position = new Vector3()
  }

  update() {
    const angle = - this.state.day.progress * Math.PI * 2
    // this.phi = (Math.sin(angle) * 0.3 + 0.5) * Math.PI
    // this.theta = (Math.cos(angle) * 0.3 + 0.5) * Math.PI
    this.phi = angle
    this.theta = 0

    const sinPhiRadius = Math.sin(this.phi)

    this.position.x = sinPhiRadius * Math.sin(this.theta)
    this.position.y = Math.cos(this.phi)
    this.position.z = sinPhiRadius * Math.cos(this.theta)
  }
}