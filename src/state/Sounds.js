import { MUSIC } from "../audio/Audios"
import sources from "../sources"

export default class Sounds {
  constructor(state) {
    this.audios = state.app.audios
    this.enable = false

    this.counts = {}
    this.setSoundsCount()

    const musicEl = document.querySelector('#music')

    this.enabled = () => {
      this.enable = !this.enable

      if (!this.enable) {
        this.audios.stop(MUSIC.AURORA)
        this.audios.stop(MUSIC.SUNRISE)
        musicEl.classList.add('disabled')
      } else {
        musicEl.classList.remove('disabled')
      }
    }

    musicEl.addEventListener('click', this.enabled, false)

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

    state.player.on('moving', ({ terrain, action }) => {
      const audioName = `/${import.meta.env.VITE_BASE_PATH}/sounds/${terrain}/${action}/${this.getSoundRamdom(terrain, action)}.ogg`
      this.audios.play(audioName)
    })
  }

  setSoundsCount() {
    const sounds = sources.find(i => i.name === 'sounds')

    if (sounds) {
      sounds.paths.forEach(path => {
        const [_, terrain, action] = path.split('/')
        const name = `${terrain}_${action}`

        if (this.counts[name] === undefined) {
          this.counts[name] = 0
        } else {
          this.counts[name]++
        }

      })
    }
  }

  getSoundRamdom(terrain, action) {
    return Math.ceil(Math.random() * this.counts[`${terrain}_${action}`])
  }

  update() {}

  destroy() {
    this.off('sunrise')
    this.off('aurora')
  }
}