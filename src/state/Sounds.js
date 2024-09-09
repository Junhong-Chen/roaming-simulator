import { MUSIC } from "../audio/music"

export default class Sounds {
  constructor(state) {
    this.music = state.app.music
    this.enable = false
    const musicEl = document.querySelector('#music')

    const initMusic = () => {
      this.music.init()
      musicEl.classList.remove('disabled')
      this.enable = true
      window.removeEventListener('click', initMusic, false)
    }
    window.addEventListener('click', initMusic, false)

    musicEl.addEventListener('click', (e) => {
      this.enable = !this.enable

      if (!this.enable) {
        this.music.pause(MUSIC.BGM)
        musicEl.classList.add('disabled')
      } else {
        musicEl.classList.remove('disabled')
      }
    })

    state.day.on('day', day => {
      console.log(!day, this.enable)
      if (!day && this.enable) this.music.play(MUSIC.BGM)
    })
  }

  update() {}

  destroy() {
    this.off('day')
  }
}