import { PlaneGeometry, RawShaderMaterial, Mesh, Uniform, LoadingManager } from "three"
import gsap from "gsap"
import vertexShader from "../shaders/loading/vertex.vs.glsl"
import fragmentShader from "../shaders/loading/fragment.fs.glsl"

export default class Loading {
  constructor(scene) {
    const loadingBar = document.querySelector('#loading-bar')
    const geometry = new PlaneGeometry(2, 2, 1, 1)
    const material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uAlpha: new Uniform(0.1)
      },
      transparent: true,
      depthWrite: false
    })

    const overlay = new Mesh(geometry, material)
    scene.add(overlay)

    this.manager = new LoadingManager(
      () => { // onLoad
        gsap.delayedCall(.5, () => {
          gsap.to(material.uniforms.uAlpha, {
            duration: 3,
            value: 0
          })
          loadingBar.style.transform = ''
          loadingBar.classList.add('ended')
        })
      },
      (_, loaded, total) => { // onProgress
        loadingBar.style.transform = `scale(${loaded / total})`
      }
    )
  }

  destroy() {}
}