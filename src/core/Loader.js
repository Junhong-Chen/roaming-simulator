import { TextureLoader } from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { DRACOLoader } from "three/examples/jsm/Addons.js"
import EventEmitter from "./EventEmitter"
import Loading from "../utils/Loading"

export default class Loader extends EventEmitter {
  #loaders = {}
  #files = new Map()
  #loadTotal
  #loadedTotal

  constructor(sources, scene) {
    super()

    this.#loadTotal = sources.reduce((accumulator, currentValue) => accumulator + currentValue.paths.length, 0)
    this.#loadedTotal = 0

    this.init(scene)
    this.load(sources)
  }

  init(scene) {
    const loading = new Loading(scene)
    const dLoader = new DRACOLoader()
    dLoader.setDecoderPath('/loader/draco/')
    this.#loaders.gltf = new GLTFLoader(loading.manager)
    this.#loaders.gltf.setDRACOLoader(dLoader)
    this.#loaders.texture = new TextureLoader(loading.manager)
  }

  load(sources) {
    for (const { name, type, paths } of sources) {
      for (const path of paths) {
        this.#loaders[type].load(path, (file) => {
          file.name = file.name || path.match(/\/(\S+)\./).pop()
          this.loaded({ name, type, file })
        })
      }
    }
  }

  loaded({ name, type, file }) {
    if (!this.#files.has(name)) {
      this.#files.set(name, [])
    }
    this.#files.get(name).push({
      type,
      file
    })


    this.#loadedTotal++
    if (this.#loadTotal === this.#loadedTotal) {
      this.emit('loaded', this.#files)
    }
  }
}