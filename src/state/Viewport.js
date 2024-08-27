import EventEmitter from "../core/EventEmitter"

export default class Viewport extends EventEmitter {
  #width
  #height
  #pixelRatio

  get width() {
    return this.#width
  }
  get height() {
    return this.#height
  }
  get pixelRatio() {
    return this.#pixelRatio
  }

  constructor() {
    super()

    this.updateSize()

    window.addEventListener('resize', this.resize, false)
  }

  updateSize() {
    this.#width = window.innerWidth
    this.#height = window.innerHeight
    this.#pixelRatio = Math.min(window.devicePixelRatio, 2)
  }

  resize = () => {
    this.updateSize()
    this.emit('resize')
  }

  destroy() {
    window.removeEventListener('resize', this.resize, false)
  }
}