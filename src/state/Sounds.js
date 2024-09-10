import { MUSIC } from "../audio/Audios"

export default class Sounds {
  constructor(state) {
    this.audios = state.app.audios
    this.enable = false
    const musicEl = document.querySelector('#music')

    musicEl.addEventListener('click', (e) => {
      this.enable = !this.enable

      if (!this.enable) {
        this.audios.stop(MUSIC.AURORA)
        this.audios.stop(MUSIC.SUNRISE)
        musicEl.classList.add('disabled')
      } else {
        musicEl.classList.remove('disabled')
      }
    })

    state.day.on('sunrise', stamp => {
      if (stamp && this.enable) {
        this.audios.stop(MUSIC.AURORA)
        this.audios.play(MUSIC.SUNRISE)
      }
    })

    state.day.on('aurora', stamp => {
      if (stamp && this.enable) {
        this.audios.stop(MUSIC.SUNRISE)
        this.audios.play(MUSIC.AURORA)
      }
    })
  }

  update() {}

  destroy() {
    this.off('sunrise')
    this.off('aurora')
  }
}