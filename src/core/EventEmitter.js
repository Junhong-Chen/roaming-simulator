export default class EventEmitter {
  #callbacks = new Map()

  constructor() { }

  /**
   * @methed listen
   * @param {string} type
   * @param {function} callback
   * @returns {EventEmitter} this
   */
  on(type, callback) {
    if (!this.#callbacks.has(type)) {
      this.#callbacks.set(type, [])
    }
    this.#callbacks.get(type).push(callback)
    return this
  }

  /**
   * @methed unlisten
   * @param {string} type
   * @param {function | undefined} [callback]
   * @returns {EventEmitter} this
   */
  off(type, callback) {
    if (this.#callbacks.has(type)) {
      if (!callback) {
        this.#callbacks.delete(type)
      } else {
        const fns = this.#callbacks.get(type)
        const i = fns.findIndex(el => el === cb)
        if (i > -1) {
          fns.splice(i, 1)
        }
      }
    }
    return this
  }

  /**
   * @methed emit
   * @param {string} type 
   * @returns 
   */
  emit(type) {
    const fns = this.#callbacks.get(type)
    if (fns) {
      const args = [...arguments].splice(1)
      for (const fn of fns) {
        fn(...args)
      }
    }
  }
}