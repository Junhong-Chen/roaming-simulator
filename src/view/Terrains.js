import { Vector3 } from "three"

import Terrain from "./Terrain.js"
import TerrainMaterial from "../materials/TerrainMaterial.js"

export default class Terrains {
  constructor(view) {
    this.view = view

    this.setMaterial()
    this.setDebug()

    this.view.state.terrains.on('create', (engineTerrain) => {
      const terrain = new Terrain(view, this, engineTerrain)

      engineTerrain.on('destroy', () => {
        terrain.destroy()
      })
    })
  }

  setMaterial() {
    this.material = new TerrainMaterial()
    this.material.uniforms.uPlayerPosition.value = new Vector3()
    this.material.uniforms.uSunPosition.value = new Vector3(- 0.5, - 0.5, - 0.5)

    this.material.onBeforeRender = (renderer, scene, camera, geometry, mesh) => {
      this.material.uniforms.uTexture.value = mesh.userData.texture
     
      this.material.uniformsNeedUpdate = true
    }
  }

  setDebug() { }

  update() {
    const playerPosition = this.view.state.player.position
    const sunState = this.view.state.sun
    const uniforms = this.material.uniforms

    uniforms.uPlayerPosition.value.set(...playerPosition)
    uniforms.uSunPosition.value.set(...sunState.position)
    uniforms.uIntensity.value = sunState.intensity

    const light = this.view.light.playerLight
    if (light) {
      uniforms.uShadowMapTexture.value = light.shadow.map.texture
      uniforms.uShadowMatrix.value = light.shadow.matrix
    }
  }

  resize() { }
}