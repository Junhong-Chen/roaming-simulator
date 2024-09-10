import App from "./App"

const app = new App()

window.addEventListener('beforeunload', app.destroy, false)

app.init()