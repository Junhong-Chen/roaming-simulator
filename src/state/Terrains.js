import EventEmitter from "../core/EventEmitter"
import seedrandom from "seedrandom"

import terrainWorker from "../worker/terrain?worker"
import Terrain from "./Terrain"

export default class Terrains extends EventEmitter {
  static ITERATIONS_FORMULA_MAX = 1
  static ITERATIONS_FORMULA_MIN = 2
  static ITERATIONS_FORMULA_MIX = 3
  static ITERATIONS_FORMULA_POWERMIX = 4

  constructor(state) {
    super()

    this.state = state

    this.seed = 'JC'
    this.random = new seedrandom(this.seed)
    this.subdivisions = 40
    this.lacunarity = 2.05
    this.persistence = 0.45
    this.maxIterations = 6
    this.baseFrequency = 0.003 // 频率
    this.baseAmplitude = 180 // 振幅
    this.power = 2
    this.elevationOffset = 1

    this.segments = this.subdivisions + 1
    this.iterationsFormula = Terrains.ITERATIONS_FORMULA_POWERMIX

    this.lastId = 0
    this.terrains = new Map()

    this.iterationsOffsets = [] // 偏移量

    for (let i = 0; i < this.maxIterations; i++)
      this.iterationsOffsets.push([(this.random() - 0.5) * 200000, (this.random() - 0.5) * 200000])

    // console.log('iterationsOffsets: ', this.iterationsOffsets)
    // 新开线程计算地形数据
    this.setWorkers()
  }

  setWorkers() {
    this.worker = terrainWorker()

    this.worker.onmessage = e => {
      const terrain = this.terrains.get(e.data.id)

      if (terrain) terrain.create(e.data)
    }
  }

  // 精度不同，迭代次数不同
  getIterationsForPrecision(precision) {
    if (this.iterationsFormula === Terrains.ITERATIONS_FORMULA_MAX)
      return this.maxIterations

    if (this.iterationsFormula === Terrains.ITERATIONS_FORMULA_MIN)
      return Math.floor((this.maxIterations - 1) * precision) + 1

    if (this.iterationsFormula === Terrains.ITERATIONS_FORMULA_MIX)
      return Math.round((this.maxIterations * precision + this.maxIterations) / 2)

    if (this.iterationsFormula === Terrains.ITERATIONS_FORMULA_POWERMIX)
      return Math.round((this.maxIterations * (precision, 1 - Math.pow(1 - precision, 2)) + this.maxIterations) / 2)
  }

  create(size, x, z, precision) {
    // 地形唯一标识
    const id = this.lastId++

    // 创建地形
    const iterations = this.getIterationsForPrecision(precision)
    const terrain = new Terrain(this, id, size, x, z, precision)
    this.terrains.set(id, terrain)

    // 将数据发送给 worker
    // console.time(`terrains: worker (${terrain.id})`)
    this.worker.postMessage({
      id: terrain.id,
      x,
      z,
      seed: this.seed,
      subdivisions: this.subdivisions,
      size: size,
      lacunarity: this.lacunarity,
      persistence: this.persistence,
      iterations: iterations,
      baseFrequency: this.baseFrequency,
      baseAmplitude: this.baseAmplitude,
      power: this.power,
      elevationOffset: this.elevationOffset,
      iterationsOffsets: this.iterationsOffsets
    })

    this.emit('create', terrain)

    return terrain
  }

  destroyTerrain(id) {
    const terrain = this.terrains.get(id)

    if (terrain) {
      terrain.destroy()
      this.terrains.delete(id)
    }
  }

  recreate() {
    for (const [key, terrain] of this.terrains) {
      // this.create(terrain.size, terrain.x, terrain.z)

      // console.time(`terrains: worker (${terrain.id})`)
      const iterations = this.getIterationsForPrecision(terrain.precision)
      this.worker.postMessage({
        id: terrain.id,
        size: terrain.size,
        x: terrain.x,
        z: terrain.z,
        seed: this.seed,
        subdivisions: this.subdivisions,
        lacunarity: this.lacunarity,
        persistence: this.persistence,
        iterations: iterations,
        baseFrequency: this.baseFrequency,
        baseAmplitude: this.baseAmplitude,
        power: this.power,
        elevationOffset: this.elevationOffset,
        iterationsOffsets: this.iterationsOffsets
      })
    }
  }

  setDebug() {
    if (!this.state.debug.gui)
      return

    const folder = this.state.debug.getFolder('state/terrains')

    folder
      .add(this, 'subdivisions')
      .min(1)
      .max(400)
      .step(1)
      .onFinishChange(() => this.recreate())

    folder
      .add(this, 'lacunarity')
      .min(1)
      .max(5)
      .step(0.01)
      .onFinishChange(() => this.recreate())

    folder
      .add(this, 'persistence')
      .min(0)
      .max(1)
      .step(0.01)
      .onFinishChange(() => this.recreate())

    folder
      .add(this, 'maxIterations')
      .min(1)
      .max(10)
      .step(1)
      .onFinishChange(() => this.recreate())

    folder
      .add(this, 'baseFrequency')
      .min(0)
      .max(0.01)
      .step(0.0001)
      .onFinishChange(() => this.recreate())

    folder
      .add(this, 'baseAmplitude')
      .min(0)
      .max(500)
      .step(0.1)
      .onFinishChange(() => this.recreate())

    folder
      .add(this, 'power')
      .min(1)
      .max(10)
      .step(1)
      .onFinishChange(() => this.recreate())

    folder
      .add(this, 'elevationOffset')
      .min(- 10)
      .max(10)
      .step(1)
      .onFinishChange(() => this.recreate())

    folder
      .add(
        this,
        'iterationsFormula',
        {
          'max': Terrains.ITERATIONS_FORMULA_MAX,
          'min': Terrains.ITERATIONS_FORMULA_MIN,
          'mix': Terrains.ITERATIONS_FORMULA_MIX,
          'powerMix': Terrains.ITERATIONS_FORMULA_POWERMIX,
        }
      )
      .onFinishChange(() => this.recreate())

    // this.material.uniforms.uFresnelOffset.value = 0
    // this.material.uniforms.uFresnelScale.value = 0.5
    // this.material.uniforms.uFresnelPower.value = 2
  }
}