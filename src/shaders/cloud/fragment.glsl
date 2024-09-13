uniform float time;
uniform vec3 cloudColor;
uniform vec3 skyColor;
uniform float noiseScale;

varying vec3 vRd;
varying vec2 vUv;

// Perlin Noise Function (simplified for the example)
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Generate cloud shape in 3D space using the position of the box's surface
float cloud(vec3 p) {
  float n = noise(p.xy * noiseScale + vec2(time * 0.05, time * 0.05));
  return smoothstep(0.5, 0.6, n); // Threshold to create cartoon-like look
}

void main() {
  vec3 p = vRd; // Position on the box

  float clouds = cloud(p); // Generate cloud pattern based on 3D position

  // Mix between sky and cloud color for an anime-style effect
  vec3 color = mix(skyColor, cloudColor, clouds);

  gl_FragColor = vec4(color, 1.0);
}
