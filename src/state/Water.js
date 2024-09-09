import { vec2, vec3 } from "gl-matrix"

export default class Water {
  constructor(state) {
    this.state = state
    this.size = {
      water: 2048,
      wave: 256,
    }
    this.waveScale = Math.pow(this.size.wave / this.size.water, 2.)
    this.waveUpdate = true

    this.position = vec3.create()
    this.playerUv = vec2.create() // 角色相对于水面的 uv
  }

  update() {
    const { position, positionDelta, speed } = this.state.player
    
    if (vec3.len(positionDelta) > 0.02  && this.waveUpdate) {
      const relative = vec3.sub(vec3.create(), position, this.position)
      vec2.set(this.playerUv, relative[0] * this.waveScale + 0.5, -relative[2] * this.waveScale + 0.5)
    }

    if ((speed === 0 && this.waveUpdate) || position[1] > 1) { // 角色停下 或 角色所处地形海拔于 1 时，同步水面 mesh 位置
      // 暂时不更新uv
      this.waveUpdate = false

      // 即使角色停下时更新 water 位置，角色连续移动时，也可能走出水面涟漪纹理覆盖范围
      setTimeout(() => {
        vec3.set(this.position, position[0], 0, position[2])
        this.waveUpdate = true
      }, 1250)
    }
  }
}