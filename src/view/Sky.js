import { BufferGeometry, CircleGeometry, Color, Float32BufferAttribute, Mesh, MeshBasicMaterial, Points, Scene, Vector3, WebGLRenderTarget, Group, BoxGeometry, TextureLoader, Uniform, Matrix4, Data3DTexture, RedFormat, LinearFilter, PlaneGeometry } from "three"
import { Lensflare, LensflareElement } from "three/addons"

import SkyMaterial from "../materials/SkyMaterial.js"
import StarsMaterial from "../materials/StarsMaterial.js"
import CloudMaterial from "../materials/CloudMaterial.js"
import AurorasMaterial from "../materials/AurorasMaterial.js"


export default class Sky {
  constructor(view) {
    this.view = view

    this.outerDistance = 1000

    this.group = new Group()
    this.view.scene.add(this.group)

    this.setBackground()
    this.setAuroras()
    this.setSun()
    // this.setCloud()
    this.setStars()
    this.setDebug()
  }

  load(files) {
    const lensflareTexture = files.get('sky')[0].file

    this.setLensflare(lensflareTexture)
  }

  setBackground() {
    this.background = {}
    this.background.mesh = new Mesh(
      new BoxGeometry(),
      new SkyMaterial()
    )
    this.background.mesh.scale.setScalar(10000)

    this.group.add(this.background.mesh)
  }

  setAuroras() {
    this.auroras = {}
    const material = new AurorasMaterial()
    material.uniforms.uResolution.value.set(this.view.viewport.width, this.view.viewport.height)

    this.auroras.mesh = new Mesh(
      new BoxGeometry(),
      material
    )
    this.auroras.mesh.scale.setScalar(10000)

    this.group.add(this.auroras.mesh)
  }

  setSun() {
    this.sun = {}
    this.sun.distance = this.outerDistance - 50

    const geometry = new CircleGeometry(0, 1) // 太阳在背景 shader 中模拟
    const material = new MeshBasicMaterial({ color: 0xffffff })
    this.sun.mesh = new Mesh(geometry, material)
    this.group.add(this.sun.mesh)

  }

  setLensflare(textureFlare) {
    // 光晕
    const lensflare = this.lensflare = new Lensflare()
    lensflare.addElement(new LensflareElement(textureFlare, 20, 0.75, new Color(0x33ff33)))
    lensflare.addElement(new LensflareElement(textureFlare, 100, 0.8), new Color(0xffff00))
    lensflare.addElement(new LensflareElement(textureFlare, 30, 1, new Color(0x48c9b0)))

    this.sun.mesh.add(lensflare)
  }

  setCloud() {
    this.cloud = {}

    const geometry = new BoxGeometry()
    const material = new CloudMaterial()
    
    this.cloud.mesh = new Mesh(geometry, material)
    this.cloud.mesh.scale.setScalar(100)

    this.view.scene.add(this.cloud.mesh)
  }

  setStars() {
    this.stars = {}
    this.stars.count = 500
    this.stars.distance = this.outerDistance

    this.stars.update = () => {
      // Create geometry
      const positionArray = new Float32Array(this.stars.count * 3)
      const sizeArray = new Float32Array(this.stars.count)
      const colorArray = new Float32Array(this.stars.count * 3)

      for (let i = 0; i < this.stars.count; i++) {
        const iStride3 = i * 3

        // Position
        const position = new Vector3()
        position.setFromSphericalCoords(this.stars.distance, Math.acos(Math.random()), 2 * Math.PI * Math.random())

        positionArray[iStride3] = position.x
        positionArray[iStride3 + 1] = position.y
        positionArray[iStride3 + 2] = position.z

        // Size
        sizeArray[i] = Math.pow(Math.random() * 0.9, 10) + 0.1

        // Color
        const color = new Color()
        color.setHSL(Math.random(), 1, 0.5 + Math.random() * 0.5)
        colorArray[iStride3] = color.r
        colorArray[iStride3 + 1] = color.g
        colorArray[iStride3 + 2] = color.b
      }

      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute(positionArray, 3))
      geometry.setAttribute('aSize', new Float32BufferAttribute(sizeArray, 1))
      geometry.setAttribute('aColor', new Float32BufferAttribute(colorArray, 3))

      // Dispose of old one
      if (this.stars.geometry) {
        this.stars.geometry.dispose()
        this.stars.points.geometry = this.stars.geometry
      }

      this.stars.geometry = geometry
    }

    // Geometry
    this.stars.update()

    // Material
    // this.stars.material = new PointsMaterial({ size: 5, sizeAttenuation: false })
    this.stars.material = new StarsMaterial()
    this.stars.material.uniforms.uHeightFragments.value = this.view.viewport.height * this.view.viewport.clampedPixelRatio

    // Points
    this.stars.points = new Points(this.stars.geometry, this.stars.material)
    this.group.add(this.stars.points)
  }

  setDebug() {
    const debug = this.view.debug
    if (!debug.gui)
      return

    // Stars
    const starsFolder = debug.getFolder('view/sky/stars')

    starsFolder.add(this.stars, 'count').min(100).max(50000).step(100).name('count').onChange(() => { this.stars.update() })
    starsFolder.add(this.stars.material.uniforms.uSize, 'value').min(0).max(1).step(0.0001).name('uSize')
    starsFolder.add(this.stars.material.uniforms.uBrightness, 'value').min(0).max(1).step(0.001).name('uBrightness')
  }

  update(deltaTime, elapsedTime) {
    const sunState = this.view.state.sun
    const playerState = this.view.state.player
    const camera = this.view.camera

    // Background
    this.background.mesh.material.uniforms.sunPosition.value.set(...sunState.position)

    // Auroras
    const aurorasUniforms = this.auroras.mesh.material.uniforms
    aurorasUniforms.uTime.value = this.view.clock.elapsed
    aurorasUniforms.uCameraPosition.value.copy(camera.position)
    aurorasUniforms.uIntensity.value = sunState.intensity

    // Group
    this.group.position.set(
      playerState.position[0],
      playerState.position[1],
      playerState.position[2]
    )

    // Sun
    this.sun.mesh.position.set(
      sunState.position[0] * this.sun.distance,
      sunState.position[1] * this.sun.distance,
      sunState.position[2] * this.sun.distance
    )
    this.sun.mesh.lookAt(
      playerState.position[0],
      playerState.position[1],
      playerState.position[2]
    )
    this.lensflare.visible = sunState.intensity < 0.5 ? false : true

    // Cloud
    // const cloudUniforms = this.cloud.mesh.material.uniforms
    // cloudUniforms.time.value = elapsedTime
    // cloudUniforms.cameraPosition.value.copy(camera.position)

    // Stars
    const starsUniforms = this.stars.material.uniforms
    starsUniforms.uSunPosition.value.set(sunState.position[0], sunState.position[1], sunState.position[2])
    starsUniforms.uHeightFragments.value = this.view.viewport.height * this.view.viewport.pixelRatio
  }

  resize(width, height) {
    this.auroras.mesh.material.uniforms.uResolution.value.set(width, height)
  }
}
