import EventEmitter from "./EventEmitter"

export default class UI extends EventEmitter {
  constructor() {
    super()

    const uiEl = document.querySelector('#ui')
    const entryEl = uiEl.querySelector('#entry')
    const entry = () => {
      this.emit('start')
      uiEl.classList.add('hide')
      entryEl.removeEventListener('click', entry, false)

      setTimeout(function() {
        uiEl.remove()
      }, 500)
    }
    entryEl.addEventListener('click', entry, false)
  }

  destroy() { }
}