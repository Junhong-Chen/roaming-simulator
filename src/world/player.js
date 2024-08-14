import { AnimationMixer } from "three"

export default class Player {
  constructor(world) {

    const modelFile = world.res.get('brainStem')[0].file

    const { scene, animations } = modelFile

    if (scene) world.scene.add(scene)

    if (animations) {
      const mixer = new AnimationMixer(scene)

      const actions = {}
      let active

      for (let i = 0; i < animations.length; i++) {
        const clip = animations[i]
        const name = clip.name || i
        actions[name] = mixer.clipAction(clip)
        if (i === 0) {
          active = name
        }
      }

      world.addUpdateFn(deltaTime => mixer.update(deltaTime))

      actions[active].play()
    }
  }
}