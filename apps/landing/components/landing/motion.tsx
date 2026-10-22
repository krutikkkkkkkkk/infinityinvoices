"use client"

import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function useInView<T extends Element>({ once = false, rootMargin = "0px 0px -10% 0px" } = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once, rootMargin])

  return [ref, inView] as const
}

/** Steps through 0..length-1 on an interval while active. Holds at 0 for reduced-motion users. */
export function useCycle(length: number, ms: number, active = true) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active || prefersReducedMotion()) return
    const id = setInterval(() => setIndex((i) => (i + 1) % length), ms)
    return () => clearInterval(id)
  }, [length, ms, active])

  return index
}

/** Eases a number from 0 to `target` once `active` turns true. */
export function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, duration])

  return value
}

const InViewContext = createContext(true)

export function useParentInView() {
  return useContext(InViewContext)
}

/**
 * Marks a block with data-inview so CSS animations inside it only run while visible.
 * With `reveal`, the block also fades up the first time it scrolls into view.
 */
export function InView({
  children,
  className,
  reveal = false,
  style,
}: {
  children: ReactNode
  className?: string
  reveal?: boolean
  style?: CSSProperties
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [seen, setSeen] = useState(false)
  if (inView && !seen) setSeen(true)

  return (
    <div
      ref={ref}
      data-inview={reveal ? String(seen) : String(inView)}
      data-reveal={reveal ? "" : undefined}
      className={className}
      style={style}
    >
      <InViewContext.Provider value={inView}>{children}</InViewContext.Provider>
    </div>
  )
}
