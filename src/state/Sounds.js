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
        this.music.pause(MUSIC.AURORA)
        this.music.pause(MUSIC.SUNRISE)
        musicEl.classList.add('disabled')
      } else {
        musicEl.classList.remove('disabled')
      }
    })

    state.day.on('sunrise', stamp => {
      if (stamp && this.enable) {
        this.music.pause(MUSIC.AURORA)
        this.music.play(MUSIC.SUNRISE)
      }
    })

    state.day.on('aurora', stamp => {
      if (stamp && this.enable) {
        this.music.pause(MUSIC.SUNRISE)
        this.music.play(MUSIC.AURORA)
      }
    })
  }

  update() {}

  destroy() {
    this.off('sunrise')
    this.off('aurora')
  }
}