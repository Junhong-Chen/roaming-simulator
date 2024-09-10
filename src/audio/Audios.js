import { Audio, AudioListener } from "three"

export const MUSIC = {
  SUNRISE: 'sunrise',
  AURORA: 'aurora',
}

export const SOUNDS = {
  GRASS_WALK1: 'grass_walk1'
}

export default class Audios {
  #audios = {}

  constructor() {
    this.listener = new AudioListener() // 控制音频及音频空间化的核心组件
  }

  load(files) {
    files.get('bgm').forEach(({ file: audioBuffer  }) => {
      this.#audios[audioBuffer.name] = new Audio(this.listener)
      this.#audios[audioBuffer.name].setBuffer(audioBuffer)
    })
  }

  play(name) {
    this.#audios[name].play()
  }

  pause(name) {
    this.#audios[name].pause()
  }
  
  stop(name) {
    this.#audios[name].stop()
  }

  switch() { }
}