"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@infinity/ui/lib/utils"

const VERTEX = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

// A sheet of satin: a slowly moving height field made of a few warped sine folds, lit from the top left.
// The fold's slope picks a colour between the shadow and fabric tones, and a tight specular term adds
// the bright sheen along each crest.
const FRAGMENT = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_scale;
uniform float u_rotation;
uniform float u_frequency;
uniform vec3 u_shadow;
uniform vec3 u_fabric;
uniform vec3 u_sheen;

float folds(vec2 p, float t) {
  vec2 q = p;
  q.y += 0.38 * sin(q.x * 0.85 + t * 0.55) + 0.18 * sin(q.x * 1.9 - t * 0.35);
  q.x += 0.22 * sin(q.y * 1.25 + t * 0.45);
  float h = sin(q.y * u_frequency * 1.5 + 0.7 * sin(q.x * 0.7 + t * 0.6));
  h += 0.45 * sin(q.y * u_frequency * 2.7 + q.x * 0.55 - t * 0.8);
  h += 0.18 * sin((q.x + q.y) * u_frequency * 4.3 + t * 1.05);
  return h;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float c = cos(u_rotation);
  float s = sin(u_rotation);
  vec2 p = mat2(c, -s, s, c) * uv * u_scale;
  float t = u_time;

  float e = 0.003;
  float h = folds(p, t);
  float dx = (folds(p + vec2(e, 0.0), t) - h) / e;
  float dy = (folds(p + vec2(0.0, e), t) - h) / e;
  vec3 normal = normalize(vec3(-dx * 0.32, -dy * 0.32, 1.0));

  vec3 light = normalize(vec3(-0.45, 0.65, 0.6));
  float diffuse = clamp(dot(normal, light), 0.0, 1.0);
  float specular = pow(clamp(dot(normal, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0, 1.0), 48.0);

  vec3 color = mix(u_shadow, u_fabric, smoothstep(0.15, 0.9, diffuse));
  color += u_sheen * (specular * 0.9 + pow(diffuse, 6.0) * 0.3);

  // Dither to keep the dark gradients from banding.
  color += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(color, 1.0);
}
`

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

export type SilkWavesProps = {
  /** Deepest folds. */
  shadow?: string
  /** The fabric's lit colour. */
  fabric?: string
  /** Highlight along the crests. */
  sheen?: string
  speed?: number
  /** Zoom: higher shows more, smaller folds. */
  scale?: number
  /** Angle of the folds, in degrees. */
  rotation?: number
  /** Stripe density of the folds. */
  frequency?: number
  className?: string
}

/**
 * Animated WebGL silk that fills its positioned parent. Pauses off screen and in background tabs,
 * draws one still frame for reduced-motion users, and renders nothing if WebGL is unavailable.
 */
export function SilkWaves({
  shadow = "#06060a",
  fabric = "#432dd7", // --primary
  sheen = "#a29eff", // a light tint of --primary
  speed = 1,
  scale = 2.2,
  rotation = -32,
  frequency = 1,
  className,
}: SilkWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext("webgl", { antialias: false, powerPreference: "low-power" })
    if (!canvas || !gl) return

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
    if (!vertex || !fragment) return
    const program = gl.createProgram()!
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    // One triangle that covers the viewport.
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a_pos")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uniform = (name: string) => gl.getUniformLocation(program, name)
    gl.uniform1f(uniform("u_scale"), scale)
    gl.uniform1f(uniform("u_rotation"), (rotation * Math.PI) / 180)
    gl.uniform1f(uniform("u_frequency"), frequency)
    gl.uniform3fv(uniform("u_shadow"), hexToRgb(shadow))
    gl.uniform3fv(uniform("u_fabric"), hexToRgb(fabric))
    gl.uniform3fv(uniform("u_sheen"), hexToRgb(sheen))
    const uRes = uniform("u_res")
    const uTime = uniform("u_time")

    const resize = () => {
      // Silk is soft, so rendering above 1x device pixels only costs GPU time.
      const ratio = Math.min(window.devicePixelRatio || 1, 1)
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }

    // Start mid-motion so the first (and, for reduced motion, only) frame is already a good drape.
    const offset = 12
    const start = performance.now()
    const draw = (now: number) => {
      gl.uniform1f(uTime, offset + ((now - start) / 1000) * 0.35 * speed)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    let onScreen = true
    const loop = (now: number) => {
      draw(now)
      frame = requestAnimationFrame(loop)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      if (!reduced && onScreen && !document.hidden) frame = requestAnimationFrame(loop)
    }

    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw(performance.now())
    })
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    visibility.observe(canvas)
    document.addEventListener("visibilitychange", sync)

    resize()
    draw(start)
    setReady(true)
    sync()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      document.removeEventListener("visibilitychange", sync)
      // Not loseContext(): the canvas outlives a dev-mode effect re-run and would come back dead.
      gl.deleteProgram(program)
    }
  }, [shadow, fabric, sheen, speed, scale, rotation, frequency])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 size-full transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0", className)}
    />
  )
}
