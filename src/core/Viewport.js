import EventEmitter from "./EventEmitter"

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

  constructor(state) {
    super()

    this.smallestSide = null
    this.biggestSide = null

    this.updateSize()

    window.addEventListener('resize', this.resize, false)
  }

  updateSize() {
    this.#width = window.innerWidth
    this.#height = Math.min(Math.ceil(window.innerWidth / 3), window.innerHeight)
    this.#pixelRatio = Math.min(window.devicePixelRatio, 2)
    this.smallestSide = this.width < this.height ? this.width : this.height
    this.biggestSide = this.width > this.height ? this.width : this.height
  }

  resize = () => {
    this.updateSize()
    this.emit('resize')
  }

  normalise(pixelCoordinates) {
    const minSize = Math.min(this.#width, this.#height)
    return {
      x: pixelCoordinates.x / minSize,
      y: pixelCoordinates.y / minSize,
    }
  }

  destroy() {
    window.removeEventListener('resize', this.resize, false)
  }
}