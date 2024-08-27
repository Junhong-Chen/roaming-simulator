export default class Music {
  #audio
  #analyser
  #dataArray

  get analyser() {
    if (this.#analyser) this.#analyser.getByteFrequencyData(this.#dataArray)
    return this.#dataArray || []
  }

  constructor() {
    this.init()
  }

  init() {
    const autoPlay = () => {
      this.#audio = new Audio('/sounds/music.mp3')
      this.#audio.setAttribute('loop', true)
  
      const audioCtx = new window.AudioContext()
      this.#analyser = audioCtx.createAnalyser()
      const source = audioCtx.createMediaElementSource(this.#audio)
  
      source.connect(this.#analyser)
      this.#analyser.connect(audioCtx.destination)
  
      this.#analyser.fftSize = 32
      this.#dataArray = new Uint8Array(this.#analyser.frequencyBinCount)
      this.play()
      window.removeEventListener('mousedown', autoPlay, false)
    }
    window.addEventListener('mousedown', autoPlay, false)
  }

  play() {
    this.#audio.play()
  }

  pause() {
    this.#audio.pause()
  }

  switch() {}
}