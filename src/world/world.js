import Light from "./light"
import Music from "./music"
import Floor from "./floor"
import Player from "./player"

export default class World {
  #fns = []

  constructor(app) {
    this.scene = app.scene
    this.time = app.time

    this.resources

    this.init()
  }

  init() {
    this.music = new Music()
    this.light = new Light(this)
    this.floor = new Floor(this)
  }

  load(resources) {

    this.res = resources
    this.player = new Player(this)
  }

  addUpdateFn(fn) {
    this.#fns.push(fn)
  }

  removeUpdateFn(fn) {
    const i = this.#fns.findIndex(f => f === fn)

    if (i > -1) {
      this.#fns.splice(i, 1)
    }
  }

  update(deltaTime) {
    this.#fns.forEach(fn => {
      fn(deltaTime)
    })
  }

  destroy() {
    this.scene.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose()
        for (const key in child.material) {
          const value = child.material[key]
          if (value && value.dispose instanceof Function) {
            value.dispose()
          }
        }
      }
    })
  }
}