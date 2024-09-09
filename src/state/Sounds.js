import EventEmitter from "../core/EventEmitter"
import { MUSIC } from "../audio/music"

export default class Sounds extends EventEmitter {
  constructor(state) {
    super()
    this.music = state.app.music

    state.day.on('day', day => {
      if (!day) this.music.play(MUSIC.BGM)
    })
  }

  update() {}

  destroy() {
    this.off('day')
  }
}