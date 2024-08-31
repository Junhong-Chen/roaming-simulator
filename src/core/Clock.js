import { Clock as TCLock } from "three"
import EventEmitter from "./EventEmitter"

export default class Clock extends EventEmitter {
  #id
  #clock

  get elapsed() {
    return this.#clock.elapsedTime
  }

  constructor() {
    super()

    this.#clock = new TCLock()
    this.animate()
  }

  animate() {
    this.delta = this.#clock.getDelta()
    this.#id = window.requestAnimationFrame(this.animate.bind(this))

    this.emit('tick', { deltaTime: this.delta, elapsedTime: this.#clock.elapsedTime })
  }

  destroy() {
    window.cancelAnimationFrame(this.#id)
  }
}