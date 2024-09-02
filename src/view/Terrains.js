import { DoubleSide, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, ShaderMaterial, SphereGeometry, Vector3 } from "three"

import Terrain from "./Terrain.js"
import TerrainMaterial from "../materials/TerrainMaterial.js"

const biasMatrix = new Matrix4(
  0.5, 0.0, 0.0, 0.5,
  0.0, 0.5, 0.0, 0.5,
  0.0, 0.0, 0.5, 0.5,
  0.0, 0.0, 0.0, 1.0
)

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

    // 查看shadow map
    // 创建一个平面几何体来显示 shadowMap
    const planeGeometry = new PlaneGeometry(10, 10)
    this.shadowMapMaterial = new MeshBasicMaterial({ side: DoubleSide })

    // 创建平面网格并添加到场景中
    const shadowMapPlane = new Mesh(planeGeometry, this.shadowMapMaterial)
    shadowMapPlane.position.set(0, 8, 0) // 设置平面的位置，以便在场景中看到它
    this.view.scene.add(shadowMapPlane)
  }

  setMaterial() {
    this.material = new TerrainMaterial()
    this.material.uniforms.uPlayerPosition.value = new Vector3()
    this.material.uniforms.uLightnessSmoothness.value = 0.25
    this.material.uniforms.uFresnelOffset.value = 0
    this.material.uniforms.uFresnelScale.value = 0.5
    this.material.uniforms.uFresnelPower.value = 2
    this.material.uniforms.uSunPosition.value = new Vector3(- 0.5, - 0.5, - 0.5)
    this.material.uniforms.uFogTexture.value = this.view.sky.customRender.texture
    this.material.uniforms.uGrassDistance.value = this.view.state.chunks.minSize

    this.material.onBeforeRender = (renderer, scene, camera, geometry, mesh) => {
      this.material.uniforms.uTexture.value = mesh.userData.texture
     
      this.material.uniformsNeedUpdate = true
    }
  }

  setDebug() {
    const debug = this.view.debug
    if (!debug.gui)
      return

    const folder = debug.getFolder('view/terrains')

    folder
      .add(this.material, 'wireframe')

    folder
      .add(this.material.uniforms.uLightnessSmoothness, 'value')
      .min(0)
      .max(1)
      .step(0.001)
      .name('uLightnessSmoothness')

    folder
      .add(this.material.uniforms.uFresnelOffset, 'value')
      .min(- 1)
      .max(1)
      .step(0.001)
      .name('uFresnelOffset')

    folder
      .add(this.material.uniforms.uFresnelScale, 'value')
      .min(0)
      .max(2)
      .step(0.001)
      .name('uFresnelScale')

    folder
      .add(this.material.uniforms.uFresnelPower, 'value')
      .min(1)
      .max(10)
      .step(1)
      .name('uFresnelPower')
  }

  update() {
    const playerPosition = this.view.state.player.position.current
    const sunPosition = this.view.state.sun.position
    
    this.material.uniforms.uPlayerPosition.value.set(playerPosition[0], playerPosition[1], playerPosition[2])
    this.material.uniforms.uSunPosition.value.copy(sunPosition)

    const light = this.view.light.playerLight
    if (light) {
      this.material.uniforms.uShadowMapTexture.value = light.shadow.map.texture
      this.material.uniforms.uShadowMatrix.value = light.shadow.matrix
    }
    this.shadowMapMaterial.map = light.shadow.map.texture // 查看 shadowMap 纹理
    this.shadowMapMaterial.needsUpdate = true
  }

  resize() { }
}