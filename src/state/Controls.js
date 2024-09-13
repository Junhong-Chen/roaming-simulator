import EventEmitter from "../core/EventEmitter"

export default class Controls extends EventEmitter {
  constructor() {
    super()

    this.setKeys()
    this.setPointer()

    this.on('debugDown', () => {
      if (location.hash === '#debug')
        location.hash = ''
      else
        location.hash = 'debug'

      location.reload()
    })

    // 记录用户最后一次操作时间
    this.lastActionTime = Date.now()
    // 是否处于待机状态
    this.isIdle = false
    // 设置 10 秒的超时时间
    this.idleTimeout = 5000
  }

  updateIdleStatus() {
    this.lastActionTime = Date.now()
    this.isIdle = false
  }

  setKeys() {
    this.keys = {}

    // Map
    this.keys.map = [
      {
        codes: ['ArrowUp', 'KeyW'],
        name: 'forward'
      },
      {
        codes: ['ArrowRight', 'KeyD'],
        name: 'strafeRight'
      },
      {
        codes: ['ArrowDown', 'KeyS'],
        name: 'backward'
      },
      {
        codes: ['ArrowLeft', 'KeyA'],
        name: 'strafeLeft'
      },
      {
        codes: ['ShiftLeft', 'ShiftRight'],
        name: 'boost'
      },
      {
        codes: ['AltLeft', 'AltRight'],
        name: 'pointerLock'
      },
      {
        codes: ['KeyV'],
        name: 'cameraMode'
      },
      {
        codes: ['KeyB'],
        name: 'debug'
      },
      {
        codes: ['KeyF'],
        name: 'fullscreen'
      },
      {
        codes: ['Space'],
        name: 'jump'
      },
      {
        codes: ['ControlLeft', 'KeyC'],
        name: 'crouch'
      },
    ]

    // Down keys
    this.keys.down = {}

    for (const mapItem of this.keys.map) {
      this.keys.down[mapItem.name] = false
    }

    // Find in map per code
    this.keys.findPerCode = (key) => {
      return this.keys.map.find((mapItem) => mapItem.codes.includes(key))
    }

    // Event
    window.addEventListener('keydown', (event) => {
      const mapItem = this.keys.findPerCode(event.code)

      if (mapItem) {
        this.emit('keyDown', mapItem.name)
        this.emit(`${mapItem.name}Down`)
        this.keys.down[mapItem.name] = true
        this.updateIdleStatus()
      }
    })

    window.addEventListener('keyup', (event) => {
      const mapItem = this.keys.findPerCode(event.code)

      if (mapItem) {
        this.emit('keyUp', mapItem.name)
        this.emit(`${mapItem.name}Up`)
        this.keys.down[mapItem.name] = false
        this.updateIdleStatus()
      }
    })
  }

  setPointer() {
    this.pointer = {}
    this.pointer.down = false
    this.pointer.deltaTemp = { x: 0, y: 0 }
    this.pointer.delta = { x: 0, y: 0 }

    window.addEventListener('pointerdown', (event) => {
      this.pointer.down = true
      this.updateIdleStatus()
    })

    window.addEventListener('pointermove', (event) => {
      this.pointer.deltaTemp.x += event.movementX
      this.pointer.deltaTemp.y += event.movementY
      this.updateIdleStatus()
    })

    window.addEventListener('pointerup', () => {
      // 鼠标锁定
      document.body.requestPointerLock()

      this.pointer.down = false
      this.updateIdleStatus()
    })
  }

  update() {
    this.pointer.delta.x = this.pointer.deltaTemp.x
    this.pointer.delta.y = this.pointer.deltaTemp.y

    this.pointer.deltaTemp.x = 0
    this.pointer.deltaTemp.y = 0

    // 检查是否进入待机状态
    const currentTime = Date.now()
    if (currentTime - this.lastActionTime > this.idleTimeout && !this.isIdle) {
      this.isIdle = true
    } else if (!this.isIdle) {
      this.isIdle = false
    }

    // 如果处于待机状态，相机绕角色旋转
    if (this.isIdle) {
      this.pointer.delta.x = 0.5  // 设置一个小的值，让相机缓慢旋转
    }
  }
}