export default class Day {
  constructor(state) {
    this.state = state

    this.autoUpdate = true
    this.timeProgress = 0
    this.progress = 0
    this.duration = 20 // Seconds

    this.setDebug()
  }

  update() {
    if (this.autoUpdate) {
      this.timeProgress += this.state.clock.delta / this.duration
      this.progress = this.timeProgress % 1 // 白天: 0 ~ 0.5，夜晚: 0.5 ~ 1
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
      .min(5)
      .max(100)
      .step(1)
  }
}