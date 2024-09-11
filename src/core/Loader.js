import { AudioLoader, KeyframeTrack, TextureLoader } from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
// import { DRACOLoader } from "three/examples/jsm/Addons.js"
import EventEmitter from "./EventEmitter"
import Loading from "./Loading"
import { DATA_TYPE } from "../sources"

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

    this.canvas = document.createElement('canvas') // 用于存取纹理
    this.ctx = this.canvas.getContext('2d')

    this.audioContext = new window.AudioContext() // 用于存取音频
  }

  init(scene) {
    const loading = new Loading(scene)
    // const dLoader = new DRACOLoader()
    // dLoader.setDecoderPath('/loader/draco/')
    // this.#loaders.gltf.setDRACOLoader(dLoader)
    this.#loaders.gltf = new GLTFLoader(loading.manager)
    this.#loaders.texture = new TextureLoader(loading.manager)
    this.#loaders.audio = new AudioLoader(loading.manager)
  }

  async load(sources) {
    let db
    await this.initDB(DATA_TYPE).then(res => {
      db = res
    })

    for (const { name, type, paths } of sources) {
      for (const path of paths) {
        const url = `/${import.meta.env.VITE_BASE_PATH}/${path}`
        this.loaded(db, type, url, name, this.#loaders[type])
      }
    }
  }

  push({ name, type, file }) {
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

  initDB(stores) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('gameDB', 1)

      request.onsuccess = function (event) {
        const db = event.target.result

        db.onerror = function (e) {
          console.error('DB Error:', e)
        }

        resolve(db)
      }

      request.onerror = function (event) {
        console.error('Failed to open DB.')
        reject(event)
      }

      request.onupgradeneeded = function (event) {
        const db = event.target.result

        // 创建对象存储（如果不存在的话）
        Object.values(stores).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'url' })
          }
        })
      }
    })
  }

  save(db, type, url, data) {
    switch (type) {
      case DATA_TYPE.TEXTURE:
        this.canvas.width = data.image.width
        this.canvas.height = data.image.height
        this.ctx.drawImage(data.image, 0, 0)

        this.canvas.toBlob(blob => {
          this.saveToIndexedDB(db, type, url, blob)
        })
        break
      case DATA_TYPE.GLTF: {
        // 不了解 GLTFLoader 加载的对象数据结构，暂不实现
        break
      }
      case DATA_TYPE.AUDIO: {
        const channels = []
        for (let i = 0; i < data.numberOfChannels; i++) {
          channels.push(data.getChannelData(i))
        }

        const audioData = {
          numberOfChannels: data.numberOfChannels,
          length: data.length,
          sampleRate: data.sampleRate,
          channels: channels.map(channel => channel.buffer) // Convert Float32Array to ArrayBuffer
        }

        this.saveToIndexedDB(db, type, url, audioData)
      }
        break
    }
  }

  // 本地存储
  saveToIndexedDB(db, storeName, url, data) {
    let transaction = db.transaction([storeName], 'readwrite')
    let store = transaction.objectStore(storeName)
    store.put({ url, data })

    transaction.oncomplete = () => {
      console.log(`${url} saved to IndexedDB.`)
    }

    transaction.onerror = (event) => {
      console.error(`Failed to save ${url}:`, event)
    }
  }

  loaded(db, type, url, name, loader) {
    // const fileName = url.replace(/(.*\/)*([^.]+).*/ig, '$2')

    this.loadFromIndexedDB(db, type, url).then(res => {
      if (res) {

        switch (type) {
          case DATA_TYPE.TEXTURE:
            loader.load(URL.createObjectURL(res), texture => {
              texture.name = texture.name || url
              this.push({ name, type, file: texture })
            })
            break
          case DATA_TYPE.GLTF:
            break
          case DATA_TYPE.AUDIO: {
            const channels = res.channels.map(channelBuffer => new Float32Array(channelBuffer))

            const audioBuffer = this.audioContext.createBuffer(
              res.numberOfChannels,
              res.length,
              res.sampleRate
            )

            for (let i = 0; i < res.numberOfChannels; i++) {
              audioBuffer.copyToChannel(channels[i], i)
            }

            audioBuffer.name = url

            this.push({ name, type, file: audioBuffer })
            break
          }
        }

      } else {
        loader.load(url, file => {
          file.name = file.name || url
          this.push({ name, type, file })
          this.save(db, type, url, file)
        })
      }
    })
  }

  loadFromIndexedDB(db, storeName, url) {
    return new Promise((resolve, reject) => {
      let transaction = db.transaction([storeName], 'readonly')
      let store = transaction.objectStore(storeName)
      let request = store.get(url)

      request.onsuccess = (event) => {
        resolve(event.target.result ? event.target.result.data : null)
      }

      request.onerror = (event) => {
        reject(`Failed to load ${url}:`, event)
      }
    })
  }
}