import { Clock as TCLock } from "three"
import EventEmitter from "./EventEmitter"

export default class Clock extends EventEmitter {
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

    this.#clock = new TCLock()
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