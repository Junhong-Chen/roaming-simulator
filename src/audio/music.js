export const MUSIC = {
  SUNRISE: 'sunrise',
  AURORA: 'aurora',
}

export const SOUNDS = {
  GRASS_WALK1: 'grass_walk1'
}

export default class Music {
  #audios = {}

  constructor() {
    Object.values(MUSIC).forEach(name => {
      this.#audios[name] = new Audio(`/sounds/${name}.mp3`)
    })

    Object.values(SOUNDS).forEach(name => {
      this.#audios[name] = new Audio(`/sounds/grass/${name}.ogg`)
    })
  }

  init() {
    Object.values(this.#audios).forEach(audio => {
      audio.volume = 0
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
        audio.volume = 1
      })
    })

  }

  play(name) {
    this.#audios[name].currentTime = 0
    this.#audios[name].play()
  }

  pause(name) {
    this.#audios[name].pause()
  }

  switch() { }
}