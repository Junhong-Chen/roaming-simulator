import { AmbientLight, DirectionalLight } from "three"

export default class Light {

  constructor(view) {
    const aLight = this.ambientLight()
    const dLight = this.directionalLight()

    view.scene.add(aLight, dLight)
  }

  ambientLight() {
    return new AmbientLight('white', 0.2)
  }

  directionalLight() {
    const dLight = new DirectionalLight('white', 3)
    dLight.position.set(4, 4, 4)
    dLight.castShadow = true
    dLight.shadow.camera.far = 16
    dLight.shadow.mapSize.set(256, 256)
    dLight.shadow.normalBias = 0.05
    return dLight
  }
}