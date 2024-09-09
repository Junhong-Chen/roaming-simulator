export const MUSIC = {
  BGM: 'bgm'
}

export default class Music {
  static MUSIC

  #audio = {}
  #enabled = {}

  constructor() {
    this.#audio[MUSIC.BGM] = new Audio('/sounds/ethereal.mp3')
    this.#enabled[MUSIC.BGM] = false
  }

  init() {
    if (!this.#enabled[MUSIC.BGM]) {
      this.#audio[MUSIC.BGM].volume = 0
      this.#audio[MUSIC.BGM].play().then(() => {
        this.#audio[MUSIC.BGM].pause()
        this.#audio[MUSIC.BGM].currentTime = 0
        this.#audio[MUSIC.BGM].volume = 1
        this.#enabled[MUSIC.BGM] = true
      })
    }
  }

  play(name) {
    this.#audio[name].currentTime = 0
    this.#audio[name].play()
  }

  pause(name) {
    this.#audio[name].pause()
  }

  switch() { }
}