import { Scene } from "three"
import sources from "./sources"
import Music from "./audio/music"
import Clock from "./core/Clock"
import Loader from "./core/Loader"
import Renderer from "./core/Renderer"
import viewport from "./state/Viewport"
import Debugger from "./utils/Debugger"
import View from "./view/View"
import Camera from "./view/Camera"

export default class App {
  constructor() { }

  init() {
    this.debugger = new Debugger()
    this.music = new Music()
    this.scene = new Scene()
    this.viewport = new viewport()
    this.clock = new Clock()
    this.loader = new Loader(sources, this.scene)
    this.view = new View(this)

    this.camera = new Camera()

    this.renderer = new Renderer()

    this.resize()
    this.viewport.on('resize', this.resize)

    this.clock.on('tick', this.update)

    this.loader.on('loaded', (resources) => {
      this.view.load(resources)
    })
  }

  update = ({ deltaTime, elapsedTime }) => {
    this.renderer.update(this.scene, this.camera)
    this.view.update(deltaTime, elapsedTime)
  }

  resize = () => {
    const { width, height, pixelRatio } = this.viewport
    this.renderer.resize(width, height, pixelRatio)
    this.camera.resize(width, height)
  }

  destroy = (e) => {
    // e.preventDefault()
    this.viewport.off('resize')
    this.clock.off('tick')
    this.debugger.destroy()
    this.viewport.destroy()
    this.clock.destroy()
    this.renderer.destroy()
    this.view.destroy()
    window.removeEventListener('beforeunload', this.destroy, false)
  }
}

