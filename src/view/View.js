import Light from "./Light"
import Floor from "./Floor"
import Player from "./Player"
import Terrains from "./Terrains"

export default class View {
  constructor(app) {
    this.scene = app.scene
    this.clock = app.clock
    this.music = app.music

    this.resources

    this.init()
  }

  init() {
    this.light = new Light(this)
    // this.floor = new Floor(this)
    this.terrains = new Terrains()
  }

  load(resources) {
    this.player = new Player(this, resources)
  }

  update(deltaTime, elapsedTime) {
    if (this.player) this.player.update(deltaTime, elapsedTime)
    this.floor.update(deltaTime, elapsedTime)
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