import GUI from 'lil-gui'

export default class Debugger {

  static gui

  constructor() {
    this.tree = {}
    this.tree.folder = this.instance
    this.tree.children = {}

    this.init()
  }

  init() {
    this.hashChange() // first loaded
    window.addEventListener('hashchange', this.hashChange, false)
  }

  hashChange = () => {
    if (location.hash.includes('debug')) {
      Debugger.gui = new GUI({ title: 'debug' })
    } else if (Debugger.gui) {
      Debugger.gui.destroy()
      Debugger.gui = null
    }
  }

  getFolder(path) {
    const parts = path.split('/')

    let branch = this.tree

    for (const part of parts) {
      let newBranch = branch.children[part]

      if (!newBranch) {
        newBranch = {}
        newBranch.folder = branch.folder.addFolder(part)
        newBranch.folder.close()
        newBranch.children = {}
      }

      branch.children[part] = newBranch
      branch = newBranch
    }

    return branch.folder
  }

  destroy() {
    window.removeEventListener('hashchange', this.hashChange, false)
    if (Debugger.gui) {
      Debugger.gui.destroy()
      Debugger.gui = null
    }
  }
}