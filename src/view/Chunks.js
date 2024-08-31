import Chunk from './Chunk.js'

export default class Chunks {
  constructor(view) {

    view.state.chunks.on('create', (chunkState) => {
      const chunk = new Chunk(view, chunkState)

      chunkState.on('destroy', () => {
        chunk.destroy()
      })
    })
  }

  update() {

  }
}