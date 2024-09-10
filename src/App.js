import { Scene } from "three"
import sources from "./sources"
import UI from "./ui/ui"
import Audios from "./audio/Audios"
import Debugger from "./utils/Debugger"
import Viewport from "./core/Viewport"
import Clock from "./core/Clock"
import Loader from "./core/Loader"
import Renderer from "./core/Renderer"
import State from "./state/State"
import View from "./view/View"

export default class App {
  constructor() { }

  init() {
    this.debug = new Debugger()
    this.audios = new Audios()
    this.ui = new UI()
    this.scene = new Scene()
    this.viewport = new Viewport()
    this.clock = new Clock()
    this.loader = new Loader(sources, this.scene)
    this.state = new State(this)
    this.renderer = new Renderer()

    this.view = new View(this)
    
    this.resize()
    this.viewport.on('resize', this.resize)

    this.clock.on('tick', this.update)

    this.loader.on('loaded', resources => {
      this.state.load(resources)
      this.view.load(resources)
      
      this.ui.on('start', () => {
        this.audios.load(resources)
      })
    })
  }

  update = ({ deltaTime, elapsedTime }) => {
    this.renderer.update(this.scene, this.view.camera)
    this.state.update(deltaTime, elapsedTime)
    this.view.update(deltaTime, elapsedTime)
  }

  resize = () => {
    const { width, height, pixelRatio } = this.viewport
    this.renderer.resize(width, height, pixelRatio)
    this.view.resize(width, height, pixelRatio)
  }

  destroy = (e) => {
    // e.preventDefault()
    this.viewport.off('resize')
    this.clock.off('tick')
    this.ui.destroy()
    this.debug.destroy()
    this.viewport.destroy()
    this.clock.destroy()
    this.renderer.destroy()
    this.view.destroy()
    window.removeEventListener('beforeunload', this.destroy, false)
  }
}

