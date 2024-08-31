import { Texture } from "three"
import Debugger from "../utils/Debugger"

export default class TerrainGradient {
  constructor() {

    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.texture = new Texture(this.canvas)

    this.colors = {
      aboveFar: '#ffffff',
      aboveClose: '#a6c33c',
      belowClose: '#2f3d36',
      belowFar: '#011018',

      // aboveFar: '#f4e5ff',
      // aboveClose: '#5900ff',
      // belowClose: '#0d0061',
      // belowFar: '#003242',
    }

    this.width = 1
    this.height = 512

    // this.canvas.width = this.width
    // this.canvas.height = this.height

    // this.canvas.style.position = 'fixed'
    // this.canvas.style.top = '48px'
    // this.canvas.style.left = '0'
    // this.canvas.style.zIndex = 1
    // document.body.append(this.canvas)

    this.update()
    this.setDebug()
  }

  update() {
    const fill = this.context.createLinearGradient(0, 0, 0, this.height)
    fill.addColorStop(0, this.colors.aboveFar)
    fill.addColorStop(0.49999, this.colors.aboveClose)
    fill.addColorStop(0.51111, this.colors.belowClose)
    fill.addColorStop(1, this.colors.belowFar)

    this.context.fillStyle = fill
    this.context.fillRect(0, 0, this.width, this.height)

    this.texture.needsUpdate = true
  }

  setDebug() {
    if (!Debugger.gui)
      return

    const folder = Debugger.gui.getFolder('view/terrains/gradient')

    for (const colorKey in this.colors) {
      folder
        .addColor(this.colors, colorKey)
        .onChange(() => this.update())
    }
  }
}