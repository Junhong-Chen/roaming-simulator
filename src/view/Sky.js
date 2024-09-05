import { BufferGeometry, CircleGeometry, Color, Float32BufferAttribute, Mesh, MeshBasicMaterial, Points, Scene, Vector3, WebGLRenderTarget, Group, BoxGeometry, TextureLoader } from "three"

import SkyBackgroundMaterial from "../materials/SkyBackgroundMaterial.js"
import StarsMaterial from "../materials/StarsMaterial.js"
import { Lensflare, LensflareElement } from "three/examples/jsm/Addons.js"

export default class Sky {
  constructor(view) {
    this.view = view

    this.outerDistance = 1000

    this.group = new Group()
    this.view.scene.add(this.group)

    this.setCustomRender()
    this.setBackground()
    this.setSun()
    this.setStars()
    this.setDebug()
  }

  setCustomRender() {
    this.customRender = {}
    this.customRender.scene = new Scene()
    this.customRender.camera = this.view.camera.clone()
    this.customRender.resolutionRatio = 0.1 // 分辨率降低到屏幕分辨率的 10%
    this.customRender.renderTarget = new WebGLRenderTarget(
      this.view.viewport.width * this.customRender.resolutionRatio,
      this.view.viewport.height * this.customRender.resolutionRatio,
      {
        generateMipmaps: false
      }
    )
    this.customRender.texture = this.customRender.renderTarget.texture
  }

  setBackground() {
    this.background = new Mesh(
      new BoxGeometry(1, 1, 1),
      new SkyBackgroundMaterial()
    )

    this.background.scale.setScalar(10000)
    this.group.add(this.background)
  }

  setSun() {
    this.sun = {}
    this.sun.distance = this.outerDistance - 50

    const geometry = new CircleGeometry(0.02 * this.sun.distance, 32)
    const material = new MeshBasicMaterial({ color: 0xffffff })
    this.sun.mesh = new Mesh(geometry, material)
    this.group.add(this.sun.mesh)

    // 光晕
    const textureFlare = new TextureLoader().load('/textures/lensflare.png')
    const lensflare = new Lensflare()
    lensflare.addElement(new LensflareElement(textureFlare, 20, 0.75, new Color(0x33ff33)))
    lensflare.addElement(new LensflareElement(textureFlare, 100, 0.8), new Color(0xffff00))
    lensflare.addElement(new LensflareElement(textureFlare, 30, 1, new Color(0x48c9b0)))

    this.sun.mesh.add(lensflare)
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

    // Sphere
    const sphereGeometryFolder = debug.getFolder('view/sky/sphere/geometry')

    sphereGeometryFolder.add(this.sphere, 'widthSegments').min(4).max(512).step(1).name('widthSegments').onChange(() => { this.sphere.update() })
    sphereGeometryFolder.add(this.sphere, 'heightSegments').min(4).max(512).step(1).name('heightSegments').onChange(() => { this.sphere.update() })

    const sphereMaterialFolder = debug.getFolder('view/sky/sphere/material')

    sphereMaterialFolder.add(this.sphere.material.uniforms.uAtmosphereElevation, 'value').min(0).max(5).step(0.01).name('uAtmosphereElevation')
    sphereMaterialFolder.add(this.sphere.material.uniforms.uAtmospherePower, 'value').min(0).max(20).step(1).name('uAtmospherePower')
    sphereMaterialFolder.addColor(this.sphere.material.uniforms.uColorDayCycleLow, 'value').name('uColorDayCycleLow')
    sphereMaterialFolder.addColor(this.sphere.material.uniforms.uColorDayCycleHigh, 'value').name('uColorDayCycleHigh')
    sphereMaterialFolder.addColor(this.sphere.material.uniforms.uColorNightLow, 'value').name('uColorNightLow')
    sphereMaterialFolder.addColor(this.sphere.material.uniforms.uColorNightHigh, 'value').name('uColorNightHigh')
    sphereMaterialFolder.add(this.sphere.material.uniforms.uDawnAngleAmplitude, 'value').min(0).max(1).step(0.001).name('uDawnAngleAmplitude')
    sphereMaterialFolder.add(this.sphere.material.uniforms.uDawnElevationAmplitude, 'value').min(0).max(1).step(0.01).name('uDawnElevationAmplitude')
    sphereMaterialFolder.addColor(this.sphere.material.uniforms.uColorDawn, 'value').name('uColorDawn')
    sphereMaterialFolder.add(this.sphere.material.uniforms.uSunAmplitude, 'value').min(0).max(3).step(0.01).name('uSunAmplitude')
    sphereMaterialFolder.add(this.sphere.material.uniforms.uSunMultiplier, 'value').min(0).max(1).step(0.01).name('uSunMultiplier')
    sphereMaterialFolder.addColor(this.sphere.material.uniforms.uColorSun, 'value').name('uColorSun')

    // Stars
    const starsFolder = debug.getFolder('view/sky/stars')

    starsFolder.add(this.stars, 'count').min(100).max(50000).step(100).name('count').onChange(() => { this.stars.update() })
    starsFolder.add(this.stars.material.uniforms.uSize, 'value').min(0).max(1).step(0.0001).name('uSize')
    starsFolder.add(this.stars.material.uniforms.uBrightness, 'value').min(0).max(1).step(0.001).name('uBrightness')
  }

  update() {
    const dayState = this.view.state.day
    const sunState = this.view.state.sun
    const playerState = this.view.state.player

    // Group
    this.group.position.set(
      playerState.position.current[0],
      playerState.position.current[1],
      playerState.position.current[2]
    )

    // Sun
    this.sun.mesh.position.set(
      sunState.position.x * this.sun.distance,
      sunState.position.y * this.sun.distance,
      sunState.position.z * this.sun.distance
    )
    this.sun.mesh.lookAt(
      playerState.position.current[0],
      playerState.position.current[1],
      playerState.position.current[2]
    )

    // Stars
    this.stars.material.uniforms.uSunPosition.value.set(sunState.position.x, sunState.position.y, sunState.position.z)
    this.stars.material.uniforms.uHeightFragments.value = this.view.viewport.height * this.view.viewport.clampedPixelRatio

    // Render in render target
    this.customRender.camera.quaternion.copy(this.view.camera.quaternion)
    const renderer = this.view.renderer
    renderer.setRenderTarget(this.customRender.renderTarget)
    renderer.render(this.customRender.scene, this.customRender.camera)
    renderer.setRenderTarget(null)

    this.background.material.uniforms.sunPosition.value.copy(sunState.position)
  }

  resize() {
    this.customRender.renderTarget.width = this.view.viewport.width * this.customRender.resolutionRatio
    this.customRender.renderTarget.height = this.view.viewport.height * this.customRender.resolutionRatio
  }
}
