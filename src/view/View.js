import Camera from "./Camera"
import Light from "./Light"
import Player from "./Player"
import Sky from "./Sky"
import Terrains from "./Terrains"
import Chunks from "./Chunks"

export default class View {
  constructor(app) {
    this.renderer = app.renderer
    this.debug = app.debug
    this.music = app.music
    this.viewport = app.viewport
    this.clock = app.clock
    this.scene = app.scene
    this.state = app.state

    this.camera = new Camera(this)
    this.light = new Light(this)
    this.sky = new Sky(this)
    this.terrains = new Terrains(this)
    // this.chunks = new Chunks(this)
  }

  load(resources) {
    this.player = new Player(this, resources)
  }

  update(deltaTime, elapsedTime) {
    this.camera.update()
    this.sky.update()
    this.terrains.update()
    // this.chunks.update()
    if (this.player) this.player.update(deltaTime, elapsedTime)
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