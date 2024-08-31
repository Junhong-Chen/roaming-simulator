import EventEmitter from "../core/EventEmitter"

import Chunk from "./Chunk.js"

export default class Chunks extends EventEmitter {
  constructor(state) {
    super()

    this.state = state

    this.minSize = 64
    this.maxDepth = 4 // 地形划分最大深度
    this.maxSize = this.minSize * Math.pow(2, this.maxDepth)
    this.splitRatioPerSize = 1.3 // 根据块的尺寸来决定是否进一步划分的比率
    this.lastId = 0

    this.mainChunks = new Map()
    this.allChunks = new Map()
    this.playerChunkKey = null // 玩家当前所在地块的标识符

    this.check()
  }

  check() {
    // Set all children flag for check（标记所有地形块需要检查）
    for (const [key, chunk] of this.allChunks)
      chunk.needsCheck = true

    // Get the coordinates to main chunks around the player（获取玩家周围的主要地形块坐标）
    const mainChunksCoordinates = this.getMainChunksCoordinates()

    // Destroy main chunks not in proximity anymore（销毁远离玩家的地形块）
    for (const [key, chunk] of this.mainChunks) {
      if (!mainChunksCoordinates.find((coordinates) => coordinates.key === key)) {
        chunk.destroy()
        this.mainChunks.delete(key)
      }
    }

    // Create new main chunks（生成新的主要地形块）
    for (const coordinates of mainChunksCoordinates) {
      // 如果玩家周围存在未生成的地形块，创建新的块并将其添加到 mainChunks 中
      if (!this.mainChunks.has(coordinates.key)) {
        const chunk = this.create(null, null, this.maxSize, coordinates.x, coordinates.z, 0)
        this.mainChunks.set(coordinates.key, chunk)
      }
    }

    // Check chunks（检查并更新所有块）
    for (const [key, chunk] of this.mainChunks)
      chunk.check()

    // Update neighbours
    this.updateAllNeighbours()
  }

  update() {
    // Check only if player coordinates changed to another minimal chunk（检查玩家是否移动到新的地块）
    const player = this.state.player
    const playerChunkKey = `${Math.round(player.position.current[0] / this.minSize * 2 + 0.5)}${Math.round(player.position.current[2] / this.minSize * 2 + 0.5)}`

    if (playerChunkKey !== this.playerChunkKey) {
      this.playerChunkKey = playerChunkKey
      this.check()
    }

    // Update main chunks（更新主要地形块）
    for (const [key, chunk] of this.mainChunks)
      chunk.update()
  }

  // 创建新的地形块实例，并将其添加到 allChunks 映射表中。创建地形块时触发 create 事件
  create(parent, quadPosition, halfSize, x, z, depth) {
    const id = this.lastId++
    const chunk = new Chunk(id, this, parent, quadPosition, halfSize, x, z, depth)

    this.allChunks.set(id, chunk)

    this.emit('create', chunk)

    return chunk
  }

  // 更新所有地形块的邻居关系。首先处理主要地块的邻居，然后按深度顺序处理非主要块的邻居关系。
  updateAllNeighbours() {
    // Update main chunks neighbours
    for (const [key, chunk] of this.mainChunks) {
      const coordinates = key.split(',')
      const x = parseFloat(coordinates[0])
      const z = parseFloat(coordinates[1])

      const nChunkKey = `${x},${z - 1}`
      const eChunkKey = `${x + 1},${z}`
      const sChunkKey = `${x},${z + 1}`
      const wChunkKey = `${x - 1},${z}`

      const nChunk = this.mainChunks.get(nChunkKey) ?? false
      const eChunk = this.mainChunks.get(eChunkKey) ?? false
      const sChunk = this.mainChunks.get(sChunkKey) ?? false
      const wChunk = this.mainChunks.get(wChunkKey) ?? false

      chunk.setNeighbours(nChunk, eChunk, sChunk, wChunk)
    }

    // All not main chunks in depth order
    const chunks = [...this.allChunks.values()].filter(chunk => chunk.depth > 0).sort((a, b) => a.depth - b.depth)

    for (const chunk of chunks) {
      let nChunk = false
      let eChunk = false
      let sChunk = false
      let wChunk = false

      /**
       * North
       */
      // From quad
      if (chunk.quadPosition === 'sw')
        nChunk = chunk.parent.children.get('nw')

      // From quad
      else if (chunk.quadPosition === 'se')
        nChunk = chunk.parent.children.get('ne')

      // From parent neighbours
      else {
        const parentNeighbour = chunk.parent.neighbours.get('n')
        if (parentNeighbour) {
          if (parentNeighbour.splitted)
            nChunk = parentNeighbour.children.get(chunk.quadPosition === 'nw' ? 'sw' : 'se')
          else
            nChunk = parentNeighbour
        }
      }

      /**
       * East
       */
      // From quad
      if (chunk.quadPosition === 'nw')
        eChunk = chunk.parent.children.get('ne')

      // From quad
      else if (chunk.quadPosition === 'sw')
        eChunk = chunk.parent.children.get('se')

      // From parent neighbours
      else {
        const parentNeighbour = chunk.parent.neighbours.get('e')
        if (parentNeighbour) {
          if (parentNeighbour.splitted)
            eChunk = parentNeighbour.children.get(chunk.quadPosition === 'ne' ? 'nw' : 'sw')
          else
            eChunk = parentNeighbour
        }
      }

      /**
       * South
       */
      // From quad
      if (chunk.quadPosition === 'nw')
        sChunk = chunk.parent.children.get('sw')

      // From quad
      else if (chunk.quadPosition === 'ne')
        sChunk = chunk.parent.children.get('se')

      // From parent neighbours
      else {
        const parentNeighbour = chunk.parent.neighbours.get('s')
        if (parentNeighbour) {
          if (parentNeighbour.splitted)
            sChunk = parentNeighbour.children.get(chunk.quadPosition === 'sw' ? 'nw' : 'ne')
          else
            sChunk = parentNeighbour
        }
      }

      /**
       * West
       */
      // From quad
      if (chunk.quadPosition === 'ne')
        wChunk = chunk.parent.children.get('nw')

      // From quad
      else if (chunk.quadPosition === 'se')
        wChunk = chunk.parent.children.get('sw')

      // From parent neighbours
      else {
        const parentNeighbour = chunk.parent.neighbours.get('w')
        if (parentNeighbour) {
          if (parentNeighbour.splitted)
            wChunk = parentNeighbour.children.get(chunk.quadPosition === 'nw' ? 'ne' : 'se')
          else
            wChunk = parentNeighbour
        }
      }

      chunk.setNeighbours(nChunk, eChunk, sChunk, wChunk)
    }
  }

  // 计算并返回玩家周围的主要地形块坐标。这些坐标用于生成和维护与玩家接近的地形块。
  getMainChunksCoordinates() {
    const player = this.state.player
    const currentX = Math.round(player.position.current[0] / this.maxSize)
    const currentZ = Math.round(player.position.current[2] / this.maxSize)

    // Find normalize neighbours
    const mainChunksCoordinates = [
      { x: currentX, z: currentZ }, // Current
      { x: currentX, z: currentZ + 1 }, // Up
      { x: currentX + 1, z: currentZ + 1, }, // Up right
      { x: currentX + 1, z: currentZ }, // Right
      { x: currentX + 1, z: currentZ - 1 }, // Down right 
      { x: currentX, z: currentZ - 1 }, // Down
      { x: currentX - 1, z: currentZ - 1 }, // Down left
      { x: currentX - 1, z: currentZ }, // Left
      { x: currentX - 1, z: currentZ + 1 }, // Up left
    ]

    // Create key and multiply by max size of chunks
    for (const coordinates of mainChunksCoordinates) {
      coordinates.coordinatesX = coordinates.x
      coordinates.coordinatesZ = coordinates.z
      coordinates.key = `${coordinates.x},${coordinates.z}`
      coordinates.x *= this.maxSize
      coordinates.z *= this.maxSize
    }

    return mainChunksCoordinates
  }

  // 根据玩家与地形块的距离判断是否需要进一步划分块
  underSplitDistance(size, chunkX, chunkY) {
    const player = this.state.player
    const distance = Math.hypot(player.position.current[0] - chunkX, player.position.current[2] - chunkY)
    return distance < size * this.splitRatioPerSize
  }

  // 获取直接子块
  getChildChunkForPosition(x, z) {
    for (const [key, chunk] of this.mainChunks) {
      if (chunk.isInside(x, z)) {
        return chunk
      }
    }
  }

  // 获取最深层的子块
  getDeepestChunkForPosition(x, z) {
    const baseChunk = this.getChildChunkForPosition(x, z)
    if (!baseChunk)
      return false

    const chunk = baseChunk.getChildChunkForPosition(x, z)
    return chunk
  }

  // 获取地形块的海拔信息
  getElevationForPosition(x, z) {
    const currentChunk = this.getDeepestChunkForPosition(x, z)

    if (!currentChunk || !currentChunk.terrain)
      return false

    const elevation = currentChunk.terrain.getElevationForPosition(x, z)
    return elevation
  }
}