import { DoubleSide, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, PlaneGeometry, RepeatWrapping, TextureLoader, Vector3, Vector4, WebGLRenderTarget } from "three"
import WaterMaterial from "../materials/WaterMaterial"
import { remap } from "../utils/utils"

export default class Water extends Mesh {
  constructor(view) {
    super(new PlaneGeometry(2048, 2048))
    this.view = view

    const clipBias = 0
    const alpha = 0.75
    const normalSampler = new TextureLoader().load('textures/waternormals.jpg', function (texture) {

      texture.wrapS = texture.wrapT = RepeatWrapping

    })
    const sunDirection = new Vector3(0.70707, 0.70707, 0.0)
    const sunColor = 0xffffff
    const waterColor = 0x66a8ff
    const eye = new Vector3(0, 0, 0)
    // const sky = view.sky.background

    const mirrorPlane = new Plane()
    const normal = new Vector3()
    const mirrorWorldPosition = new Vector3()
    const cameraWorldPosition = new Vector3()
    const rotationMatrix = new Matrix4()
    const lookAtPosition = new Vector3(0, 0, - 1)
    const clipPlane = new Vector4()

    const v = new Vector3() // 视线向量
    const target = new Vector3()
    const q = new Vector4()

    const textureMatrix = new Matrix4()

    const mirrorCamera = new PerspectiveCamera()

    const renderTarget = new WebGLRenderTarget(this.view.viewport.width, this.view.viewport.height)

    const material = this.material = new WaterMaterial({
      fog: view.scene.fog !== undefined
    })

    material.uniforms.mirrorSampler.value = renderTarget.texture
    material.uniforms.textureMatrix.value = textureMatrix
    material.uniforms.alpha.value = alpha
    material.uniforms.normalSampler.value = normalSampler
    material.uniforms.sunColor.value = sunColor
    material.uniforms.waterColor.value = waterColor
    material.uniforms.sunDirection.value = sunDirection
    material.uniforms.distortionScale.value = 0.175 // 倒影失真系数
    material.uniforms.eye.value = eye

    const scope = this
    this.onBeforeRender = function (renderer, scene, camera) {

      mirrorWorldPosition.setFromMatrixPosition(scope.matrixWorld) // 获取镜面（水面）在世界坐标的位置
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld) // 获取相机在世界坐标的位置

      rotationMatrix.extractRotation(scope.matrixWorld) // 获取水面旋转矩阵，忽略平移和缩放部分。这一步是为了后续计算法线方向

      normal.set(0, 1, 0) // 水面的法线
      normal.applyMatrix4(rotationMatrix) // 使其与水面的旋转一致

      v.subVectors(mirrorWorldPosition, cameraWorldPosition) // 相机位置到水面中心的视线向量

      // Avoid rendering when mirror is facing away
      if (v.dot(normal) > 0) return // 当相机在水面另一侧时，不渲染反射

      v.reflect(normal).negate() // 通过 normal 将视线向量 v 进行反射并取反
      v.add(mirrorWorldPosition) // 移动到镜面位置，即得到镜像相机位置

      rotationMatrix.extractRotation(camera.matrixWorld)

      // 镜像相机看向的反向
      lookAtPosition.set(0, 0, -1)
      lookAtPosition.applyMatrix4(rotationMatrix)
      lookAtPosition.add(cameraWorldPosition)

      // 镜像相机观察的目标点位
      target.subVectors(mirrorWorldPosition, lookAtPosition)
      target.reflect(normal).negate()
      target.add(mirrorWorldPosition)

      mirrorCamera.position.copy(v)
      mirrorCamera.up.set(0, 1, 0)
      mirrorCamera.up.applyMatrix4(rotationMatrix)
      mirrorCamera.up.reflect(normal)
      mirrorCamera.lookAt(target)

      mirrorCamera.far = camera.far // Used in WebGLBackground

      mirrorCamera.updateMatrixWorld()
      mirrorCamera.projectionMatrix.copy(camera.projectionMatrix)

      // Update the texture matrix
      textureMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      ) // 将矩阵设置为偏移和缩放矩阵
      // 将镜像相机的坐标变换到纹理空间，用于生成反射纹理
      textureMatrix.multiply(mirrorCamera.projectionMatrix)
      textureMatrix.multiply(mirrorCamera.matrixWorldInverse)

      // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
      // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
      mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorldPosition)
      mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse)

      // 将镜像平面转换为裁剪平面 clipPlane，用于更新投影矩阵
      clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant)

      const projectionMatrix = mirrorCamera.projectionMatrix

      // 镜像平面裁剪技术
      q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0]
      q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5]
      q.z = - 1.0
      q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]

      // Calculate the scaled plane vector
      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q))

      // Replacing the third row of the projection matrix
      projectionMatrix.elements[2] = clipPlane.x
      projectionMatrix.elements[6] = clipPlane.y
      projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias
      projectionMatrix.elements[14] = clipPlane.w

      eye.setFromMatrixPosition(camera.matrixWorld)

      // Render

      const currentRenderTarget = renderer.getRenderTarget()

      const currentXrEnabled = renderer.xr.enabled
      const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate

      scope.visible = false

      renderer.xr.enabled = false // Avoid camera modification and recursion
      renderer.shadowMap.autoUpdate = false // Avoid re-computing shadows

      renderer.setRenderTarget(renderTarget)

      renderer.state.buffers.depth.setMask(true) // make sure the depth buffer is writable so it can be properly cleared, see #18897

      if (renderer.autoClear === false) renderer.clear()
      renderer.render(scene, mirrorCamera)

      scope.visible = true

      renderer.xr.enabled = currentXrEnabled
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate

      renderer.setRenderTarget(currentRenderTarget)

      // Restore viewport

      const viewport = camera.viewport

      if (viewport !== undefined) {

        renderer.state.viewport(viewport)

      }

    }

    this.geometry.rotateX(- Math.PI * 0.5)
    view.scene.add(this)

    // this.createMapMesh()
  }

  setCustomRender() {

  }

  createMapMesh() {
    // 查看 map
    // 创建一个平面几何体来显示 shadowMap
    const planeGeometry = new PlaneGeometry(10, 10)
    this.shadowMapMaterial = new MeshBasicMaterial({ side: DoubleSide })
    this.shadowMapMaterial.map = this.waterMesh.renderTarget.texture

    // 创建平面网格并添加到场景中
    const shadowMapPlane = new Mesh(planeGeometry, this.shadowMapMaterial)
    shadowMapPlane.position.set(0, 8, 0) // 设置平面的位置，以便在场景中看到它
    this.view.scene.add(shadowMapPlane)
  }

  update() {
    const playerState = this.view.state.player
    const clock = this.view.clock

    // 同步水面位置
    this.position.set(
      playerState.position.current[0],
      0,
      playerState.position.current[2]
    )

    // 查看纹理
    // this.shadowMapMaterial.needsUpdate = true

    const uniforms = this.material.uniforms
    uniforms.time.value = clock.elapsed * 0.1
  }

  resize() {
    this.renderTarget.setSize(this.view.viewport.width, this.view.viewport.height)
  }
}