import App from "./App"

const app = new App()

window.addEventListener('beforeunload', app.destroy, false)

app.init()

document.body.addEventListener('mousedown', function() {
  document.body.classList.add('grabbing')
})

document.body.addEventListener('mouseup', function() {
  document.body.classList.remove('grabbing')
})