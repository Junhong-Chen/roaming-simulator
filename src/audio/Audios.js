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

  constructor() {}
  
  load(files) {
    this.listener = new AudioListener() // 控制音频及音频空间化的核心组件
    files.get('bgm').forEach(({ file: audioBuffer  }) => {
      this.#audios[audioBuffer.name] = new Audio(this.listener)
      this.#audios[audioBuffer.name].setBuffer(audioBuffer)
    })

    files.get('sounds').forEach(({ file: audioBuffer  }) => {
      this.#audios[audioBuffer.name] = new Audio(this.listener)
      this.#audios[audioBuffer.name].setBuffer(audioBuffer)
      if (audioBuffer.name.includes('sand'))
        this.#audios[audioBuffer.name].setVolume(0.1) // sand 的音源声音有点大
    })
  }

  play(name) {
    if (this.#audios[name].isPlaying)
      this.stop(name)
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