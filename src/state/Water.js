import { vec2, vec3 } from "gl-matrix"

export default class Water {
  constructor(state) {
    this.state = state
    this.size = {
      water: 2000,
      wave: 150,
    }
    this.waveScale = Math.pow(this.size.wave / this.size.water, 2)

    this.position = vec3.create()

    this.offsetUv = vec2.create() // 涟漪纹理偏移
  }

  update() {
    const { position, positionDelta } = this.state.player

    vec2.set(this.offsetUv, positionDelta[0] / 16, -positionDelta[2] / 16) // 乘一个衰减因子

    vec3.set(this.position, position[0], 0, position[2])
  }
}