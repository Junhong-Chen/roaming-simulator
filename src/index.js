import { Scene, PerspectiveCamera, WebGLRenderer } from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import sources from "./sources/sources"
import Sizes from "./utils/sizes"
import Time from "./utils/time"
import World from "./world/world"
import Loader from "./utils/loader"
import Debugger from "./utils/debugger"

class App {
  constructor() {
  }

  init() {
    this.debugger = new Debugger()
    this.scene = new Scene()
    this.sizes = new Sizes()
    this.time = new Time()
    this.loader = new Loader(sources, this.scene)
    this.world = new World(this)

    const { width, height, pixelRatio } = this.sizes

    this.camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.set(2, 3, 4)

    this.renderer = new WebGLRenderer({
      antialias: true
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.shadowMap.enabled = true
    document.body.appendChild(this.renderer.domElement)

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)

    this.sizes.on('resize', this.resize)

    this.time.on('tick', this.update)

    this.loader.on('loaded', (resources) => {
      this.world.load(resources)
    })

    window.addEventListener('beforeunload', this.destroy, false)
  }

  update = ({ deltaTime }) => {
    this.orbitControls.update()
    this.renderer.render(this.scene, this.camera)
    this.world.update(deltaTime)
  }

  resize = () => {
    const { width, height, pixelRatio } = this.sizes
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(pixelRatio)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }

  destroy = (e) => {
    // e.preventDefault()
    this.sizes.off('resize')
    this.time.off('tick')
    this.debugger.destroy()
    this.sizes.destroy()
    this.time.destroy()
    this.orbitControls.dispose()
    this.renderer.dispose()
    this.world.destroy()
    window.removeEventListener('beforeunload', this.destroy, false)
  }
}

const app = new App()
app.init()