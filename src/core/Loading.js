import { LoadingManager } from "three"

export default class Loading {
  constructor() {
    const entryEl = document.querySelector('#entry')
    const barEl = entryEl.querySelector('#bar')

    this.manager = new LoadingManager(
      () => { // onLoad
        entryEl.classList.add('ready')
      },
      (_, loaded, total) => { // onProgress
        barEl.style.width = `${Math.ceil(loaded / total) * 100}%`
      }
    )
  }

  destroy() {}
}