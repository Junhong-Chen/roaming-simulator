import Camera from "./Camera"
import Light from "./Light"
import Player from "./Player"
import Sky from "./Sky"
import Terrains from "./Terrains"
import Water from "./Water"

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
    this.player = new Player(this)
    this.light = new Light(this)
    this.sky = new Sky(this)
    this.water = new Water(this)
    this.terrains = new Terrains(this)
  }

  load(resources) {
    this.player.load(resources)
    this.sky.load(resources)
    this.water.load(resources)
    this.light.playerLight.target = this.player.model
  }

  update(deltaTime, elapsedTime) {
    this.camera.update()
    this.light.update()
    this.sky.update(deltaTime, elapsedTime)
    this.terrains.update()
    this.water.update()
    this.player.update()
  }

  resize(width, height) {
    this.camera.resize(width, height)
    this.sky.resize(width, height)
    this.water.resize(width, height)
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

    this.water.destroy()
    this.player.destroy()
  }
}