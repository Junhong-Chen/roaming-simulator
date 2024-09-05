import { DoubleSide, Vector3 } from "three"

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
    this.material.uniforms.uFogTexture.value = this.view.sky.customRender.texture

    this.material.onBeforeRender = (renderer, scene, camera, geometry, mesh) => {
      this.material.uniforms.uTexture.value = mesh.userData.texture
     
      this.material.uniformsNeedUpdate = true
    }
  }

  setDebug() { }

  update() {
    const playerPosition = this.view.state.player.position.current
    const sunPosition = this.view.state.sun.position
    
    this.material.uniforms.uPlayerPosition.value.set(...playerPosition)
    this.material.uniforms.uSunPosition.value.copy(sunPosition)

    const light = this.view.light.playerLight
    if (light) {
      this.material.uniforms.uShadowMapTexture.value = light.shadow.map.texture
      this.material.uniforms.uShadowMatrix.value = light.shadow.matrix
    }
  }

  resize() { }
}