import { remap } from "../utils/utils"
import { vec3 } from "gl-matrix"

export default class Sun {
  constructor(state) {
    this.state = state

    this.theta = Math.PI * 0.8 // All around the sphere
    this.phi = Math.PI * 0.45 // Elevation
    this.position = vec3.create()

    this.intensity = 1 // Radiant intensity
    this.up = vec3.fromValues(0, 1, 0)
  }

  update() {
    const angle = - this.state.day.progress * Math.PI * 2
    // this.phi = (Math.sin(angle) * 0.3 + 0.5) * Math.PI
    // this.theta = (Math.cos(angle) * 0.3 + 0.5) * Math.PI
    this.phi = angle
    this.theta = 0

    const sinPhiRadius = Math.sin(this.phi)

    this.position[0] = sinPhiRadius * Math.sin(this.theta)
    this.position[1] = Math.cos(this.phi)
    this.position[2] = sinPhiRadius * Math.cos(this.theta)

    this.intensity = remap(
      vec3.dot(this.up, vec3.normalize(vec3.create(), this.position)),
      -1, 1, 0, 1
    )
  }
}