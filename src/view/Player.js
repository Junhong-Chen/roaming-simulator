import { AnimationMixer, Group, MathUtils } from "three"

export default class Player {
  constructor(view, files) {
    this.state = view.state
    this.group = new Group()
    view.scene.add(this.group)

    const modelFile = files.get('player')[0].file

    const { scene, animations } = modelFile

    if (scene) this.group.add(scene)

    this.mixer = new AnimationMixer(scene)
    if (animations) this.initActions(animations)
  }

  initActions(actions) {
    this.actions = {}
    for (let i = 0; i < actions.length; i++) {
      const clip = actions[i]
      const name = clip.name || i
      const action = this.actions[name] = this.mixer.clipAction(clip)
      this.setActionWeight(action, 0)
      action.play()
    }
    // this.setActionWeight(this.actions[this.state.player.action], 1)
    this.setActionWeight(this.actions[this.state.player.action], 1)

    this.state.player.on('action', e => {
      const before = this.actions[e.before]
      const current = this.actions[e.current]
      this.changeAction(before, current)
    })
  }

  setActionWeight(action, weight) {
    action.enabled = true
    action.setEffectiveTimeScale(1)
    action.setEffectiveWeight(weight)
  }

  changeAction(before, current, duration = 0.5) {
    current.time = 0
    this.setActionWeight(current, 1)
    before.crossFadeTo(current, duration, true)
  }

  updateCrossFadeControls() {
    Object.values(this.actions).forEach(action => {
      if (action.weight === 0) {

      }
    })
  }

  update(deltaTime) {
    this.mixer.update(deltaTime)

    const { position, rotation } = this.state.player
    this.group.position.set(...position.current)

    let targetRotation = rotation - Math.PI
    // 计算角度差
    let diffRotation = targetRotation - this.group.rotation.y
    if (diffRotation > Math.PI) {
      targetRotation -= 2 * Math.PI
    } else if (diffRotation < -Math.PI) {
      targetRotation += 2 * Math.PI
    }

    this.group.rotation.y = MathUtils.lerp(this.group.rotation.y, targetRotation, 0.1)

    this.updateCrossFadeControls()
  }

  destroy() {
    this.state.player.off('action')
  }
}