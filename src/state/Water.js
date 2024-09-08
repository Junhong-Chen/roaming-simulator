import { vec2, vec3 } from "gl-matrix"

export default class Water {
  constructor(state) {
    this.state = state
    this.size = {
      water: 2048,
      wave: 256,
    }
    this.waveScale = Math.pow(this.size.wave / this.size.water, 2.)

    this.position = vec3.create()
    this.playerUv = vec2.create()
  }

  update() {
    const { position, positionDelta } = this.state.player
    if (vec3.len(positionDelta) > 0.02) {
      const relative = vec3.sub(vec3.create(), position, this.position)
      vec2.set(this.playerUv, relative[0] * this.waveScale + 0.5, -relative[2] * this.waveScale + 0.5)
    }

    // vec3.set(this.position, position[0], 0, position[2])
  }
}