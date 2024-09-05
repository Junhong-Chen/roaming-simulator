import { vec3 } from "gl-matrix"
import EventEmitter from "../core/EventEmitter.js"
import Camera from "./Camera.js"

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

    this.position = {}
    this.position.current = vec3.fromValues(0, 0, 0)
    this.position.previous = vec3.clone(this.position.current)
    this.position.delta = vec3.create()

    this.action = ACTIONS.IDLE
    this.beforeAction = this.action

    this.camera = new Camera(state)
  }

  update() {
    const controls = this.state.controls
    this.beforeAction = this.action

    if (controls.keys.down.forward || controls.keys.down.backward || controls.keys.down.strafeLeft || controls.keys.down.strafeRight) {
      this.rotation = this.camera.thirdPerson.theta % (Math.PI * 2)

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
          this.rotation -= Math.PI
      }
      else if (controls.keys.down.strafeLeft) {
        this.rotation += Math.PI * 0.5
      }
      else if (controls.keys.down.strafeRight) {
        this.rotation -= Math.PI * 0.5
      }

      const speed = controls.keys.down.boost ? this.inputBoostSpeed : this.inputSpeed

      const x = Math.sin(this.rotation) * this.state.clock.delta * speed
      const z = Math.cos(this.rotation) * this.state.clock.delta * speed

      this.position.current[0] -= x
      this.position.current[2] -= z

      if (controls.keys.down.boost) {
        this.action = ACTIONS.RUNNING
      } else {
        this.action = ACTIONS.WALKING
      }
    } else {
      this.action = ACTIONS.IDLE
    }

    if (this.beforeAction !== this.action)
      this.emit('action', { before: this.beforeAction, current: this.action })

    vec3.sub(this.position.delta, this.position.current, this.position.previous)
    vec3.copy(this.position.previous, this.position.current)

    this.speed = vec3.len(this.position.delta)

    // Update view
    this.camera.update()

    // Update elevation
    const chunks = this.state.chunks
    const elevation = chunks.getElevationForPosition(this.position.current[0], this.position.current[2])

    if (elevation && elevation > -0.5)
      this.position.current[1] = elevation
    else
      this.position.current[1] = -0.5
  }
}