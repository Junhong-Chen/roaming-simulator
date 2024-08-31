import { Scene } from "three"
import sources from "./sources"
import Music from "./audio/music"
import Viewport from "./core/Viewport"
import Clock from "./core/Clock"
import Loader from "./core/Loader"
import Renderer from "./core/Renderer"
import State from "./state/State"
import Debugger from "./utils/Debugger"
import View from "./view/View"

export default class App {
  constructor() { }

  init() {
    this.debugger = new Debugger()
    this.music = new Music()
    this.scene = new Scene()
    this.viewport = new Viewport()
    this.clock = new Clock()
    this.loader = new Loader(sources, this.scene)
    this.state = new State(this)
    
    this.view = new View(this)
    this.renderer = new Renderer()
    
    this.resize()
    this.viewport.on('resize', this.resize)

    this.clock.on('tick', this.update)

    this.loader.on('loaded', (resources) => {
      this.view.load(resources)
    })
  }

  update = ({ deltaTime, elapsedTime }) => {
    this.renderer.update(this.scene, this.view.camera)
    this.view.update(deltaTime, elapsedTime)
    this.state.update(deltaTime, elapsedTime)
  }

  resize = () => {
    const { width, height, pixelRatio } = this.viewport
    this.renderer.resize(width, height, pixelRatio)
    this.view.camera.resize(width, height)
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

