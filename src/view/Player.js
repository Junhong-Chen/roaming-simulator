import { AnimationMixer, BoxGeometry, Group, MathUtils, Mesh, MeshStandardMaterial } from "three"

export default class Player {
  constructor(view) {
    this.state = view.state

    this.group = new Group()
    view.scene.add(this.group)
  }

  load(files) {
    const modelFile = files.get('player')[0].file

    const { scene: model } = modelFile

    if (model) {
      this.model = model
      model.traverse(child => {
        if (child instanceof Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      model.rotation.y = -Math.PI
      this.group.add(model)

    }
  }

  update() {
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

  setDebug() {}
}