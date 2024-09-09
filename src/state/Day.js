import EventEmitter from "../core/EventEmitter"

export default class Day extends EventEmitter {
  constructor(state) {
    super()
    this.state = state

    this.autoUpdate = true
    this.timeProgress = 0
    this.progress = 0
    this.duration = 120 // Seconds

    this.isDay = true

    this.setDebug()
  }

  update() {
    if (this.autoUpdate) {
      this.timeProgress += this.state.clock.delta / this.duration
      this.progress = this.timeProgress % 1 // 白天: 0.75 ~ 0.25，夜晚: 0.25 ~ 0.75

      if ((this.progress > 0.75 || this.progress < 0.25) && !this.isDay) {
        this.isDay = true
        this.emit('day', this.isDay)
      } else if (this.progress > 0.25 && this.progress < 0.75 && this.isDay) {
        this.isDay = false
        this.emit('day', this.isDay)
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