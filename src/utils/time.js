import { Clock } from "three"
import EventEmitter from "./eventEmitter"

export default class Time extends EventEmitter {
  #id
  #clock

  get delta() {
    return this.#clock.getDelta()
  }

  get elapsed() {
    return this.#clock.elapsedTime
  }
  constructor() {
    super()

    this.#clock = new Clock()
    this.animate()
  }

  animate() {
    const deltaTime = this.#clock.getDelta()
    this.#id = window.requestAnimationFrame(this.animate.bind(this))

    this.emit('tick', { deltaTime, elapsedTime: this.#clock.elapsedTime })
  }

  destroy() {
    window.cancelAnimationFrame(this.#id)
  }
}