import { vec3 } from "gl-matrix"
import EventEmitter from "../core/EventEmitter.js"
import Camera from "./Camera.js"
import { AnimationMixer, MathUtils } from "three"

const ACTIONS = {
  IDLE: 'idle',
  IDLE_WATER: 'idle_water',
  WALK: 'walk',
  RUN: 'run',
  SWIM: 'swim',
}

const ACTIONS_STEP_TIME = {
  [ACTIONS.WALK]: [0.38, 0.8],
  [ACTIONS.RUN]: [0.36, 0.73],
  [ACTIONS.SWIM]: [0.5, 2.7],
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

    this.mixer = null
    this.actions = {}

    this.action = ACTIONS.IDLE // 当前动作
    this.beforeAction = this.action // 前一个动作

    this.soundPlaying = false

    this.camera = new Camera(state)

    this.setDebug()
  }

  load(files) {
    const modelFile = files.get('player')[0].file

    const { scene: model, animations } = modelFile

    this.mixer = new AnimationMixer(model)

    if (animations) this.initActions(animations)
  }

  initActions(actions) {
    for (let i = 0; i < actions.length; i++) {
      const clip = actions[i]
      const name = clip.name || i
      const action = this.actions[name] = this.mixer.clipAction(clip)
      this.setActionWeight(action, 0)
      action.play()
    }

    this.setActionWeight(this.actions[this.action], 1)
  }

  setActionWeight(action, weight) {
    action.enabled = true
    action.setEffectiveTimeScale(1)
    action.setEffectiveWeight(weight)
  }

  changeAction(before, current, duration = 0.5) {
    current.time = 0
    this.setActionWeight(current, 1)
    before.crossFadeTo(current, duration, true)
  }


  update(deltaTime) {
    const controls = this.state.controls
    this.beforeAction = this.action
    const cameraFly = this.camera.mode === Camera.MODE_FLY
    const chunks = this.state.chunks
    const elevation = chunks.getElevationForPosition(this.position[0], this.position[2])
    let swim = false

    // Update elevation
    if (elevation && elevation > -1 - 0.01) // EPSILON
      this.position[1] = elevation
    else {
      this.position[1] = -1
      swim = true
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
      } else if (controls.keys.down.backward) {
        if (controls.keys.down.strafeLeft)
          this.rotation += Math.PI * 0.75
        else if (controls.keys.down.strafeRight)
          this.rotation -= Math.PI * 0.75
        else
          this.rotation += Math.PI
      } else if (controls.keys.down.strafeLeft) {
        this.rotation += Math.PI * 0.5
      } else if (controls.keys.down.strafeRight) {
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
      if (swim) {
        this.action = ACTIONS.SWIM
      } else {
        this.action = boost ? ACTIONS.RUN : ACTIONS.WALK
      }
    } else {
      this.action = swim ? ACTIONS.IDLE_WATER : ACTIONS.IDLE
      this.speed = 0
    }

    vec3.sub(this.positionDelta, this.position, this.positionPrevious)
    vec3.copy(this.positionPrevious, this.position)
    // 计算实时速度（暂时用不上）
    // this.realSpeed = vec3.len(this.positionDelta)

    if (this.mixer) {
      this.mixer.update(deltaTime)
      const aciton = this.actions[this.action]

      // 更新角色动作
      if (this.beforeAction !== this.action) {
        this.changeAction(this.actions[this.beforeAction], aciton)
      }

      // 更新动作速度
      this.mixer.timeScale = swim && boost ? 1.5 : 1

      // 根据动画帧触发音效
      if (this.speed) {
        const time = aciton.time

        this.stepSoundPlay(time, this.action)
      }
    }

    // Update view
    this.camera.update()
  }

  stepSoundPlay(time, action) {
    if (!this.soundPlaying) {

      let terrain = 'grass'
      if (this.position[1] < 0.75) {
        terrain = 'sand'

        if (this.position[1] <= 0) {
          terrain = 'water'
        }
      }

      ACTIONS_STEP_TIME[action].forEach(t => {
        if (Math.abs(time - t) < 0.1) {
          this.soundPlaying = true

          if (terrain === 'water' && action === ACTIONS.RUN) action = ACTIONS.WALK // 水面没有 run 音源，统一用 walk 音源
          this.emit('moving', { terrain, action: action })
          setTimeout(() => this.soundPlaying = false, 200)
        }
      })

    }
  }

  setDebug() {
    const debug = this.state.debug
    if (!debug.gui)
      return

    const debugObj = {
      position: () => {
        console.log(this.position)
      }
    }

    const waterFolder = debug.getFolder('state/player')
    waterFolder.add(debugObj, 'position')
  }
}