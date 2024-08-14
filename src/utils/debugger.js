import GUI from 'lil-gui'

export default class Debugger {

  static gui

  constructor() {
    this.init()
  }

  init() {
    this.hashChange() // first loaded
    window.addEventListener('hashchange', this.hashChange, false)
  }

  hashChange = () => {
    if (location.hash.includes('debug')) {
      Debugger.gui = new GUI()
    } else if (Debugger.gui) {
      Debugger.gui.destroy()
      Debugger.gui = null
    }
  }

  destroy() {
    window.removeEventListener('hashchange', this.hashChange, false)
    if (Debugger.gui) {
      Debugger.gui.destroy()
      Debugger.gui = null
    }
  }
}