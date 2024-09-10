import EventEmitter from "../core/EventEmitter"

export default class Day extends EventEmitter {
  constructor(state) {
    super()
    this.state = state

    this.autoUpdate = true
    this.timeProgress = 0
    this.progress = 0
    this.duration = 215 // Seconds

    this.auroraStamp = false
    this.sunriseStamp = false

    this.setDebug()
  }

  update() {
    if (this.autoUpdate) {
      this.timeProgress += this.state.clock.delta / this.duration
      this.progress = this.timeProgress % 1 // 白天: 0 ~ 0.25 0.75 ~ 1; 夜晚: 0.25 ~ 0.75

      // 日出
      if (!this.sunriseStamp && (Math.abs(this.progress - 0.75) < 0.001)) {
        this.sunriseStamp = true
        this.emit('sunrise', this.sunriseStamp)
      } else if (this.sunriseStamp && this.progress > 0.25 && this.progress < 0.75) {
        this.sunriseStamp = false
      }

      // 深夜
      if (!this.auroraStamp && (Math.abs(this.progress - 0.34) < 0.001)) {
        this.auroraStamp = true
        this.emit('aurora', this.auroraStamp)
      } else if (this.auroraStamp && this.progress > 0.75) {
        this.auroraStamp = false
      }
    }
  }

  setDebug() {
    const debug = this.state.debug
    if (!debug.gui)
      return

    const folder = debug.getFolder('state/dayCycle')

    folder
      .add(this, 'autoUpdate')

    folder
      .add(this, 'progress')
      .min(0)
      .max(1)
      .step(0.001)

    folder
      .add(this, 'duration')
      .min(20)
      .max(360)
      .step(1)
  }
}