import glsl from "vite-plugin-glsl"
import path from "path"

const dirname = path.resolve()

/** @type {import('vite').UserConfig} */
export default {
  base: process.env.npm_package_name,
  resolve:
  {
    alias:
    {
      '@': path.resolve(dirname, './src')
    }
  },
  plugins: [glsl()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
}