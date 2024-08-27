import { AnimationMixer } from "three"

export default class Player {
  constructor(view, files) {

    const modelFile = files.get('player')[0].file

    const { scene, animations } = modelFile

    if (scene) view.scene.add(scene)

    this.mixer = new AnimationMixer(scene)
    if (animations) {
      const actions = {}
      let active

      for (let i = 0; i < animations.length; i++) {
        const clip = animations[i]
        const name = clip.name || i
        actions[name] = this.mixer.clipAction(clip)
        if (i === 6) {
          active = name
        }
      }

      actions[active].play()
    }
  }

  update(deltaTime) {
    this.mixer.update(deltaTime)
  }

  destroy() {}
}