import { AnimationMixer, BoxGeometry, Group, MathUtils, Mesh, MeshStandardMaterial } from "three"

export default class Player {
  constructor(view) {
    this.state = view.state

    this.group = new Group()
    view.scene.add(this.group)
  }

  load(files) {
    const modelFile = files.get('player')[0].file

    const { scene: model, animations } = modelFile

    if (model) {
      this.model = model
      model.traverse(child => {
        if (child instanceof Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      this.group.add(model)
    }

    this.mixer = new AnimationMixer(model)
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

  update(deltaTime) {
    if (this.mixer) this.mixer.update(deltaTime)

    const { position, rotation } = this.state.player
    this.group.position.set(...position)

    if (this.model) {
      let targetRotation = rotation - Math.PI // 使角色模型面朝前方
  
      // 计算角度差，并将其限制在 [-π, π] 之间
      let diffRotation = (targetRotation - this.model.rotation.y) % (Math.PI * 2)
      if (diffRotation > Math.PI) {
        diffRotation -= 2 * Math.PI
      } else if (diffRotation < -Math.PI) {
        diffRotation += 2 * Math.PI
      }
    
      // 更新 model 的旋转角度，以最小角度旋转
      this.model.rotation.y = MathUtils.lerp(this.model.rotation.y, this.model.rotation.y + diffRotation, 0.1)
    }
  }

  destroy() {
    this.state.player.off('action')
  }
}