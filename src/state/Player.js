import { vec3 } from "gl-matrix"
import EventEmitter from "../core/EventEmitter.js"
import Camera from "./Camera.js"
import { MathUtils } from "three"

const ACTIONS = {
  RUNNING: 'running',
  SITTING: 'sitting',
  IDLE: 'idle',
  STANDING_UP: 'standing up',
  SWIMMING: 'swimming',
  TREADING_WATER: 'treading water',
  WALKING: 'walking',
}

export default class Player extends EventEmitter {
  constructor(state) {
    super()

    this.state = state

    this.rotation = 0
    this.inputSpeed = 2
    this.inputBoostSpeed = 4
    this.speed = 0
    this.realSpeed = 0

    this.position = vec3.create()
    this.positionPrevious = vec3.clone(this.position)
    this.positionDelta = vec3.create()

    this.action = ACTIONS.IDLE
    this.beforeAction = this.action

    this.camera = new Camera(state)

    this.actionTimeScale = 1
  }

  update() {
    const controls = this.state.controls
    this.beforeAction = this.action
    const cameraFly = this.camera.mode === Camera.MODE_FLY
    const chunks = this.state.chunks
    const elevation = chunks.getElevationForPosition(this.position[0], this.position[2])
    let swimming = false
    let timeScale = 1

    // Update elevation
    if (elevation && elevation > -1 - 0.01) // EPSILON
      this.position[1] = elevation
    else {
      this.position[1] = -1
      swimming = true
    }

    // Moving
    const boost = controls.keys.down.boost
    if (!cameraFly && (controls.keys.down.forward || controls.keys.down.backward || controls.keys.down.strafeLeft || controls.keys.down.strafeRight)) {
      this.rotation = this.camera.thirdPerson.theta

      if (controls.keys.down.forward) {
        if (controls.keys.down.strafeLeft)
          this.rotation += Math.PI * 0.25
        else if (controls.keys.down.strafeRight)
          this.rotation -= Math.PI * 0.25
      }
      else if (controls.keys.down.backward) {
        if (controls.keys.down.strafeLeft)
          this.rotation += Math.PI * 0.75
        else if (controls.keys.down.strafeRight)
          this.rotation -= Math.PI * 0.75
        else
          this.rotation += Math.PI
      }
      else if (controls.keys.down.strafeLeft) {
        this.rotation += Math.PI * 0.5
      }
      else if (controls.keys.down.strafeRight) {
        this.rotation -= Math.PI * 0.5
      }

      let speed = boost ? this.inputBoostSpeed : this.inputSpeed
      if (Math.abs(speed - this.speed) > 0.01) {
        speed = MathUtils.lerp(this.speed, speed, 0.05)
        this.speed = speed
      }

      const x = Math.sin(this.rotation) * this.state.clock.delta * speed
      const z = Math.cos(this.rotation) * this.state.clock.delta * speed

      this.position[0] -= x
      this.position[2] -= z

      // 角色动作
      if (swimming) {
        this.action = ACTIONS.SWIMMING
      } else {
        this.action = boost ? ACTIONS.RUNNING : ACTIONS.WALKING
      }
    } else {
      this.action = swimming ? ACTIONS.TREADING_WATER : ACTIONS.IDLE
      this.speed = 0
    }

    vec3.sub(this.positionDelta, this.position, this.positionPrevious)
    vec3.copy(this.positionPrevious, this.position)
    // 计算实时速度（暂时用不上）
    // this.realSpeed = vec3.len(this.positionDelta)

    // Update view
    this.camera.update()

    // 更新角色动作
    if (this.beforeAction !== this.action)
      this.emit('action', { before: this.beforeAction, current: this.action })

    // 更新动作速度
    if (swimming) {
      timeScale = boost ? 1.5 : 1
    }
    if (timeScale !== this.actionTimeScale) {
      this.emit('actionTimeScale', { timeScale })
      this.actionTimeScale = timeScale
    }
  }
}