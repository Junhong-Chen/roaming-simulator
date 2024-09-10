export default class UI {
  constructor() {
    this.setCursor()

    const uiEl = document.querySelector('#ui')
    const entryEl = uiEl.querySelector('#entry')
    const entry = function() {
      uiEl.classList.add('hide')
      entryEl.removeEventListener('click', entry, false)

      setTimeout(function() {
        uiEl.remove()
      }, 500)
    }
    entryEl.addEventListener('click', entry, false)
  }

  setCursor() {
    this.addGrabbing = function () {
      document.body.classList.add('grabbing')
    }
    this.removeGrabbing = function () {
      document.body.classList.remove('grabbing')
    }

    document.body.addEventListener('mousedown', this.addGrabbing, false)

    document.body.addEventListener('mouseup', this.removeGrabbing, false)
  }

  destroy() {
    document.body.removeEventListener('mousedown', this.addGrabbing, false)

    document.body.removeEventListener('mouseup', this.removeGrabbing, false)
  }
}