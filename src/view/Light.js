import { AmbientLight, DirectionalLight } from "three"

export default class Light {

  constructor(view) {
    this.view = view
    this.setAmbientLight()
    this.setPlayerLight()
  }

  setAmbientLight() {
    this.aLight = new AmbientLight('white', 0.2)
    this.view.scene.add(this.aLight)
  }

  setPlayerLight() {
    this.playerLightIntensity = 5
    this.playerLight = new DirectionalLight('white', this.playerLightIntensity)
    this.playerLight.castShadow = true
    this.playerLight.shadow.camera.far = 16
    this.playerLight.shadow.camera.top = 8
    this.playerLight.shadow.camera.right = 8
    this.playerLight.shadow.camera.bottom = -8
    this.playerLight.shadow.camera.left = -8
    this.playerLight.shadow.mapSize.set(2048, 2048)
    this.playerLight.shadow.normalBias = 0.05

    this.view.player.group.add(this.playerLight)
  }

  update() {
    const intensity = -(this.view.state.day.progress - 0.5) * 2 * this.playerLightIntensity
    this.playerLight.intensity = Math.max(0, intensity)

    const position = this.view.state.sun.position.clone().multiplyScalar(10)
    this.playerLight.position.copy(position)
  }
}