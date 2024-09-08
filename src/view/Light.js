import { AmbientLight, DirectionalLight, Vector3 } from "three"
import { smoothstep } from "../utils/utils"

export default class Light {

  constructor(view) {
    this.view = view
    this.setAmbientLight()
    this.setPlayerLight()
  }

  setAmbientLight() {
    this.aLight = new AmbientLight('white', 1)
    this.view.scene.add(this.aLight)
  }

  setPlayerLight() {
    this.playerLight = new DirectionalLight('white', 5)
    this.playerLight.castShadow = true
    this.playerLight.shadow.camera.far = 32
    this.playerLight.shadow.camera.top = 8
    this.playerLight.shadow.camera.right = 8
    this.playerLight.shadow.camera.bottom = -8
    this.playerLight.shadow.camera.left = -8
    this.playerLight.shadow.mapSize.set(2048, 2048)
    this.playerLight.shadow.normalBias = 0.05

    this.view.player.group.add(this.playerLight)
  }

  update() {
    const sunState = this.view.state.sun
    this.playerLight.intensity = Math.max(0, (sunState.intensity - 0.5) * 5)
    this.aLight.intensity = Math.max(0.1, smoothstep(0.4, 1, sunState.intensity))

    const position = new Vector3(...sunState.position).multiplyScalar(10)
    this.playerLight.position.copy(position)
  }
}