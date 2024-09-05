export function remap(value, minIn, maxIn, minOut, maxOut) {
  return minOut + (maxOut - minOut) * (value - minIn) / (maxIn - minIn)
}

export function smoothstep(min, max, value) {
  var t = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return t * t * (3 - 2 * t)
};