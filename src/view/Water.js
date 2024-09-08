import { LinearFilter, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Plane, PlaneGeometry, RepeatWrapping, TextureLoader, Uniform, Vector2, Vector3, Vector4, WebGLRenderTarget } from "three"
import { smoothstep } from "../utils/utils"
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js"

import WaterMaterial from "../materials/WaterMaterial"
import waveShader from "../shaders/water/wave.glsl"

export default class Water extends Mesh {
  constructor(view) {
    const waterSize = view.state.water.size.water
    super(new PlaneGeometry(waterSize, waterSize))
    this.view = view

    const renderTarget = this.createRendererTarget()

    this.createWaveTexture()

    const normalSampler = new TextureLoader().load('textures/waternormals.jpg', function (texture) {
      texture.wrapS = texture.wrapT = RepeatWrapping
    })

    const material = this.material = new WaterMaterial({
      fog: view.scene.fog !== undefined
    })

    material.uniforms.mirrorSampler.value = renderTarget.texture
    material.uniforms.normalSampler.value = normalSampler

    const mirrorCamera = new PerspectiveCamera() // 镜像相机
    const mirrorPlane = new Plane() // 镜像屏幕
    const mirrorWorldPosition = new Vector3()
    const cameraWorldPosition = new Vector3()
    const rotationMatrix = new Matrix4()
    const lookAtPosition = new Vector3(0, 0, - 1)
    const normal = new Vector3(0, 1, 0) // 水面法线

    const clipPlane = new Vector4()
    const clipBias = 0

    const v = new Vector3() // 视线向量
    const target = new Vector3()
    const q = new Vector4()

    const textureMatrix = material.uniforms.textureMatrix.value
    const eye = material.uniforms.eye.value

    const scope = this
    this.onBeforeRender = function (renderer, scene, camera) {

      mirrorWorldPosition.setFromMatrixPosition(scope.matrixWorld) // 获取镜面（水面）在世界坐标的位置
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld) // 获取相机在世界坐标的位置

      rotationMatrix.extractRotation(scope.matrixWorld) // 获取水面旋转矩阵，忽略平移和缩放部分。这一步是为了后续计算法线方向

      normal.set(0, 1, 0)
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

    this.geometry.rotateX(-Math.PI * 0.5)
    view.scene.add(this)

    this.setDebug()
  }

  createRendererTarget() {
    const { width, height } = this.view.viewport
    this.renderTarget = new WebGLRenderTarget(width, height)
    return this.renderTarget
  }

  createWaveTexture() {
    const size = 512 // 纹理大小
    const gpgpu = this.gpgpu = {
      size
    }
    gpgpu.computation = new GPUComputationRenderer(size, size, this.view.renderer)

    const texture = gpgpu.computation.createTexture()
    const color = texture.image.data
    for (let i = 0; i < size * size; i++) {
      const k = i * 4
      // texture 中每个像素包含 RBGA 四个值，RG 分别表示当前帧与前一帧的值， BA 表示当前玩家位置
      color[k + 0] = 0
      color[k + 1] = 0
      color[k + 2] = 0
      color[k + 3] = 0
    }

    // 将纹理注入到 shader 中
    gpgpu.waveVariable = gpgpu.computation.addVariable('uWaveTexture', waveShader, texture)

    const uniforms = gpgpu.waveVariable.material.uniforms
    uniforms.uTime = new Uniform(0)
    uniforms.uPlayerUv = new Uniform(new Vector2())

    // 将变量自己作为依赖项，将现在的状态发送到下一次计算中，达到数据可持续化的效果
    gpgpu.computation.setVariableDependencies(gpgpu.waveVariable, [gpgpu.waveVariable])
    gpgpu.computation.init()

    // 降低更新频率
    this.timer = setInterval(() => {
      this.gpgpu.computation.compute()
    }, 66.66)
    
  }

  resize(width, height) {
    this.renderTarget.setSize(width, height)
  }

  update() {
    const playerState = this.view.state.player
    const clock = this.view.clock
    const sunState = this.view.state.sun
    const waterSate = this.view.state.water

    // GPGPU update
    const waveUniforms = this.gpgpu.waveVariable.material.uniforms
    waveUniforms.uPlayerUv.value.set(...waterSate.playerUv)
    // this.gpgpu.computation.compute()
    
    const uniforms = this.material.uniforms
    uniforms.time.value = clock.elapsed
    uniforms.distortionScale.value = smoothstep(3, 10, playerState.camera.position[1]) * 0.5 + 0.175
    uniforms.uIntensity.value = sunState.intensity
    uniforms.uWaveTexture.value = this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.waveVariable).texture

    this.position.set(...waterSate.position)
  }

  setDebug() {
    const debug = this.view.debug
    if (!debug.gui)
      return

    const debugObj = {
      logDistortion: () => {
        console.log(this.material.uniforms.distortionScale.value)
      }
    }
    const waterFolder = debug.getFolder('view/water')

    waterFolder.add(debugObj, 'logDistortion')
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}