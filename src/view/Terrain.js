import { BufferGeometry, BufferAttribute, Float32BufferAttribute, DataTexture, Mesh, RGBAFormat, FloatType, UVMapping, ClampToEdgeWrapping, LinearFilter } from "three"

export default class Terrain {
  constructor(view, terrains, terrainState) {
    this.view = view

    this.terrains = terrains
    this.terrainState = terrainState
    this.terrainState.renderInstance = this

    this.created = false

    this.terrainState.on('ready', () => {
      this.create()
    })
  }

  create() {
    const terrainsState = this.view.state.terrains

    // Recreate
    if (this.created) {
      // Dispose of old geometry
      this.geometry.dispose()

      // Create new geometry
      this.geometry = new BufferGeometry()
      this.geometry.setAttribute('position', new BufferAttribute(this.terrainState.positions, 3))
      this.geometry.index = new BufferAttribute(this.terrainState.indices, 1, false)

      this.mesh.geometry = this.geometry
    }

    // Create
    else {
      // Create geometry
      this.geometry = new BufferGeometry()
      this.geometry.setAttribute('position', new Float32BufferAttribute(this.terrainState.positions, 3))
      this.geometry.setAttribute('uv', new Float32BufferAttribute(this.terrainState.uv, 2))
      this.geometry.index = new BufferAttribute(this.terrainState.indices, 1, false)

      // Texture
      this.texture = new DataTexture(
        this.terrainState.texture,
        terrainsState.segments,
        terrainsState.segments,
        RGBAFormat,
        FloatType,
        UVMapping,
        ClampToEdgeWrapping,
        ClampToEdgeWrapping,
        LinearFilter,
        LinearFilter
      )
      this.texture.flipY = false
      this.texture.needsUpdate = true

      // // Material
      // this.material = this.terrains.material.clone()
      // this.material.uniforms.uTexture.value = this.texture

      // Create mesh
      this.mesh = new Mesh(this.geometry, this.terrains.material)
      this.mesh.userData.texture = this.texture
      // this.mesh = new Mesh(this.geometry, new MeshNormalMaterial())
      this.view.scene.add(this.mesh)

      this.created = true
    }
  }

  update() { }

  destroy() {
    if (this.created) {
      this.geometry.dispose()
      this.view.scene.remove(this.mesh)
    }
  }
}